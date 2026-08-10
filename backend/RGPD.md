# Registre des activités de traitement (article 30 RGPD)

Ce document constitue le registre de traitement du produit **SaaS de collecte et vérification de dossiers clients**, à destination des cabinets professionnels utilisateurs (avocats, notaires, syndics, courtiers) agissant en qualité de **responsables de traitement**. L'éditeur du logiciel agit en qualité de **sous-traitant** au sens de l'article 28 du RGPD.

Dernière mise à jour : 2026-07-30.

## 1. Traitement : collecte et vérification de dossiers clients

### 1.1 Finalités

- Constitution, suivi et vérification de la complétude des dossiers clients confiés au cabinet (succession, transaction immobilière, dossier syndic, dossier courtage, etc.).
- Communication avec le client final pour la collecte des pièces manquantes (relances email/SMS).
- Génération de rapports de synthèse et export vers les logiciels métier du cabinet.
- Facturation à l'usage du service (comptage du nombre de dossiers traités).

### 1.2 Base légale

- Exécution du contrat liant le cabinet à son client (article 6.1.b RGPD) pour la collecte et la vérification des pièces.
- Intérêt légitime du cabinet (article 6.1.f RGPD) pour les relances et le suivi administratif du dossier.
- Obligations légales et réglementaires propres à la profession réglementée concernée (devoir de conseil, obligations de vigilance LCB-FT pour notaires/avocats, etc.), qui peuvent imposer des durées de conservation spécifiques primant sur la durée par défaut définie ci-dessous.

### 1.3 Catégories de données traitées

| Catégorie | Exemples de données | Origine |
|---|---|---|
| Identité du client final | Nom, prénom | Saisie par le collaborateur du cabinet |
| Coordonnées du client final | Email, téléphone (optionnel, pour les relances SMS) | Saisie par le collaborateur du cabinet |
| Documents justificatifs | Pièces d'identité, actes, justificatifs de domicile, diagnostics, contrats — déposés via le portail client sécurisé | Dépôt direct par le client final |
| Données extraites des documents (OCR/IA) | Montants, dates, identifiants détectés dans les documents, score de confiance | Traitement automatisé (stub en l'état actuel, à brancher sur un vrai provider OCR) |
| Anomalies détectées | Type d'anomalie et justification (document illisible, pièce expirée, montant incohérent) | Traitement automatisé (stub en l'état actuel) |
| Données de compte des collaborateurs du cabinet | Email professionnel, rôle, mot de passe (haché) | Création de compte par un administrateur du cabinet |
| Journal des relances | Canal (email/SMS), statut d'envoi, date | Généré par le système |

Aucune catégorie de données dite "sensible" au sens de l'article 9 du RGPD n'est collectée par la plateforme elle-même ; toutefois, selon la nature du dossier, certains documents déposés par le client (ex. pièces médicales dans un dossier de succession) peuvent en contenir incidemment — la vigilance du cabinet est requise sur ce point.

### 1.4 Destinataires des données

