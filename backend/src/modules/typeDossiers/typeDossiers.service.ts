import {
  typeDossiersRepository,
  TypeDossierAvecDocuments,
} from "./typeDossiers.repository";
import { CreateTypeDossierInput } from "./typeDossiers.schema";
import { NotFoundError } from "../../shared/AppError";

export const typeDossiersService = {
  list(cabinetId: string): Promise<TypeDossierAvecDocuments[]> {
    return typeDossiersRepository.findByCabinet(cabinetId);
  },

  async getById(id: string, cabinetId: string): Promise<TypeDossierAvecDocuments> {
    const typeDossier = await typeDossiersRepository.findById(id, cabinetId);
    if (!typeDossier) {
      throw new NotFoundError("Type de dossier introuvable");
    }
    return typeDossier;
  },

  create(cabinetId: string, input: CreateTypeDossierInput): Promise<TypeDossierAvecDocuments> {
    return typeDossiersRepository.create(cabinetId, input);
  },
};
