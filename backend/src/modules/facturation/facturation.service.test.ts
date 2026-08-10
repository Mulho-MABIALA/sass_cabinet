import { beforeEach, describe, expect, it, vi } from "vitest";
import { facturationService } from "./facturation.service";
import { facturationRepository } from "./facturation.repository";
import { utilisateursRepository } from "../utilisateurs/utilisateurs.repository";
import { paiementProvider } from "./paiement/PaiementProvider";

vi.mock("./facturation.repository", () => ({
  facturationRepository: {
    incrementerUsage: vi.fn(),
    findDerniersMois: vi.fn(),
    findCabinetPlan: vi.fn(),
    findCabinetPourPaiement: vi.fn(),
    findCabinetByStripeCustomerId: vi.fn(),
    updateStripeCustomerId: vi.fn(),
    updateAbonnement: vi.fn(),
  },
}));

vi.mock("../utilisateurs/utilisateurs.repository", () => ({
  utilisateursRepository: { findById: vi.fn() },
}));

vi.mock("./paiement/PaiementProvider", () => ({
  paiementProvider: {
    creerClient: vi.fn(),
    creerSessionCheckout: vi.fn(),
    creerSessionPortail: vi.fn(),
    verifierSignatureWebhook: vi.fn(),
  },
}));

describe("facturationService.getUsage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("facture le plan starter à l'usage (4€/dossier par défaut)", async () => {
    vi.mocked(facturationRepository.findCabinetPlan).mockResolvedValue({ plan: "starter" } as never);
    vi.mocked(facturationRepository.findDerniersMois).mockResolvedValue([
      { id: "u1", cabinetId: "c1", annee: 2026, mois: 8, dossiersTraites: 10 },
    ] as never);

    const usage = await facturationService.getUsage("c1");

    expect(usage.moisCourant.montantEstime).toBe(40);
  });

  it("ne facture pas à l'usage les plans forfaitaires (cabinet/premium)", async () => {
    vi.mocked(facturationRepository.findCabinetPlan).mockResolvedValue({ plan: "cabinet" } as never);
    vi.mocked(facturationRepository.findDerniersMois).mockResolvedValue([
      { id: "u1", cabinetId: "c1", annee: 2026, mois: 8, dossiersTraites: 25 },
    ] as never);

    const usage = await facturationService.getUsage("c1");

    expect(usage.moisCourant.montantEstime).toBe(0);
  });
});

describe("facturationService.creerSessionCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("réutilise le client Stripe existant du cabinet sans en recréer un", async () => {
    vi.mocked(facturationRepository.findCabinetPourPaiement).mockResolvedValue({
      id: "c1",
      nom: "Cabinet Test",
      plan: "starter",
      stripeCustomerId: "cus_existant",
      statutAbonnement: "essai",
    } as never);
    vi.mocked(paiementProvider.creerSessionCheckout).mockResolvedValue({ url: "https://stripe.test/session" });

    const session = await facturationService.creerSessionCheckout("c1", "u1", "starter");

    expect(paiementProvider.creerClient).not.toHaveBeenCalled();
    expect(paiementProvider.creerSessionCheckout).toHaveBeenCalledWith(
      "cus_existant",
      "price_test_starter",
      expect.any(String),
      expect.any(String),
      { cabinetId: "c1", plan: "starter" }
    );
    expect(session.url).toBe("https://stripe.test/session");
  });

  it("crée un client Stripe et l'enregistre si le cabinet n'en a pas encore", async () => {
    vi.mocked(facturationRepository.findCabinetPourPaiement).mockResolvedValue({
      id: "c1",
      nom: "Cabinet Test",
      plan: "starter",
      stripeCustomerId: null,
      statutAbonnement: "essai",
    } as never);
    vi.mocked(utilisateursRepository.findById).mockResolvedValue({
      id: "u1",
      email: "admin@cabinet.fr",
      cabinetId: "c1",
      role: "admin",
      motDePasseHash: "hash",
      createdAt: new Date(),
    } as never);
    vi.mocked(paiementProvider.creerClient).mockResolvedValue("cus_nouveau");
    vi.mocked(paiementProvider.creerSessionCheckout).mockResolvedValue({ url: "https://stripe.test/session" });

    await facturationService.creerSessionCheckout("c1", "u1", "starter");

    expect(paiementProvider.creerClient).toHaveBeenCalledWith("admin@cabinet.fr", "Cabinet Test");
    expect(facturationRepository.updateStripeCustomerId).toHaveBeenCalledWith("c1", "cus_nouveau");
  });

  it("rejette un plan sans prix Stripe configuré (variable d'env manquante)", async () => {
    await expect(facturationService.creerSessionCheckout("c1", "u1", "premium")).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(facturationRepository.findCabinetPourPaiement).not.toHaveBeenCalled();
  });
});

describe("facturationService.traiterWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("active l'abonnement du cabinet à la réception de checkout.session.completed", async () => {
    vi.mocked(paiementProvider.verifierSignatureWebhook).mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer: "cus_existant",
          subscription: "sub_123",
          metadata: { cabinetId: "c1", plan: "cabinet" },
        },
      },
    } as never);
    vi.mocked(facturationRepository.findCabinetByStripeCustomerId).mockResolvedValue({ id: "c1" } as never);

    await facturationService.traiterWebhook(Buffer.from("payload"), "signature_test");

    expect(facturationRepository.updateAbonnement).toHaveBeenCalledWith("c1", {
      statutAbonnement: "actif",
      stripeSubscriptionId: "sub_123",
      plan: "cabinet",
    });
  });

  it("marque l'abonnement impayé à la réception de invoice.payment_failed", async () => {
    vi.mocked(paiementProvider.verifierSignatureWebhook).mockReturnValue({
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_existant" } },
    } as never);
    vi.mocked(facturationRepository.findCabinetByStripeCustomerId).mockResolvedValue({ id: "c1" } as never);

    await facturationService.traiterWebhook(Buffer.from("payload"), "signature_test");

    expect(facturationRepository.updateAbonnement).toHaveBeenCalledWith("c1", {
      statutAbonnement: "impaye",
    });
  });
});
