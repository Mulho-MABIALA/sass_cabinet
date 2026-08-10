import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { authService } from "./auth.service";
import { utilisateursRepository } from "../utilisateurs/utilisateurs.repository";
import { verifyAccessToken } from "../../shared/jwt";

vi.mock("../utilisateurs/utilisateurs.repository", () => ({
  utilisateursRepository: {
    findByEmailAvecCabinet: vi.fn(),
    findByIdAvecCabinet: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn() },
}));

const utilisateurActif = {
  id: "u1",
  email: "admin@cabinet.fr",
  motDePasseHash: "hash",
  role: "admin" as const,
  cabinetId: "c1",
  createdAt: new Date(),
  cabinet: { actif: true },
};

const utilisateurCabinetSuspendu = {
  ...utilisateurActif,
  cabinet: { actif: false },
};

describe("authService.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renvoie des tokens valides quand l'email et le mot de passe sont corrects", async () => {
    vi.mocked(utilisateursRepository.findByEmailAvecCabinet).mockResolvedValue(utilisateurActif);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const tokens = await authService.login({
      email: "admin@cabinet.fr",
      motDePasse: "bonMotDePasse",
    });

    expect(tokens.user.cabinetId).toBe("c1");
    expect(verifyAccessToken(tokens.accessToken).cabinetId).toBe("c1");
  });

  it("rejette un mot de passe incorrect sans révéler si l'email existe", async () => {
    vi.mocked(utilisateursRepository.findByEmailAvecCabinet).mockResolvedValue(utilisateurActif);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      authService.login({ email: "admin@cabinet.fr", motDePasse: "mauvais" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rejette un email inconnu avec le même message générique", async () => {
    vi.mocked(utilisateursRepository.findByEmailAvecCabinet).mockResolvedValue(null);

    await expect(
      authService.login({ email: "inconnu@cabinet.fr", motDePasse: "peu importe" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("bloque la connexion si le cabinet a été suspendu par la console plateforme", async () => {
    vi.mocked(utilisateursRepository.findByEmailAvecCabinet).mockResolvedValue(
      utilisateurCabinetSuspendu
    );
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(
      authService.login({ email: "admin@cabinet.fr", motDePasse: "bonMotDePasse" })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe("authService.refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejette un refresh token invalide", async () => {
    await expect(authService.refresh({ refreshToken: "token_invalide" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("bloque le rafraîchissement si le cabinet a été suspendu entre-temps", async () => {
    const { generateRefreshToken } = await import("../../shared/jwt");
    const refreshToken = generateRefreshToken({ userId: "u1" });

    vi.mocked(utilisateursRepository.findByIdAvecCabinet).mockResolvedValue(
      utilisateurCabinetSuspendu
    );

    await expect(authService.refresh({ refreshToken })).rejects.toMatchObject({ statusCode: 403 });
  });
});
