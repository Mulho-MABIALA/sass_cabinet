export type Role = "admin" | "collaborateur";
export type Secteur = "avocat" | "notaire" | "syndic" | "courtier" | "expert_comptable";
export type StatutDossier = "incomplet" | "en_attente_verification" | "complet";
export type StatutDocument = "manquant" | "depose" | "valide" | "refuse";
export type Plan = "starter" | "cabinet" | "premium";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  cabinetId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface DocumentRequis {
  id: string;
  nom: string;
  description: string | null;
  obligatoire: boolean;
}

export interface TypeDossier {
  id: string;
  nom: string;
  secteur: Secteur;
  description: string | null;
  documentsRequis: DocumentRequis[];
}

export interface ChampsExtraits {
  montants: number[];
  dates: string[];
  identifiants: string[];
  scoreConfiance: number;
}

export interface Anomalie {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface DocumentDepose {
  id: string;
  documentRequisId: string;
  nomFichier: string | null;
  urlStockage: string | null;
  statut: StatutDocument;
  dateDepot: string | null;
  donneesExtraites: ChampsExtraits | null;
  anomalies: Anomalie[];
  documentRequis: DocumentRequis;
}

export interface Relance {
  id: string;
  dateEnvoi: string;
  canal: "email" | "sms";
  statut: "envoyee" | "echouee";
}

export interface DossierListe {
  id: string;
  nomClient: string;
  emailClient: string;
  telephoneClient: string | null;
  statut: StatutDossier;
  createdAt: string;
  typeDossier: TypeDossier;
  collaborateur: { id: string; email: string };
  documentsDeposes: DocumentDepose[];
}

export interface DossierDetail extends DossierListe {
  relances: Relance[];
  tokenPortail: string;
}

export interface PortailDocumentVue {
  documentRequisId: string;
  documentDeposeId: string;
  nom: string;
  description: string | null;
  obligatoire: boolean;
  statut: StatutDocument;
  nomFichier: string | null;
}

export interface PortailVue {
  nomClient: string;
  cabinetNom: string;
  typeDossierNom: string;
  statutDossier: StatutDossier;
  documents: PortailDocumentVue[];
}

export interface ResultatSignature {
  signatureUrl: string;
  statut: string;
}

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

export type EvenementWebhook = "dossier.complet" | "document.depose";

export interface WebhookConfig {
  id: string;
  url: string;
  evenement: EvenementWebhook;
  actif: boolean;
  createdAt: string;
}

export type StatutAbonnement = "essai" | "actif" | "impaye" | "annule";

export interface CabinetPlateforme {
  id: string;
  nom: string;
  secteur: Secteur;
  plan: Plan;
  actif: boolean;
  statutAbonnement: StatutAbonnement;
  createdAt: string;
  nbUtilisateurs: number;
  nbDossiers: number;
  dossiersTraitesMoisCourant: number;
}

export interface CabinetPlateformeDetail extends CabinetPlateforme {
  utilisateurs: Array<{ id: string; email: string; role: Role; createdAt: string }>;
}
