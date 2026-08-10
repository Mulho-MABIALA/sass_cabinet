import { randomUUID } from "crypto";
import Stripe from "stripe";
import { env } from "../../../config/env";

export interface SessionUrl {
  url: string;
}

// Interface à implémenter par un vrai prestataire de paiement (Stripe ici).
export interface PaiementProvider {
  creerClient(email: string, nom: string): Promise<string>;
  creerSessionCheckout(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string>
  ): Promise<SessionUrl>;
  creerSessionPortail(customerId: string, returnUrl: string): Promise<SessionUrl>;
  verifierSignatureWebhook(payload: Buffer, signature: string): Stripe.Event;
}

// Implémentation factice : aucun appel réseau, renvoie des URLs simulées. Utilisée si STRIPE_SECRET_KEY
// n'est pas configuré, pour que le développement reste possible sans compte Stripe.
export class StubPaiementProvider implements PaiementProvider {
  async creerClient(_email: string, _nom: string): Promise<string> {
    return `cus_stub_${randomUUID()}`;
  }

  async creerSessionCheckout(
    customerId: string,
    priceId: string,
    successUrl: string
  ): Promise<SessionUrl> {
    return { url: `${successUrl}&stub=1&customer=${customerId}&price=${priceId}` };
  }

  async creerSessionPortail(_customerId: string, returnUrl: string): Promise<SessionUrl> {
    return { url: `${returnUrl}?stub=1` };
  }

  verifierSignatureWebhook(): Stripe.Event {
    throw new Error("StubPaiementProvider : webhook non applicable sans Stripe configuré");
  }
}

// Provider réel : Stripe (mode test tant qu'aucune clé "live" n'est utilisée, gratuit).
export class StripePaiementProvider implements PaiementProvider {
  private readonly stripe: Stripe;

  constructor(secretKey: string, private readonly webhookSecret: string | undefined) {
    this.stripe = new Stripe(secretKey);
  }

  async creerClient(email: string, nom: string): Promise<string> {
    const client = await this.stripe.customers.create({ email, name: nom });
    return client.id;
  }

  async creerSessionCheckout(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string>
  ): Promise<SessionUrl> {
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      // Dupliqué sur l'abonnement lui-même : les webhooks invoice.payment_failed /
      // customer.subscription.deleted portent une Subscription, pas la Session d'origine.
      subscription_data: { metadata },
    });

    if (!session.url) {
      throw new Error("Stripe n'a pas renvoyé d'URL de session checkout");
    }
    return { url: session.url };
  }

  async creerSessionPortail(customerId: string, returnUrl: string): Promise<SessionUrl> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  verifierSignatureWebhook(payload: Buffer, signature: string): Stripe.Event {
    if (!this.webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET manquant : impossible de vérifier la signature du webhook");
    }
    return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }
}

export const paiementProvider: PaiementProvider = env.STRIPE_SECRET_KEY
  ? new StripePaiementProvider(env.STRIPE_SECRET_KEY, env.STRIPE_WEBHOOK_SECRET)
  : new StubPaiementProvider();
