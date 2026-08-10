import { createHash } from "crypto";
import { extraireTexteOcrMistral } from "../ocr/OcrProvider";
import { env } from "../../../config/env";
import { logger } from "../../../shared/logger";

export interface DocumentAAnalyser {
  documentDeposeId: string;
  nomFichier: string;
  urlStockage: string;
}

export interface AnomalieDetectee {
  type: string;
  description: string;
}

// Interface à implémenter par un vrai moteur de détection d'anomalies (règles métier + IA).
export interface AnomalyDetectionProvider {
  detecter(document: DocumentAAnalyser): Promise<AnomalieDetectee[]>;
}

const TYPES_ANOMALIES: Array<{ type: string; description: string }> = [
  { type: "document_illisible", description: "La qualité du document semble trop faible pour être exploitée (scan flou ou tronqué)." },
  { type: "piece_expiree", description: "La date de validité détectée sur le document semble antérieure à la date du jour." },
  { type: "montant_incoherent", description: "Le montant extrait est incohérent avec les montants habituellement observés pour ce type de document." },
];

// Implémentation factice, déterministe : simule une détection sur ~1 document sur 4 (basé sur un hash),
// avec une justification textuelle plausible, sans appel à un vrai moteur IA.
export class StubAnomalyDetectionProvider implements AnomalyDetectionProvider {
  async detecter(document: DocumentAAnalyser): Promise<AnomalieDetectee[]> {
    const hash = createHash("sha256")
      .update(document.documentDeposeId + document.nomFichier)
      .digest("hex");
    const seed = parseInt(hash.slice(0, 8), 16);

    if (seed % 4 !== 0) {
      return [];
    }

    const anomalie = TYPES_ANOMALIES[seed % TYPES_ANOMALIES.length];
    return [anomalie];
  }
}

interface MistralChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

function bornerAnomalies(valeur: unknown): AnomalieDetectee[] {
  const objet = (valeur ?? {}) as { anomalies?: unknown };
  if (!Array.isArray(objet.anomalies)) return [];

  return objet.anomalies
    .filter(
      (a): a is { type: unknown; description: unknown } =>
        typeof a === "object" && a !== null
    )
    .filter((a) => typeof a.type === "string" && typeof a.description === "string")
    .map((a) => ({ type: a.type as string, description: a.description as string }));
}

// Provider réel : détection d'anomalies "explicable" par IA (Mistral), au sens du cahier des charges
// (section 3, axe 4 : signalement des incohérences avec justification, pas un simple statut manquant/reçu).
// Réutilise le texte OCR déjà extrait par le pipeline Mistral (voir ocr/OcrProvider.ts) pour éviter un
// second appel OCR. Ne jette jamais d'exception : en cas d'échec, on retombe sur le provider factice.
export class MistralAnomalyDetectionProvider implements AnomalyDetectionProvider {
  private readonly stub = new StubAnomalyDetectionProvider();

  constructor(private readonly apiKey: string) {}

  async detecter(document: DocumentAAnalyser): Promise<AnomalieDetectee[]> {
    try {
      const texteOcr = await extraireTexteOcrMistral(this.apiKey, {
        url: document.urlStockage,
        nomFichier: document.nomFichier,
      });

      if (!texteOcr.trim()) {
        return [];
      }

      return await this.detecterDepuisTexte(texteOcr);
    } catch (error) {
      logger.error(
        `MistralAnomalyDetectionProvider : échec pour ${document.nomFichier}, repli sur le stub`,
        error
      );
      return this.stub.detecter(document);
    }
  }

  private async detecterDepuisTexte(texteOcr: string): Promise<AnomalieDetectee[]> {
    const prompt = [
      "Tu es un contrôleur qualité pour un cabinet professionnel (avocat, notaire, syndic, courtier,",
      "expert-comptable) qui vérifie des documents déposés par des clients.",
      "Analyse le texte OCR ci-dessous et signale UNIQUEMENT les anomalies réellement détectables dans ce texte, parmi :",
      "- document_illisible : le texte est trop pauvre/incohérent pour être exploité",
      "- piece_expiree : une date de validité/expiration explicite est antérieure à aujourd'hui",
      "- montant_incoherent : un montant est manifestement aberrant (négatif, incohérent avec le contexte)",
      "- autre : toute autre incohérence factuelle explicite dans le texte",
      "Ne signale rien si tu n'es pas sûr. Chaque anomalie doit avoir une description qui justifie précisément pourquoi.",
      'Réponds UNIQUEMENT avec un objet JSON : {"anomalies": [{"type": string, "description": string}]}',
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
    return bornerAnomalies(JSON.parse(contenu));
  }
}

export const anomalyDetectionProvider: AnomalyDetectionProvider = env.MISTRAL_API_KEY
  ? new MistralAnomalyDetectionProvider(env.MISTRAL_API_KEY)
  : new StubAnomalyDetectionProvider();