- Les collaborateurs et administrateurs du cabinet ayant un compte sur la plateforme, dans la limite de leurs habilitations (cloisonnement strict par cabinet).
- Le client final, pour ses propres données, via le portail sécurisé (lien à token unique).
- Le sous-traitant hébergeur (fournisseur de stockage objet S3-compatible, situé dans l'Union européenne — OVHcloud/Scaleway) pour le stockage chiffré des documents.
- **Mistral AI** (UE), pour l'extraction OCR des documents et la détection d'anomalies, lorsque `MISTRAL_API_KEY` est configuré (à défaut, traitement factice local, aucune donnée transmise).
- **OVHcloud** (UE), pour l'envoi des relances SMS, lorsque les identifiants OVH sont configurés (à défaut, aucun SMS n'est réellement envoyé).
- **Yousign** (France), pour la signature électronique des documents, lorsque `YOUSIGN_API_KEY` est configuré (à défaut, traitement factice local).
- **Brevo** (UE), pour l'envoi des emails transactionnels (relances, invitations).
- **Stripe** (États-Unis, certifié sous le cadre de transfert applicable — clauses contractuelles types), pour le traitement des paiements et abonnements des cabinets clients ; seules les données de facturation du cabinet (nom, email de contact administrateur) transitent par Stripe, jamais les données des clients finaux ni les documents déposés.
- **Sentry** (États-Unis ou UE selon la région du projet choisie), pour la remontée technique des erreurs serveur (traces d'erreur), lorsque `SENTRY_DSN` est configuré ; à minimiser pour ne pas y faire transiter de données personnelles des clients finaux.
- Le cas échéant, les éditeurs de logiciels métier du cabinet (Septeo/Diapaz, Cegid) dans le cadre d'un export explicitement déclenché par un collaborateur.
- Le cas échéant, des outils tiers d'automatisation (Zapier, Make) configurés par le cabinet via des webhooks sortants qu'il paramètre lui-même.
- Hébergement principal (base de données, stockage, SMTP) en zone UE. Stripe et, selon la région choisie, Sentry impliquent un transfert hors UE encadré par des clauses contractuelles types (CCT) : à faire valider par un juriste avant mise en production, et à documenter dans la politique de confidentialité destinée aux cabinets clients (voir `legal/politique-confidentialite.md`).

### 1.5 Durées de conservation

- **Dossier en cours** : les données sont conservées pendant toute la durée du traitement du dossier par le cabinet.
- **Après clôture du dossier** (passage au statut "complet") : les données personnelles du client (nom, email, téléphone) et les documents déposés sont conservés pendant une durée de rétention paramétrable par cabinet, définie par la variable d'environnement `RGPD_RETENTION_JOURS` (**1095 jours / 3 ans par défaut**), à l'issue de laquelle un job automatique anonymise le dossier et supprime les documents du stockage objet.
- **Droit à l'effacement anticipé** : un administrateur ou collaborateur du cabinet peut déclencher à tout moment l'anonymisation immédiate d'un dossier via l'action « Effacement RGPD » (endpoint `DELETE /dossiers/:id/rgpd`), sans attendre l'échéance de rétention automatique.
- **Comptes utilisateurs (collaborateurs/admin)** : conservés tant que le compte est actif au sein du cabinet.
- **Journal des relances** : conservé avec le dossier, purgé (cascade) lors de l'anonymisation du dossier.

### 1.6 Mesures de sécurité

- Authentification des utilisateurs par mot de passe haché (bcrypt) + jetons JWT (accès de courte durée, rafraîchissement séparé).
- Cloisonnement strict des données par cabinet (toutes les requêtes sont filtrées par `cabinetId`).
- Accès du client final aux documents de son dossier via un lien à jeton unique (UUID non devinable), sans authentification classique mais à durée de vie et de portée limitée au dossier concerné.
- Chiffrement au repos des documents stockés (paramètre `ServerSideEncryption: AES256` sur le stockage objet S3-compatible).
- Chiffrement en transit (HTTPS) attendu en production sur l'ensemble des flux (API, portail, stockage objet).
- Limitation du type et de la taille des fichiers acceptés lors du dépôt (PDF/JPEG/PNG/WEBP, 15 Mo maximum).
- Suppression effective des fichiers dans le stockage objet lors de l'anonymisation (et pas seulement en base de données).
- Journalisation des erreurs d'envoi (relances, webhooks) à des fins de suivi opérationnel, sans conservation du contenu des documents dans les journaux applicatifs.

## 2. Droits des personnes concernées

Les personnes concernées (clients finaux des cabinets) disposent des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité prévus par le RGPD. Ces droits s'exercent auprès du cabinet, responsable de traitement, qui peut les mettre en œuvre via son compte (correction des informations du dossier, déclenchement de l'effacement RGPD). L'éditeur de la plateforme, en tant que sous-traitant, met à disposition du cabinet les fonctionnalités techniques nécessaires à l'exercice de ces droits mais ne traite pas directement les demandes des personnes concernées.

## 3. Sous-traitance ultérieure

L'éditeur de la plateforme fait appel aux sous-traitants ultérieurs suivants (actifs uniquement si la clé d'API correspondante est configurée ; à défaut, repli sur un traitement factice local sans transmission de données) :
- Hébergeur de la base de données PostgreSQL.
- Hébergeur du stockage objet S3-compatible (documents) — OVHcloud/Scaleway, UE.
- Brevo (emails transactionnels, UE).
- Mistral AI (OCR, extraction de données, détection d'anomalies, UE).
- OVHcloud SMS (relances par SMS, UE).
- Yousign (signature électronique, France).
- Stripe (paiement et facturation des cabinets clients, hors UE — CCT).
- Sentry (monitoring des erreurs applicatives, si activé).

Chacun de ces sous-traitants doit faire l'objet d'un contrat de sous-traitance (article 28 RGPD) avant mise en production, et être répercuté dans la liste des sous-traitants communiquée aux cabinets clients (obligation d'information préalable en cas d'ajout d'un nouveau sous-traitant ultérieur).

## 4. Points d'attention pour la mise en production

- Vérifier, pour chaque profession réglementée cliente (avocat, notaire, syndic, courtier), si une durée de conservation légale spécifique doit primer sur la durée par défaut de 3 ans (ex. archivage notarial, obligations LCB-FT).
- Formaliser un contrat de sous-traitance (article 28 RGPD) avec le cabinet client, ainsi qu'avec chacun des sous-traitants ultérieurs listés en section 3 (Mistral AI, OVHcloud, Yousign, Brevo, Stripe, Sentry).
- Réaliser une analyse d'impact relative à la protection des données (AIPD) si l'ampleur des traitements (volumes de données sensibles, profilage via anomalies détectées) le justifie.
