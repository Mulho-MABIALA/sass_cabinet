# Collecte & Vérification de dossiers clients — MVP

SaaS B2B pour cabinets professionnels (avocats, notaires, syndics, courtiers) : collecte automatisée des documents clients via portail sécurisé, vérification de complétude, relances automatiques, dashboard de suivi.

## Stack

- **Backend** : Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Nodemailer, node-cron, stockage S3-compatible (OVHcloud/Scaleway)
- **Frontend** : React, Vite, TypeScript, TailwindCSS, React Query, Zustand

Pour la mise en production (hébergement, variables d'environnement, checklist de vérification), voir [`DEPLOIEMENT.md`](./DEPLOIEMENT.md).

## Prérequis

- Node.js ≥ 20
- npm
- Docker (pour Postgres via docker-compose) — ou une instance Postgres locale

## 1. Base de données

```bash
docker-compose up -d
```

Démarre Postgres sur `localhost:5432` (user/password/db : `sassfr`) et Adminer sur `http://localhost:8080`.

## 2. Backend

```bash
cd backend
cp .env.example .env
npm install
```

Renseignez au minimum dans `.env` :
- `DATABASE_URL` (déjà pré-rempli pour le docker-compose fourni)
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (valeurs aléatoires)
- `PLATFORM_JWT_SECRET` (valeur aléatoire, différente des secrets ci-dessus — nécessaire pour la console plateforme)
- `SMTP_*` (un compte SMTP UE pour les relances — un service comme Mailtrap peut être utilisé en dev)
- `S3_*` (bucket S3-compatible OVHcloud/Scaleway — nécessaire pour l'upload de documents)

Puis :

```bash
npm run prisma:migrate    # crée le schéma en base
npm run prisma:seed       # cabinet + comptes + dossier de démo
npm run dev                # démarre l'API sur http://localhost:4000
```

Le seed affiche dans la console :
- un compte admin (`admin@demo.fr` / `MotDePasse123!`) et un compte collaborateur (`collaborateur@demo.fr` / `MotDePasse123!`) pour le cabinet "Cabinet Démo Notaires"
- un second cabinet de démo ("Cabinet Avocats Associés", plan Cabinet) avec son propre admin (`admin@avocats-demo.fr` / `MotDePasse123!`), pour tester le multi-cabinet côté console plateforme
- un compte super-admin plateforme (`plateforme@sassfr.local` / `PlateformeAdmin123!`)
- le lien du portail client de démonstration

## 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # démarre le front sur http://localhost:5173
```

L'interface expose désormais, en plus du MVP (dashboard, création de dossier, portail client) : les anomalies détectées et les montants extraits par OCR sur chaque document, l'envoi en signature électronique d'un document validé, le droit à l'effacement RGPD depuis la fiche dossier, un écran **Facturation** (`/facturation`, usage mensuel et estimation du montant Starter), un écran **Intégrations** (`/webhooks`, CRUD des webhooks Zapier/Make), et sur le dashboard les exports Cegid (fichier FEC téléchargé) et Septeo (simulation). Le champ téléphone client (optionnel, à la création d'un dossier) active les relances SMS.

### Espace admin

Deux écrans réservés au rôle `admin` (invisibles dans la navigation pour un `collaborateur`, et protégés côté API par `requireRole("admin")` — le frontend n'est qu'une aide UX, pas la vraie barrière de sécurité) :

- **Équipe** (`/admin/equipe`) : liste des comptes du cabinet, invitation d'un admin ou collaborateur par email. L'admin ne saisit que l'email et le rôle ; l'invité reçoit un email avec un lien (`/invitation/:token`, valable 7 jours) sur lequel il choisit lui-même son mot de passe pour activer son compte (connexion automatique ensuite). Aucun mot de passe provisoire n'est manipulé par l'admin.
- **Types de dossier** (`/admin/types-dossier`) : liste des types de dossier existants avec leur checklist, création d'un nouveau type (nom, secteur, description, liste dynamique de documents requis avec obligatoire/optionnel).

Le rôle de l'utilisateur connecté (Admin / Collaborateur) est affiché en badge dans l'en-tête de l'application.

### Inscription self-service et console plateforme

Deux univers supplémentaires, complètement séparés du reste de l'app (auth, session, layout) :

- **Inscription d'un nouveau cabinet** (`/inscription`) : un nouveau cabinet client crée lui-même son compte (nom du cabinet, secteur, email + mot de passe de son premier admin), sans intervention manuelle. Auto-connexion immédiate après création. Lien accessible depuis la page de connexion (`/connexion`).
- **Console plateforme** (`/plateforme`, connexion sur `/plateforme/connexion`) : réservée à toi, le propriétaire du SaaS — pas aux cabinets clients. Authentification totalement séparée (`PlatformAdmin`, JWT signé avec `PLATFORM_JWT_SECRET`, jamais interchangeable avec un token cabinet). Liste tous les cabinets clients avec leur secteur, leur plan, leur nombre d'utilisateurs/dossiers, leur usage du mois — et permet de changer le plan d'un cabinet ou de le suspendre/réactiver. Un cabinet suspendu (`Cabinet.actif = false`) ne peut plus se connecter (vérifié à la connexion et au rafraîchissement de token).

Compte super-admin de démo créé par le seed : `plateforme@sassfr.local` / `PlateformeAdmin123!`.

## Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/login` | Connexion admin/collaborateur |
| POST | `/auth/refresh` | Rafraîchissement du token |
| POST | `/inscription` | Création self-service d'un nouveau cabinet + son premier admin (auto-login) |
| POST | `/platform/login` | Connexion à la console plateforme (super-admin, distincte de `/auth/login`) |
| GET | `/platform/cabinets` | Liste de tous les cabinets clients (réservé plateforme) |
| GET/PATCH | `/platform/cabinets/:id` | Détail / changement de plan ou suspension d'un cabinet (réservé plateforme) |
| GET/POST | `/type-dossiers` | Types de dossier + checklist |
| GET/POST | `/dossiers` | Liste / création de dossiers |
| GET | `/dossiers/:id` | Détail d'un dossier |
| GET | `/dossiers/export?format=csv\|json` | Export du rapport de synthèse |
| GET | `/dossiers/export-metier?systeme=septeo\|cegid` | Export (stub) vers un logiciel métier |
| POST | `/dossiers/:id/relancer` | Relance manuelle (email + SMS si téléphone renseigné) |
| DELETE | `/dossiers/:id/rgpd` | Droit à l'effacement RGPD (anonymisation immédiate) |
| GET | `/portail/:token` | Vue publique du portail client (sans authentification) |
| POST | `/portail/:token/upload` | Dépôt d'un document par le client |
| PATCH | `/documents/:id/valider` | Validation d'un document (déclenche OCR + détection d'anomalies) |
| PATCH | `/documents/:id/refuser` | Refus d'un document par le collaborateur |
| POST | `/documents/:id/signature` | Envoi du document en signature électronique |
| GET | `/facturation/usage` | Usage du mois courant + 3 derniers mois (facturation à l'usage) |
| GET/POST | `/webhooks` | Liste / création des webhooks sortants (Zapier/Make) du cabinet |
| PATCH/DELETE | `/webhooks/:id` | Mise à jour / suppression d'un webhook |

Le job de relances automatiques (`node-cron`, configurable via `RELANCE_CRON_EXPRESSION` et `RELANCE_DELAI_JOURS`) relance tout dossier non complet dont la dernière relance (ou la création) dépasse le délai configuré, par email et, si un numéro de téléphone client est renseigné, par SMS.

Le job de purge RGPD (`RGPD_CRON_EXPRESSION`, tous les jours à 3h par défaut) anonymise automatiquement les dossiers clôturés depuis plus de `RGPD_RETENTION_JOURS` (3 ans par défaut) : données personnelles écrasées, documents supprimés du bucket S3, pièces déposées purgées en base. Voir `backend/RGPD.md` pour le registre de traitement complet.

## Fonctionnalités V1/V2 (cahier des charges v2) — état actuel : stubs prêts à brancher

Le MVP initial a été étendu avec les briques suivantes du cahier des charges v2. Tout ce qui dépend d'un fournisseur externe est livré sous forme d'**interface + implémentation factice (stub)**, sans clé API réelle, pour être branché plus tard sur un vrai prestataire :

- **RGPD** : conservation limitée des documents (durée paramétrable), anonymisation automatique (job cron) et droit à l'effacement à la demande, chiffrement au repos des documents (S3 `ServerSideEncryption: AES256`), registre de traitement (`backend/RGPD.md`).
- **Facturation à l'usage** : plans `starter` / `cabinet` / `premium` sur le cabinet, compteur mensuel de dossiers traités (`UsageMensuel`), endpoint `GET /facturation/usage`.
- **Paiement** : `backend/src/modules/facturation/paiement/PaiementProvider.ts` — **branché sur Stripe** (mode test tant que `STRIPE_SECRET_KEY` est une clé `sk_test_...`). `POST /facturation/checkout` (admin) crée/réutilise le client Stripe du cabinet et renvoie l'URL d'un Checkout Session d'abonnement pour le plan choisi ; `POST /facturation/portail` renvoie l'URL du Billing Portal Stripe (gérer moyen de paiement, résilier, voir les factures) ; `POST /facturation/webhook` (public, signature vérifiée, corps brut) tient à jour `Cabinet.statutAbonnement` (`essai`/`actif`/`impaye`/`annule`) et le plan à la réception des événements Stripe. Sans `STRIPE_SECRET_KEY`, repli sur `StubPaiementProvider` (URLs simulées, aucun appel réseau).
- **OCR / extraction IA** : `backend/src/modules/documents/ocr/OcrProvider.ts` — **branché sur l'API Mistral** (OCR `/v1/ocr` + extraction structurée via un modèle de chat en mode JSON), option souveraine UE. Actif dès que `MISTRAL_API_KEY` est renseigné dans `.env` ; sinon repli automatique sur `StubOcrProvider` (extraction factice déterministe), y compris en cas d'erreur d'appel API (clé invalide, quota, timeout) pour ne jamais bloquer la validation d'un document.
- **Relances SMS** : `backend/src/modules/relances/sms/SmsProvider.ts` — **branché sur l'API OVHcloud SMS** (authentification signée OVH, hébergement UE), envoyée en complément de l'email quand `telephoneClient` est renseigné sur le dossier. Actif dès que `OVH_APP_KEY`/`OVH_APP_SECRET`/`OVH_CONSUMER_KEY`/`OVH_SMS_SERVICE_NAME` sont renseignés ; sinon repli automatique sur `StubSmsProvider` (log console), y compris en cas d'échec d'appel API.
- **Export logiciels métier** : `backend/src/modules/dossiers/export-metier/ExportMetierProvider.ts` — **Septeo/Diapaz reste en stub** (aucune API publique en self-service trouvée pour ce logiciel : accès partenaire requis) ; **Cegid génère un vrai fichier FEC** (Fichier des Écritures Comptables, format d'échange officiel DGFiP que Cegid importe nativement), construit à partir des montants extraits par l'OCR sur les documents validés de chaque dossier — cf. avertissement dans le code sur le plan de comptes à faire valider par un expert-comptable. `GET /dossiers/export-metier?systeme=septeo|cegid` télécharge directement le fichier pour Cegid.
- **Détection d'anomalies** : `backend/src/modules/documents/anomalies/AnomalyDetectionProvider.ts` — **branchée sur l'API Mistral** (réutilise le texte OCR déjà extrait, sans appel réseau supplémentaire) pour détecter document illisible / pièce expirée / montant incohérent avec justification textuelle, persistée en base (`Anomalie`). Actif dès que `MISTRAL_API_KEY` est renseigné ; sinon repli sur le stub déterministe.
- **Signature électronique** : `backend/src/modules/dossiers/signature/SignatureProvider.ts` — **branché sur l'API Yousign v3** (prestataire français), exposé via `POST /documents/:id/signature` (crée la procédure, uploade le document depuis S3, ajoute le client comme signataire, active la procédure et retourne le lien de signature). Actif dès que `YOUSIGN_API_KEY` est renseigné ; sinon repli automatique sur `StubSignatureProvider`.
- **Intégrations Zapier/Make** : modèle `WebhookConfig` + CRUD (`/webhooks`) et dispatcher `declencherWebhooks`, appelé quand un dossier passe "complet" et quand un document est déposé par un client.

## Production : email, monitoring, tests

- **Email transactionnel** : le mailer (`backend/src/shared/mailer.ts`) utilise SMTP standard (Nodemailer) — configuré pour **Brevo** (palier gratuit, 300 emails/jour), voir les commentaires dans `.env.example`. `verifierConnexionSmtp()` teste la connexion au démarrage du serveur et logge un avertissement clair si la config est invalide, plutôt que d'échouer silencieusement au premier envoi.
- **Monitoring erreurs** : `backend/src/shared/sentry.ts` — **branché sur Sentry** (palier gratuit), no-op si `SENTRY_DSN` est absent. `errorHandler.middleware.ts` remonte automatiquement toute erreur serveur (5xx) à Sentry.
- **Tests automatisés** : `npm test` (Vitest) dans `backend/`. Tests unitaires purement mockés (aucune vraie base de données ni API externe requise, `vitest.setup.ts` fournit des variables d'environnement factices) :
  - `shared/jwt.test.ts` — génération/vérification des tokens cabinet et plateforme, et surtout qu'un token de l'un n'est jamais accepté par l'autre (secrets distincts).
  - `modules/auth/auth.service.test.ts` — login/refresh : bon mot de passe, mauvais mot de passe, email inconnu, et blocage si le cabinet a été suspendu par la console plateforme.
  - `modules/dossiers/dossiers.service.test.ts` — `calculerStatutDossier` (incomplet/en attente/complet selon les documents obligatoires) et l'isolation multi-tenant : `getById` transmet bien `cabinetId` au repository et renvoie 404 (pas de fuite d'existence) pour un dossier d'un autre cabinet.
  - `modules/facturation/facturation.service.test.ts` — calcul du montant à l'usage (starter vs forfaits), création de session Stripe (réutilisation vs création du client), et mise à jour de `statutAbonnement` à la réception des webhooks Stripe.
- **Documents légaux** : `legal/CGU.md` et `legal/politique-confidentialite.md` — brouillons de Conditions Générales de Vente/Utilisation et de Politique de confidentialité, cohérents avec le registre de traitement (`backend/RGPD.md`) et la liste réelle des sous-traitants (Mistral AI, OVHcloud, Yousign, Brevo, Stripe, Sentry). **Non publiables en l'état** : champs `[...]` à compléter et relecture juridique obligatoire avant mise en ligne.
