import { createHash } from "crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { s3Client, S3_BUCKET } from "../../../config/storage";
import { env } from "../../../config/env";
import { logger } from "../../../shared/logger";

export interface ChampsExtraits {
  montants: number[];
  dates: string[];
  identifiants: string[];
  scoreConfiance: number;
}

export interface FichierAAnalyser {
  // Clé de l'objet dans le bucket S3 (voir portailService.upload : `urlStockage` stocke la clé, pas une URL publique)
  url: string;
  nomFichier: string;
}

// Interface à implémenter par un provider OCR/IA (ex. Mistral, Mindee, Google Document AI, AWS Textract).
export interface OcrProvider {
  extraireChamps(fichier: FichierAAnalyser): Promise<ChampsExtraits>;
}

// Implémentation factice, déterministe (basée sur un hash du nom de fichier) : ne fait aucun appel réseau,
// mais permet de valider tout le pipeline (stockage, affichage, détection d'anomalies) sans clé API.
export class StubOcrProvider implements OcrProvider {
  async extraireChamps(fichier: FichierAAnalyser): Promise<ChampsExtraits> {
    const hash = createHash("sha256").update(fichier.nomFichier + fichier.url).digest("hex");
    const seed = parseInt(hash.slice(0, 8), 16);

    const montant = Math.round(((seed % 100000) / 100) * 100) / 100;
    const jour = (seed % 28) + 1;
    const mois = ((seed >> 8) % 12) + 1;
    const annee = 2022 + (seed % 4);
    const identifiant = hash.slice(0, 12).toUpperCase();
    const scoreConfiance = Math.round((0.6 + (seed % 40) / 100) * 100) / 100;

    return {
      montants: [montant],
      dates: [`${annee}-${String(mois).padStart(2, "0")}-${String(jour).padStart(2, "0")}`],
      identifiants: [identifiant],
      scoreConfiance,
    };
  }
}

const MIME_PAR_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function deviverMimeType(nomFichier: string): string {
  const extension = nomFichier.split(".").pop()?.toLowerCase() ?? "";
  return MIME_PAR_EXTENSION[extension] ?? "application/octet-stream";
}

async function streamVersBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

interface MistralOcrResponse {
  pages?: Array<{ markdown?: string }>;
}

interface MistralChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

function bornerChampsExtraits(valeur: unknown): ChampsExtraits {
  const objet = (valeur ?? {}) as Partial<ChampsExtraits>;
  const versNombres = (tab: unknown): number[] =>
    Array.isArray(tab) ? tab.filter((v): v is number => typeof v === "number") : [];
  const versChaines = (tab: unknown): string[] =>
    Array.isArray(tab) ? tab.filter((v): v is string => typeof v === "string") : [];

  return {
    montants: versNombres(objet.montants),
    dates: versChaines(objet.dates),
    identifiants: versChaines(objet.identifiants),
    scoreConfiance:
      typeof objet.scoreConfiance === "number"
        ? Math.min(1, Math.max(0, objet.scoreConfiance))
        : 0,
  };
}

// Récupère le texte OCR brut d'un fichier stocké sur S3 via l'API Mistral (/v1/ocr).
// Exporté pour être réutilisé par d'autres providers Mistral (ex. détection d'anomalies) sans
// dupliquer l'appel OCR ni la logique de récupération du fichier.
export async function extraireTexteOcrMistral(
  apiKey: string,
  fichier: FichierAAnalyser
): Promise<string> {
  const objet = await s3Client.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: fichier.url }));
  const buffer = await streamVersBuffer(objet.Body as Readable);
  const mimeType = deviverMimeType(fichier.nomFichier);
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const document =
    mimeType === "application/pdf"
      ? { type: "document_url", document_url: dataUri }
      : { type: "image_url", image_url: dataUri };

  const reponse = await fetch("https://api.mistral.ai/v1/ocr", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: env.MISTRAL_OCR_MODEL, document }),
  });

  if (!reponse.ok) {
    throw new Error(`Mistral OCR a répondu ${reponse.status} : ${await reponse.text()}`);
  }

  const donnees = (await reponse.json()) as MistralOcrResponse;
  return (donnees.pages ?? []).map((page) => page.markdown ?? "").join("\n\n");
}

// Provider réel : OCR Mistral (endpoint /v1/ocr) puis extraction structurée via un modèle de chat
// Mistral en mode JSON. Option "souveraine UE" mentionnée dans le cahier des charges (section 8).
// Ne jette jamais d'exception : en cas d'échec (clé invalide, quota, timeout, réponse malformée),
// on retombe sur StubOcrProvider pour ne jamais bloquer le pipeline de validation d'un document.
export class MistralOcrProvider implements OcrProvider {
  private readonly stub = new StubOcrProvider();

  constructor(private readonly apiKey: string) {}

  async extraireChamps(fichier: FichierAAnalyser): Promise<ChampsExtraits> {
    try {
      const texteOcr = await extraireTexteOcrMistral(this.apiKey, fichier);
      if (!texteOcr.trim()) {
        return this.stub.extraireChamps(fichier);
      }

      return await this.extraireChampsDepuisTexte(texteOcr);
    } catch (error) {
      logger.error(`MistralOcrProvider : échec pour ${fichier.nomFichier}, repli sur le stub`, error);
      return this.stub.extraireChamps(fichier);
    }
  }

  private async extraireChampsDepuisTexte(texteOcr: string): Promise<ChampsExtraits> {
    const prompt = [
      "Tu extrais des champs structurés depuis le texte OCR d'un document administratif ou financier.",
      "Réponds UNIQUEMENT avec un objet JSON de la forme :",
      '{"montants": number[], "dates": string[] (format ISO YYYY-MM-DD), "identifiants": string[], "scoreConfiance": number entre 0 et 1}',
      "Si une catégorie est absente du document, renvoie un tableau vide. N'invente aucune valeur.",
      "",
      "Texte OCR :",
      texteOcr.slice(0, 8000),
    ].join("\n");

    const reponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.MISTRAL_EXTRACTION_MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!reponse.ok) {
      throw new Error(`Mistral chat a répondu ${reponse.status} : ${await reponse.text()}`);
    }

    const donnees = (await reponse.json()) as MistralChatResponse;
    const contenu = donnees.choices?.[0]?.message?.content ?? "{}";
    return bornerChampsExtraits(JSON.parse(contenu));
  }
}

export const ocrProvider: OcrProvider = env.MISTRAL_API_KEY
  ? new MistralOcrProvider(env.MISTRAL_API_KEY)
  : new StubOcrProvider();
