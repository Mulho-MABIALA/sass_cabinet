import Stripe from "stripe";
import { Plan } from "@prisma/client";
import { facturationRepository } from "./facturation.repository";
import { utilisateursRepository } from "../utilisateurs/utilisateurs.repository";
import { paiementProvider } from "./paiement/PaiementProvider";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";
import { BadRequestError, NotFoundError } from "../../shared/AppError";

export interface UsageMoisVue {
  annee: number;
  mois: number;
  dossiersTraites: number;
  montantEstime: number;
}

export interface UsageResume {
  plan: Plan;
  moisCourant: UsageMoisVue;
  moisPrecedents: UsageMoisVue[];
}

// Seul le plan "starter" est facturé à l'usage (4€/dossier par défaut) ;
// les plans "cabinet" et "premium" sont des forfaits, l'usage reste informatif.
function calculerMontant(plan: Plan, dossiersTraites: number): number {
  if (plan !== "starter") return 0;
  return dossiersTraites * env.FACTURATION_PRIX_DOSSIER_STARTER;
}

export const facturationService = {
  async enregistrerDossierComplet(cabinetId: string): Promise<void> {
    const maintenant = new Date();
    await facturationRepository.incrementerUsage(
      cabinetId,
      maintenant.getFullYear(),
      maintenant.getMonth() + 1
    );
  },

  async getUsage(cabinetId: string): Promise<UsageResume> {
    const cabinet = await facturationRepository.findCabinetPlan(cabinetId);
    if (!cabinet) {
      throw new NotFoundError("Cabinet introuvable");
    }

    const maintenant = new Date();
    const anneeCourante = maintenant.getFullYear();
    const moisCourantNum = maintenant.getMonth() + 1;

    const derniers = await facturationRepository.findDerniersMois(cabinetId, 4);
    const vues: UsageMoisVue[] = derniers.map((usage) => ({
      annee: usage.annee,
      mois: usage.mois,
      dossiersTraites: usage.dossiersTraites,
      montantEstime: calculerMontant(cabinet.plan, usage.dossiersTraites),
    }));

    const moisCourant = vues.find(
      (v) => v.annee === anneeCourante && v.mois === moisCourantNum
    ) ?? {
      annee: anneeCourante,
      mois: moisCourantNum,
      dossiersTraites: 0,
      montantEstime: 0,
    };

    const moisPrecedents = vues
      .filter((v) => !(v.annee === anneeCourante && v.mois === moisCourantNum))
      .slice(0, 3);

    return { plan: cabinet.plan, moisCourant, moisPrecedents };
  },

  // Correspondance plan <-> price Stripe (produit + prix récurrent créés côté dashboard Stripe).
  priceIdPourPlan(plan: Plan): string | undefined {
    return { starter: env.STRIPE_PRICE_STARTER, cabinet: env.STRIPE_PRICE_CABINET, premium: env.STRIPE_PRICE_PREMIUM }[
      plan
    ];
  },

  async creerSessionCheckout(
    cabinetId: string,
    userId: string,
    plan: Plan
  ): Promise<{ url: string }> {
    const priceId = facturationService.priceIdPourPlan(plan);
    if (!priceId) {
      throw new BadRequestError(
        `Aucun prix Stripe configuré pour le plan "${plan}" (variable STRIPE_PRICE_${plan.toUpperCase()} manquante)`
      );
    }

    const cabinet = await facturationRepository.findCabinetPourPaiement(cabinetId);
    if (!cabinet) {
      throw new NotFoundError("Cabinet introuvable");
    }

    let customerId = cabinet.stripeCustomerId;
    if (!customerId) {
      const utilisateur = await utilisateursRepository.findById(userId);
      if (!utilisateur) {
        throw new NotFoundError("Utilisateur introuvable");
      }
      customerId = await paiementProvider.creerClient(utilisateur.email, cabinet.nom);
      await facturationRepository.updateStripeCustomerId(cabinetId, customerId);
    }

    return paiementProvider.creerSessionCheckout(
      customerId,
      priceId,
      `${env.FRONTEND_URL}/facturation?checkout=succes`,
      `${env.FRONTEND_URL}/facturation?checkout=annule`,
      { cabinetId, plan }
    );
  },

  async creerSessionPortail(cabinetId: string): Promise<{ url: string }> {
    const cabinet = await facturationRepository.findCabinetPourPaiement(cabinetId);
    if (!cabinet?.stripeCustomerId) {
      throw new BadRequestError("Aucun abonnement Stripe actif pour ce cabinet");
    }
    return paiementProvider.creerSessionPortail(cabinet.stripeCustomerId, `${env.FRONTEND_URL}/facturation`);
  },

  // Traite les événements Stripe (paiement réussi, échec de facture, résiliation) pour tenir à jour
  // Cabinet.statutAbonnement — indicatif pour l'instant, ne bloque aucun accès applicatif.
  async traiterWebhook(payload: Buffer, signature: string): Promise<void> {
    const event = paiementProvider.verifierSignatureWebhook(payload, signature);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string | null;
        if (!customerId) break;

        const cabinet = await facturationRepository.findCabinetByStripeCustomerId(customerId);
        if (!cabinet) {
          logger.warn(`Webhook Stripe : aucun cabinet trouvé pour le client ${customerId}`);
          break;
        }

        const planMetadata = session.metadata?.plan;
        const plan =
          planMetadata === "starter" || planMetadata === "cabinet" || planMetadata === "premium"
            ? planMetadata
            : undefined;

        await facturationRepository.updateAbonnement(cabinet.id, {
          statutAbonnement: "actif",
          stripeSubscriptionId: (session.subscription as string | null) ?? undefined,
          plan,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string | null;
        if (!customerId) break;

        const cabinet = await facturationRepository.findCabinetByStripeCustomerId(customerId);
        if (!cabinet) break;

        await facturationRepository.updateAbonnement(cabinet.id, { statutAbonnement: "impaye" });
        logger.warn(`Facture impayée pour le cabinet ${cabinet.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string | null;
        if (!customerId) break;

        const cabinet = await facturationRepository.findCabinetByStripeCustomerId(customerId);
        if (!cabinet) break;

        await facturationRepository.updateAbonnement(cabinet.id, { statutAbonnement: "annule" });
        break;
      }

      default:
        // Événement non géré : ignoré volontairement (on ne s'abonne qu'aux types listés dans le
        // webhook Stripe, voir .env.example).
        break;
    }
  },
};
