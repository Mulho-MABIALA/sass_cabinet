import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculerStatutDossier, dossiersService } from "./dossiers.service";
import { dossiersRepository } from "./dossiers.repository";

vi.mock("./dossiers.repository", () => ({
  dossiersRepository: {
    findById: vi.fn(),
    findByCabinet: vi.fn(),
    create: vi.fn(),
    cloturer: vi.fn(),
    updateStatut: vi.fn(),
  },
}));

describe("calculerStatutDossier (logique métier pure)", () => {
  it("est incomplet si un document obligatoire est manquant", () => {
    const statut = calculerStatutDossier([
      { statut: "manquant", documentRequis: { obligatoire: true } },
      { statut: "valide", documentRequis: { obligatoire: false } },
    ]);
    expect(statut).toBe("incomplet");
  });

  it("est incomplet si un document obligatoire a été refusé, même si tout le reste est validé", () => {
    const statut = calculerStatutDossier([
      { statut: "refuse", documentRequis: { obligatoire: true } },
      { statut: "valide", documentRequis: { obligatoire: true } },
    ]);
    expect(statut).toBe("incomplet");
  });

  it("est en attente de vérification si tous les obligatoires sont déposés mais pas encore validés", () => {
    const statut = calculerStatutDossier([
      { statut: "depose", documentRequis: { obligatoire: true } },
      { statut: "valide", documentRequis: { obligatoire: true } },
    ]);
    expect(statut).toBe("en_attente_verification");
  });

  it("est complet quand tous les documents obligatoires sont validés", () => {
    const statut = calculerStatutDossier([
      { statut: "valide", documentRequis: { obligatoire: true } },
      { statut: "manquant", documentRequis: { obligatoire: false } },
    ]);
    expect(statut).toBe("complet");
  });
});

describe("dossiersService.getById (isolation multi-tenant)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("transmet bien le cabinetId de l'appelant au repository, pas seulement l'id du dossier", async () => {
    vi.mocked(dossiersRepository.findById).mockResolvedValue({ id: "d1" } as never);

    await dossiersService.getById("d1", "cabinet-a");

    expect(dossiersRepository.findById).toHaveBeenCalledWith("d1", "cabinet-a");
  });

  it("renvoie 404 (pas de fuite d'existence) quand le dossier appartient à un autre cabinet", async () => {
    // Simule le comportement réel du repository : la requête Prisma est scopée par cabinetId
    // (WHERE id = ... AND cabinetId = ...), donc un dossier d'un autre cabinet ressort comme "introuvable".
    vi.mocked(dossiersRepository.findById).mockResolvedValue(null);

    await expect(dossiersService.getById("d1", "cabinet-b")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
