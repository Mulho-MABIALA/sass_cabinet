> **Brouillon de travail — non publiable en l'état.** Ce document doit être relu et validé par un avocat ou juriste (idéalement avec l'appui d'un DPO) avant toute publication. Tous les champs entre crochets `[...]` doivent être complétés. Ce document s'articule avec le registre de traitement technique détaillé dans `backend/RGPD.md`. Dernière génération : 2026-08-06.

# Politique de confidentialité

## 1. Qui sommes-nous

**[Raison sociale de la société]**, [forme juridique] au capital de [montant] €, immatriculée au RCS de [ville] sous le numéro [SIRET/RCS], dont le siège social est situé [adresse complète] (ci-après « **nous** » ou l'« **Éditeur** »), édite le service **[NOM COMMERCIAL DU PRODUIT]** (ci-après le « **Service** »), une plateforme de collecte et de vérification de dossiers clients à destination des cabinets de professions réglementées.

Délégué à la protection des données (DPO) / point de contact RGPD : [nom ou fonction], [email dédié, ex. dpo@...].

Cette politique explique quelles données nous traitons, pour quelles finalités, pendant combien de temps, avec qui elles peuvent être partagées, et comment exercer vos droits.

## 2. Deux rôles distincts selon les données concernées

Selon la nature des données, l'Éditeur agit soit comme **responsable de traitement**, soit comme **sous-traitant** au sens du RGPD :

- **Responsable de traitement** pour : les données des cabinets clients eux-mêmes et de leurs Utilisateurs (comptes, facturation, contacts commerciaux, données de navigation sur notre site).
- **Sous-traitant**, agissant sur instruction du Cabinet (responsable de traitement), pour : les données des Clients Finaux du Cabinet collectées via le portail sécurisé du Service (identité, coordonnées, documents déposés). Pour ces données, toute demande d'exercice de droits doit être adressée en priorité au Cabinet concerné ; le détail des traitements réalisés pour le compte des Cabinets figure dans le registre technique `backend/RGPD.md` et, le cas échéant, dans le contrat de sous-traitance conclu avec chaque Cabinet.

## 3. Données que nous traitons en tant que responsable de traitement

| Catégorie | Exemples | Finalité | Base légale |
|---|---|---|---|
| Compte Cabinet et Utilisateurs | Nom du cabinet, secteur d'activité, email professionnel, mot de passe (haché), rôle | Création et gestion du compte, authentification, gestion des droits d'accès | Exécution du contrat (art. 6.1.b) |
| Facturation | Nom du cabinet, email de l'administrateur, identifiant client Stripe, historique d'abonnement et de paiement | Facturation, gestion de l'abonnement, prévention de la fraude | Exécution du contrat (art. 6.1.b), obligations comptables et fiscales (art. 6.1.c) |
| Support et contact commercial | Coordonnées, contenu des échanges | Réponse aux demandes, suivi de la relation client | Intérêt légitime (art. 6.1.f) |
| Données techniques de connexion | Adresse IP, journaux applicatifs, erreurs techniques | Sécurité, diagnostic et correction des incidents | Intérêt légitime (art. 6.1.f) |

## 4. Données que nous traitons en tant que sous-traitant, pour le compte des Cabinets

Ces données concernent les **Clients Finaux** des Cabinets, c'est-à-dire les personnes dont le dossier est constitué par un Cabinet utilisateur du Service : identité (nom, prénom), coordonnées (email, téléphone le cas échéant), documents justificatifs déposés via le portail sécurisé, ainsi que les données extraites automatiquement de ces documents (montants, dates, anomalies détectées).

Ces données sont traitées exclusivement sur instruction du Cabinet, pour les finalités qu'il détermine (constitution et suivi du dossier, relances). Le détail complet — catégories de données, durées de conservation, mesures de sécurité — figure dans le registre de traitement technique (`backend/RGPD.md`), tenu à jour et communicable sur demande.

## 5. Destinataires et sous-traitants ultérieurs

Nous faisons appel aux prestataires suivants, chacun n'intervenant que dans la mesure où l'intégration correspondante est activée par l'Éditeur :

| Prestataire | Rôle | Localisation | Données concernées |
|---|---|---|---|
| [Hébergeur base de données] | Hébergement de la base de données | Union européenne | Toutes les données du Service |
| OVHcloud / Scaleway (Object Storage) | Stockage des documents déposés | Union européenne | Documents déposés par les Clients Finaux |
| Mistral AI | Extraction OCR et détection d'anomalies dans les documents | Union européenne | Contenu des documents déposés |
| OVHcloud SMS | Envoi des relances par SMS | Union européenne | Numéro de téléphone et contenu du message de relance |
| Yousign | Signature électronique de documents | France | Documents transmis en signature, identité et email du signataire |
| Brevo | Envoi des emails transactionnels (relances, invitations) | Union européenne | Email et contenu des messages envoyés |
| Stripe | Traitement des paiements et gestion des abonnements des Cabinets | États-Unis (clauses contractuelles types) | Données de facturation du Cabinet (nom, email administrateur) — jamais les données des Clients Finaux |
| Sentry | Suivi et diagnostic des erreurs techniques | [UE ou États-Unis selon la région du projet configurée] | Journaux techniques d'erreur ; à configurer pour minimiser toute donnée personnelle transmise |

Cette liste est mise à jour à mesure de l'évolution des intégrations techniques du Service. Tout ajout d'un nouveau sous-traitant ultérieur impliquant les données des Clients Finaux fait l'objet d'une information préalable des Cabinets concernés, conformément à l'article 28 du RGPD.

## 6. Transferts de données hors Union européenne

L'hébergement principal (base de données, stockage documentaire, email) est situé dans l'Union européenne. Le recours à **Stripe** (paiement) implique un transfert de données vers les États-Unis, encadré par les clauses contractuelles types de la Commission européenne. Si **Sentry** est configuré sur une région hors UE, le même encadrement s'applique. [À compléter avec la liste précise des garanties contractuelles effectivement mises en place avant mise en production.]

## 7. Durées de conservation

- Données de compte Cabinet/Utilisateur : conservées pendant toute la durée de la relation contractuelle, puis supprimées ou archivées conformément aux obligations légales (notamment comptables) à l'issue d'un délai de [X] mois après résiliation.
- Données de facturation : conservées pendant la durée légale de conservation des documents comptables (10 ans en France pour les pièces justificatives comptables).
- Données des Clients Finaux (dossiers, documents) : conservées selon la durée définie par chaque Cabinet, avec anonymisation automatique 3 ans après clôture du dossier par défaut (paramètre `RGPD_RETENTION_JOURS`), ou effacement anticipé à la demande du Cabinet. Voir `backend/RGPD.md` pour le détail.
- Journaux techniques et données de sécurité : conservés [X] mois, dans la limite nécessaire au diagnostic d'incidents et aux obligations légales applicables.

## 8. Sécurité des données

Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger les données traitées : chiffrement au repos des documents stockés, authentification par mot de passe haché et jetons d'accès à durée de vie limitée, cloisonnement strict des données entre Cabinets, chiffrement des communications (HTTPS), et limitation des accès aux seules personnes habilitées. Le détail des mesures figure dans `backend/RGPD.md`.

## 9. Cookies et traceurs

[À compléter selon l'implémentation réelle du site vitrine et de l'application. En l'état, l'application utilise le stockage local du navigateur (jetons de connexion) strictement nécessaire au fonctionnement du Service, sans dépôt de cookie publicitaire ou de mesure d'audience tiers. Si un outil d'analyse d'audience ou de mesure marketing est ajouté par la suite, un bandeau de consentement conforme aux recommandations de la CNIL devra être mis en place.]

## 10. Vos droits

Conformément au RGPD, toute personne concernée dispose des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur les données la concernant, ainsi que du droit de définir des directives relatives au sort de ses données après son décès.

- **Si vous êtes un Cabinet ou un Utilisateur** : ces droits s'exercent directement auprès de nous à l'adresse [email de contact RGPD], ou depuis votre espace de compte pour les données qui y sont directement modifiables.
- **Si vous êtes le Client Final d'un Cabinet** utilisant le Service : ces droits s'exercent en priorité auprès du Cabinet concerné, responsable de traitement de vos données ; nous mettons à sa disposition les fonctionnalités techniques nécessaires (rectification, effacement) pour y répondre.

Vous disposez également du droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) — [www.cnil.fr](https://www.cnil.fr) — si vous estimez que vos droits ne sont pas respectés.

## 11. Modifications de la présente politique

Cette politique peut être mise à jour pour refléter une évolution légale, réglementaire ou technique du Service (notamment l'activation d'un nouveau sous-traitant listé en section 5). La date de dernière mise à jour figure en tête de ce document. En cas de modification substantielle, les Cabinets en sont informés par email ou notification dans le Service.

## 12. Contact

Pour toute question relative à cette politique ou à l'exercice de vos droits : [email de contact], [adresse postale].

---

*Document généré comme brouillon de travail, à compléter et faire valider par un professionnel du droit avant publication — en particulier la section 6 (transferts hors UE, garanties Stripe/Sentry) et la section 7 (durées de conservation précises), qui engagent la conformité réelle du Service.*
