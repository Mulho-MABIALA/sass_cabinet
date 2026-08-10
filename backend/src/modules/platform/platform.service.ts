import bcrypt from "bcrypt";
import { platformRepository } from "./platform.repository";
import { generatePlatformAccessToken } from "../../shared/jwt";
import { NotFoundError, UnauthorizedError } from "../../shared/AppError";
import { PlatformLoginInput, UpdateCabinetInput } from "./platform.schema";

export interface CabinetPlateformeVue {
  id: string;
  nom: string;
  secteur: string;
  plan: string;
  actif: boolean;
  statutAbonnement: string;
  createdAt: string;
  nbUtilisateurs: number;
  nbDossiers: number;
  dossiersTraitesMoisCourant: number;
}

export interface CabinetPlateformeDetail extends CabinetPlateformeVue {
  utilisateurs: Array<{ id: string; email: string; role: string; createdAt: string }>;
}

function moisCourant(): { annee: number; mois: number } {
  const maintenant = new Date();
  return { annee: maintenant.getFullYear(), mois: maintenant.getMonth() + 1 };
}

export const platformService = {
  async login(input: PlatformLoginInput): Promise<{ accessToken: string; email: string }> {
    const admin = await platformRepository.findAdminByEmail(input.email);
    if (!admin) {
      throw new UnauthorizedError("Identifiants invalides");
    }

    const motDePasseValide = await bcrypt.compare(input.motDePasse, admin.motDePasseHash);
    if (!motDePasseValide) {
      throw new UnauthorizedError("Identifiants invalides");
    }

    return { accessToken: generatePlatformAccessToken(admin.id), email: admin.email };
  },

  async listCabinets(): Promise<CabinetPlateformeVue[]> {
    const { annee, mois } = moisCourant();
    const cabinets = await platformRepository.findAllCabinets(annee, mois);

    return cabinets.map((cabinet) => ({
      id: cabinet.id,
      nom: cabinet.nom,
      secteur: cabinet.secteur,
      plan: cabinet.plan,
      actif: cabinet.actif,
      statutAbonnement: cabinet.statutAbonnement,
      createdAt: cabinet.createdAt.toISOString(),
      nbUtilisateurs: cabinet._count.utilisateurs,
      nbDossiers: cabinet._count.dossiers,
      dossiersTraitesMoisCourant: cabinet.usagesMensuels[0]?.dossiersTraites ?? 0,
    }));
  },

  async getCabinet(id: string): Promise<CabinetPlateformeDetail> {
    const { annee, mois } = moisCourant();
    const cabinet = await platformRepository.findCabinetById(id, annee, mois);

    if (!cabinet) {
      throw new NotFoundError("Cabinet introuvable");
    }

    return {
      id: cabinet.id,
      nom: cabinet.nom,
      secteur: cabinet.secteur,
      plan: cabinet.plan,
      actif: cabinet.actif,
      statutAbonnement: cabinet.statutAbonnement,
      createdAt: cabinet.createdAt.toISOString(),
      nbUtilisateurs: cabinet._count.utilisateurs,
      nbDossiers: cabinet._count.dossiers,
      dossiersTraitesMoisCourant: cabinet.usagesMensuels[0]?.dossiersTraites ?? 0,
      utilisateurs: cabinet.utilisateurs.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  },

  async updateCabinet(id: string, input: UpdateCabinetInput): Promise<CabinetPlateformeVue> {
    const existant = await platformRepository.findCabinetById(id, moisCourant().annee, moisCourant().mois);
    if (!existant) {
      throw new NotFoundError("Cabinet introuvable");
    }

    await platformRepository.updateCabinet(id, input);
    const cabinets = await platformService.listCabinets();
    const cabinet = cabinets.find((c) => c.id === id);
    if (!cabinet) {
      throw new NotFoundError("Cabinet introuvable");
    }
    return cabinet;
  },
};
