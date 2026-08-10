import { randomUUID } from "crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { s3Client, S3_BUCKET } from "../../../config/storage";
import { env } from "../../../config/env";
import { logger } from "../../../shared/logger";

export interface ResultatSignature {
  signatureUrl: string;
  statut: string;
}

export interface DocumentASigner {
  // Clé de l'objet dans le bucket S3 (voir portailService.upload : `urlStockage` stocke la clé)
  cleObjet: string;
  nomFichier: string;
}

export interface Signataire {
  nom: string;
  email: string;
}

// Interface à implémenter par un vrai provider de signature électronique (ex. Yousign, DocuSign, Universign).
export interface SignatureProvider {
  envoyerPourSignature(
    dossierId: string,
    document: DocumentASigner,
    signataire: Signataire
  ): Promise<ResultatSignature>;
}

// Implémentation factice façon Yousign : génère une URL de signature simulée, sans appel réseau réel.
export class StubSignatureProvider implements SignatureProvider {
  async envoyerPourSignature(
    dossierId: string,
    document: DocumentASigner,
    _signataire: Signataire
  ): Promise<ResultatSignature> {
    const procedureId = randomUUID();
    return {
      signatureUrl: `https://signature.stub.local/procedures/${procedureId}?dossier=${dossierId}&document=${encodeURIComponent(
        document.nomFichier
      )}`,
      statut: "en_attente_signature",
    };
  }
}

async function streamVersBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function scinderNom(nomComplet: string): { prenom: string; nom: string } {
  const parties = nomComplet.trim().split(/\s+/);
  if (parties.length === 1) {
    return { prenom: parties[0], nom: parties[0] };
  }
  return { prenom: parties[0], nom: parties.slice(1).join(" ") };
}

interface YousignSignatureRequest {
  id: string;
}

interface YousignDocument {
  id: string;
}

interface YousignSigner {
  id: string;
}

interface YousignActivationResponse {
  status: string;
  signers?: Array<{ id: string; signature_link?: string }>;
}

// Provider réel : Yousign (API v3), prestataire français de signature électronique — cohérent avec l'axe
// "conformité UE" du cahier des charges. Flux Yousign : créer la procédure -> uploader le document -> ajouter
// le signataire -> activer la procédure (renvoie le lien de signature). Ne jette jamais d'exception :
// en cas d'échec (clé invalide, quota, document illisible), on retombe sur StubSignatureProvider.
export class YousignSignatureProvider implements SignatureProvider {
  private readonly stub = new StubSignatureProvider();

  constructor(private readonly apiKey: string, private readonly apiUrl: string) {}

  async envoyerPourSignature(
    dossierId: string,
    document: DocumentASigner,
    signataire: Signataire
  ): Promise<ResultatSignature> {
    try {
      const procedureId = await this.creerProcedure(dossierId);
      const documentId = await this.uploaderDocument(procedureId, document);
      await this.ajouterSignataire(procedureId, documentId, signataire);
      return await this.activerProcedure(procedureId);
    } catch (error) {
      logger.error(
        `YousignSignatureProvider : échec pour le dossier ${dossierId}, repli sur le stub`,
        error
      );
      return this.stub.envoyerPourSignature(dossierId, document, signataire);
    }
  }

  private entetes(contentType?: string): Record<string, string> {
    const entetes: Record<string, string> = { Authorization: `Bearer ${this.apiKey}` };
    if (contentType) entetes["Content-Type"] = contentType;
    return entetes;
  }

  private async creerProcedure(dossierId: string): Promise<string> {
    const reponse = await fetch(`${this.apiUrl}/signature_requests`, {
      method: "POST",
      headers: this.entetes("application/json"),
      body: JSON.stringify({ name: `Dossier ${dossierId}`, delivery_mode: "email" }),
    });
    if (!reponse.ok) {
      throw new Error(`Yousign (création procédure) a répondu ${reponse.status} : ${await reponse.text()}`);
    }
    const donnees = (await reponse.json()) as YousignSignatureRequest;
    return donnees.id;
  }

  private async uploaderDocument(procedureId: string, document: DocumentASigner): Promise<string> {
    const objet = await s3Client.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: document.cleObjet }));
    const buffer = await streamVersBuffer(objet.Body as Readable);

    const formulaire = new FormData();
    formulaire.append("file", new Blob([buffer]), document.nomFichier);
    formulaire.append("nature", "signable_document");

    const reponse = await fetch(`${this.apiUrl}/signature_requests/${procedureId}/documents`, {
      method: "POST",
      headers: this.entetes(),
      body: formulaire,
    });
    if (!reponse.ok) {
      throw new Error(`Yousign (upload document) a répondu ${reponse.status} : ${await reponse.text()}`);
    }
    const donnees = (await reponse.json()) as YousignDocument;
    return donnees.id;
  }

  private async ajouterSignataire(
    procedureId: string,
    documentId: string,
    signataire: Signataire
  ): Promise<string> {
    const { prenom, nom } = scinderNom(signataire.nom);
    const reponse = await fetch(`${this.apiUrl}/signature_requests/${procedureId}/signers`, {
      method: "POST",
      headers: this.entetes("application/json"),
      body: JSON.stringify({
        info: { first_name: prenom, last_name: nom, email: signataire.email, locale: "fr" },
        signature_level: "electronic_signature",
        signature_authentication_mode: "no_otp",
        fields: [{ document_id: documentId, type: "signature", page: 1, x: 100, y: 100 }],
      }),
    });
    if (!reponse.ok) {
      throw new Error(`Yousign (ajout signataire) a répondu ${reponse.status} : ${await reponse.text()}`);
    }
    const donnees = (await reponse.json()) as YousignSigner;
    return donnees.id;
  }

  private async activerProcedure(procedureId: string): Promise<ResultatSignature> {
    const reponse = await fetch(`${this.apiUrl}/signature_requests/${procedureId}/activate`, {
      method: "POST",
      headers: this.entetes("application/json"),
    });
    if (!reponse.ok) {
      throw new Error(`Yousign (activation) a répondu ${reponse.status} : ${await reponse.text()}`);
    }
    const donnees = (await reponse.json()) as YousignActivationResponse;
    const lienSignature = donnees.signers?.[0]?.signature_link;

    return {
      signatureUrl: lienSignature ?? `${this.apiUrl}/signature_requests/${procedureId}`,
      statut: donnees.status ?? "en_attente_signature",
    };
  }
}

export const signatureProvider: SignatureProvider = env.YOUSIGN_API_KEY
  ? new YousignSignatureProvider(env.YOUSIGN_API_KEY, env.YOUSIGN_API_URL)
  : new StubSignatureProvider();
