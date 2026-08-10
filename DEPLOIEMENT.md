# Déploiement en production

Architecture cible : **backend + PostgreSQL sur Scalingo** (hébergeur français, RGPD natif), **frontend sur Vercel ou Netlify** (gratuit pour ce volume de trafic), stockage documents déjà sur OVHcloud/Scaleway S3 (configuré depuis le début du projet).

Coût de départ estimé : **~15-30 €/mois** (backend + Postgres sur Scalingo), le reste (frontend, email, monitoring, paiement) reste gratuit tant que le volume est faible — voir le détail des paliers gratuits dans `README.md` et `backend/.env.example`.

## 0. Prérequis

- Un compte [Scalingo](https://scalingo.com) (essai gratuit 30 jours, carte bancaire demandée à la création de l'app).
- Un compte [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) (gratuit).
- Le code poussé sur un dépôt Git (GitHub/GitLab) — Scalingo et Vercel/Netlify se connectent tous les deux directement à un dépôt distant pour du déploiement automatique. À défaut, Scalingo accepte aussi un déploiement par `git push` direct vers son propre remote.
- Optionnel : un nom de domaine (ex. chez OVHcloud, déjà utilisé pour le reste du projet).

## 1. Backend + PostgreSQL sur Scalingo

1. Créer l'application depuis le dashboard Scalingo (« Create an app »), région Europe (Paris/Osc-fr1).
2. Dans l'app créée, ajouter l'addon **PostgreSQL** (onglet « Add-ons ») — plan « starter 512M » suffit pour démarrer (~7,20 €/mois).
3. Récupérer l'URL de connexion générée automatiquement par l'addon (variable du type `SCALINGO_POSTGRESQL_URL`), puis, dans l'onglet « Environment » de l'app, définir :
   ```
   DATABASE_URL=$SCALINGO_POSTGRESQL_URL
   ```
   (alias vers la variable injectée par l'addon — ne pas recopier l'URL en dur, elle change si la base est migrée).
4. Renseigner toutes les autres variables d'environnement listées dans `backend/.env.example`, **avec des valeurs de production différentes de celles utilisées en local** (secrets JWT régénérés, vraies clés Brevo/Mistral/OVH/Yousign/Stripe/Sentry) :
   - `PROJECT_DIR=backend` → **indispensable** : le dépôt Git contient aussi `frontend/`, cette variable dit à Scalingo de ne builder/déployer que le sous-dossier `backend/` (mécanisme officiel Scalingo pour les monorepos, pas besoin de fichier supplémentaire).
   - `NODE_ENV=production`
   - `FRONTEND_URL` → l'URL définitive du frontend (voir étape 3), pas encore connue au premier déploiement : mettre une valeur provisoire, à corriger ensuite (sert au CORS).
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PLATFORM_JWT_SECRET` → générer trois valeurs aléatoires distinctes, par exemple avec `openssl rand -base64 48` dans un terminal, une par variable. Ne jamais réutiliser les valeurs de développement.
   - `SMTP_*` → identifiants Brevo réels.
   - `S3_*` → bucket OVHcloud/Scaleway réel (peut être le même qu'en dev, ou un bucket dédié prod).
   - `MISTRAL_API_KEY`, `OVH_APP_KEY`/`OVH_APP_SECRET`/`OVH_CONSUMER_KEY`/`OVH_SMS_SERVICE_NAME`/`OVH_SMS_SENDER`, `YOUSIGN_API_KEY` → à renseigner quand ces intégrations doivent être actives en prod (sinon laisser vide, repli automatique sur les providers factices).
   - `SENTRY_DSN` → projet Sentry dédié à la prod (créer un projet séparé du projet de dev si besoin).
   - `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_PRICE_*` → **clés `sk_live_...` et `price_...` de production**, distinctes des clés de test. Le webhook Stripe doit pointer vers `https://<domaine-backend>/facturation/webhook`.
   - Ne PAS définir `PORT` : Scalingo l'injecte automatiquement dans chaque conteneur.
5. Déployer :
   - Le plus simple : connecter le dépôt GitHub/GitLab depuis l'onglet « Integrations » de l'app Scalingo (déploiement automatique à chaque push sur la branche choisie).
   - Alternative en ligne de commande : `git push scalingo main` (nécessite le remote Git ajouté par le dashboard/CLI Scalingo).
6. Au premier déploiement, `Procfile` (déjà présent dans `backend/`) :
   ```
   web: npm start
   postdeploy: npx prisma migrate deploy
   ```
   applique automatiquement les migrations Prisma après chaque déploiement réussi. Vérifier dans les logs Scalingo (`scalingo logs` ou onglet « Logs ») que la migration s'est bien exécutée.
7. **Ne pas exécuter `prisma:seed` en production** (le script crée des comptes de démonstration avec des mots de passe connus). Créer le premier compte plateforme et le premier cabinet via les vrais flux (`POST /platform` n'existe pas de flux d'inscription pour le compte plateforme lui-même — il faudra soit adapter `seed.ts` pour ne créer que le `PlatformAdmin` en prod avec un mot de passe fort, soit l'insérer manuellement une fois via `scalingo run` (conteneur one-off) avec un script dédié. Dis-le moi quand tu en es là, je peux préparer un script de bootstrap prod séparé du seed de démo.

## 2. Frontend sur Vercel (ou Netlify)

1. Depuis Vercel, « Import Project » → sélectionner le dépôt Git.
2. **Root Directory** : `frontend`.
3. Build command : `npm run build` (déjà le défaut Vite). Output directory : `dist`.
4. Variable d'environnement de build : `VITE_API_URL=https://<domaine-backend-scalingo>` (ex. `https://sassfr-backend.osc-fr1.scalingo.io`, ou le domaine personnalisé si configuré — voir étape 3).
5. Déployer. Vercel donne une URL `https://<projet>.vercel.app` gratuite avec HTTPS automatique.
6. Revenir sur Scalingo et mettre à jour `FRONTEND_URL` avec cette URL exacte (nécessaire pour que le CORS backend accepte les requêtes du frontend). Redéployer ou simplement enregistrer la variable (Scalingo redémarre l'app automatiquement).

## 3. Domaine personnalisé (optionnel)

- **Backend** : onglet « Domains » sur Scalingo, ajouter le sous-domaine choisi (ex. `api.tondomaine.fr`), configurer le CNAME chez le registrar (OVHcloud), certificat TLS Let's Encrypt généré automatiquement par Scalingo.
- **Frontend** : onglet « Domains » sur Vercel, même principe (CNAME ou A record selon les instructions données), certificat automatique.
- Une fois les deux domaines définitifs en place, mettre à jour `FRONTEND_URL` (backend) et `VITE_API_URL` (frontend, nécessite un redéploiement du frontend car c'est une variable de build, pas de runtime) avec les URLs finales.

## 4. Checklist de vérification post-déploiement

- [ ] `GET https://<domaine-backend>/health` répond `{"status":"ok"}`.
- [ ] Connexion (`/connexion`) fonctionne sur le frontend déployé.
- [ ] Un email de test (relance ou invitation) part bien via Brevo.
- [ ] Le webhook Stripe en prod reçoit un événement de test (`stripe trigger checkout.session.completed` en pointant la CLI Stripe vers l'URL prod, ou test réel en mode `sk_live_`).
- [ ] Une erreur provoquée volontairement apparaît bien dans Sentry.
- [ ] Les CGU et la politique de confidentialité (`legal/`) ont été complétées, relues par un juriste, et publiées sur le site avant toute inscription réelle de cabinet.
- [ ] Les secrets de production (`JWT_*`, `PLATFORM_JWT_SECRET`) sont différents de ceux utilisés en local/dev.

## Récapitulatif des coûts

| Poste | Fournisseur | Coût de départ |
|---|---|---|
| Backend (container S/M) | Scalingo | ~7,20-14,40 €/mois |
| PostgreSQL (starter 512M-1G) | Scalingo | ~7,20-14,40 €/mois |
| Frontend | Vercel/Netlify | Gratuit |
| Stockage documents | OVHcloud/Scaleway S3 | Selon volume, généralement quelques euros/mois |
| Email transactionnel | Brevo | Gratuit jusqu'à 300 emails/jour |
| Monitoring erreurs | Sentry | Gratuit jusqu'au palier de base |
| Paiement | Stripe | Gratuit hors commission par transaction (~1,5 % + 0,25 € en Europe) |
| OCR/SMS/Signature (Mistral/OVH/Yousign) | — | Payant à l'usage une fois activés, voir la liste de dépenses déjà fournie plus tôt dans le projet |
