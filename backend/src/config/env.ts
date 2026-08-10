import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().url(),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Secret dédié aux tokens de la console plateforme (super-admin) — distinct des secrets cabinet
  // ci-dessus pour qu'un token cabinet ne puisse jamais être rejoué comme token plateforme.
  PLATFORM_JWT_SECRET: z.string().min(1),
  PLATFORM_JWT_EXPIRES_IN: z.string().default("2h"),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  // z.coerce.boolean() transformerait la chaîne "false" en `true` (toute chaîne non vide est truthy) :
  // on parse explicitement la valeur textuelle pour n'accepter "true"/"false".
  SMTP_SECURE: z
    .enum(["true", "false"])
    .optional()
    .default("false")
    .transform((value) => value === "true"),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM: z.string().min(1),

  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),

  RELANCE_DELAI_JOURS: z.coerce.number().default(5),
  RELANCE_CRON_EXPRESSION: z.string().default("0 8 * * *"),

  // RGPD : durée de conservation des documents clients après clôture d'un dossier (en jours)
  RGPD_RETENTION_JOURS: z.coerce.number().default(1095),
  RGPD_CRON_EXPRESSION: z.string().default("0 3 * * *"),

  // Facturation Starter (prix par dossier traité, en euros)
  FACTURATION_PRIX_DOSSIER_STARTER: z.coerce.number().default(4),

  // OCR/IA (extraction de champs) — optionnel : si absent, un provider factice (StubOcrProvider) est utilisé
  // à la place, pour que le pipeline reste testable sans clé API.
  MISTRAL_API_KEY: z.string().optional(),
  MISTRAL_OCR_MODEL: z.string().default("mistral-ocr-latest"),
  MISTRAL_EXTRACTION_MODEL: z.string().default("mistral-small-latest"),

  // SMS (OVHcloud) — optionnel : si absent, un provider factice (StubSmsProvider, log console) est utilisé.
  OVH_API_ENDPOINT: z.string().url().default("https://eu.api.ovh.com/1.0"),
  OVH_APP_KEY: z.string().optional(),
  OVH_APP_SECRET: z.string().optional(),
  OVH_CONSUMER_KEY: z.string().optional(),
  OVH_SMS_SERVICE_NAME: z.string().optional(),
  OVH_SMS_SENDER: z.string().optional(),

  // Signature électronique (Yousign) — optionnel : si absent, un provider factice (StubSignatureProvider) est utilisé.
  YOUSIGN_API_KEY: z.string().optional(),
  YOUSIGN_API_URL: z.string().url().default("https://api.yousign.app/v3"),

  // Monitoring erreurs (Sentry, palier gratuit) — optionnel : si absent, aucun envoi (logs console uniquement).
  SENTRY_DSN: z.string().optional(),

  // Paiement (Stripe, mode test gratuit tant qu'aucune vraie transaction) — optionnel : si absent, un provider
  // factice (StubPaiementProvider) est utilisé pour ne pas bloquer le développement sans compte Stripe.
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_CABINET: z.string().optional(),
  STRIPE_PRICE_PREMIUM: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables d'environnement invalides :", parsed.error.flatten().fieldErrors);
  throw new Error("Configuration d'environnement invalide");
}

export const env = parsed.data;
