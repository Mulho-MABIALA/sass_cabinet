// Exécuté avant tous les tests (voir vitest.config.ts > test.setupFiles) : fournit des valeurs factices
// pour toutes les variables d'environnement requises par backend/src/config/env.ts, afin que les tests
// (unitaires, tout mocké) puissent importer n'importe quel module sans dépendre d'un vrai .env ni d'une
// vraie base de données/API externe. `dotenv/config` (chargé par env.ts) n'écrase jamais une variable déjà
// présente dans process.env, donc ces valeurs sont bien celles utilisées pendant les tests.
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

process.env.JWT_ACCESS_SECRET = "test_access_secret";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";

process.env.PLATFORM_JWT_SECRET = "test_platform_secret";
process.env.PLATFORM_JWT_EXPIRES_IN = "2h";

process.env.SMTP_HOST = "smtp.test.local";
process.env.SMTP_PORT = "587";
process.env.SMTP_SECURE = "false";
process.env.SMTP_USER = "test_user";
process.env.SMTP_PASSWORD = "test_password";
process.env.SMTP_FROM = "Test <test@test.local>";

process.env.S3_ENDPOINT = "https://s3.test.local";
process.env.S3_REGION = "test";
process.env.S3_BUCKET = "test-bucket";
process.env.S3_ACCESS_KEY_ID = "test_key";
process.env.S3_SECRET_ACCESS_KEY = "test_secret";

// Volontairement absents : MISTRAL_API_KEY, OVH_*, YOUSIGN_API_KEY, SENTRY_DSN, STRIPE_SECRET_KEY
// → tous les providers optionnels tombent sur leur implémentation stub pendant les tests.
process.env.STRIPE_PRICE_STARTER = "price_test_starter";
process.env.STRIPE_PRICE_CABINET = "price_test_cabinet";
// STRIPE_PRICE_PREMIUM volontairement non défini : utilisé pour tester le cas "plan non configuré".
