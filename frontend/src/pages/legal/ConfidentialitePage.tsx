import { LegalLayout, LegalSection } from "../../components/layout/LegalLayout";

const SOUS_TRAITANTS = [
  { prestataire: "Scalingo", role: "Hébergement de l'application et de la base de données", localisation: "France" },
  {
    prestataire: "OVHcloud (Object Storage)",
    role: "Stockage des documents déposés",
    localisation: "Union européenne (Paris, France)",
  },
  {
    prestataire: "Mistral AI",
    role: "Extraction OCR et détection d'anomalies dans les documents",
    localisation: "Union européenne",
  },
  { prestataire: "OVHcloud SMS", role: "Envoi des relances par SMS", localisation: "Union européenne" },
  { prestataire: "Yousign", role: "Signature électronique de documents", localisation: "France" },
  {
    prestataire: "Brevo",
    role: "Envoi des emails transactionnels (relances, invitations)",
    localisation: "Union européenne",
  },
  {
    prestataire: "Stripe",
    role: "Traitement des paiements et gestion des abonnements des Cabinets",
    localisation: "États-Unis (clauses contractuelles types)",
  },
  {
    prestataire: "Sentry",
    role: "Suivi et diagnostic des erreurs techniques",
    localisation: "Union européenne (Francfort, Allemagne)",
  },
];

export function ConfidentialitePage() {
  return (
    <LegalLayout titre="Politique de confidentialité" derniereMiseAJour="10 août 2026">
      <LegalSection titre="1. Qui sommes-nous">
        <p>
          Le Service <strong>Mon Dossier</strong>, plateforme de collecte et de vérification de dossiers clients à
          destination des cabinets de professions réglementées, est édité par une entreprise individuelle en cours
          d'immatriculation, représentée par Ibrahim-Trésor Mabiala-Mulho (ci-après « nous » ou l'« Éditeur »).
          L'identité juridique complète sera publiée dès l'obtention de l'immatriculation.
        </p>
        <p>Point de contact RGPD : imulhomabiala@gmail.com.</p>
        <p>
          Cette politique explique quelles données nous traitons, pour quelles finalités, pendant combien de temps,
          avec qui elles peuvent être partagées, et comment exercer vos droits.
        </p>
      </LegalSection>

      <LegalSection titre="2. Deux rôles distincts selon les données concernées">
        <p>Selon la nature des données, l'Éditeur agit soit comme responsable de traitement, soit comme sous-traitant au sens du RGPD :</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Responsable de traitement</strong> pour : les données des cabinets clients eux-mêmes et de leurs
            Utilisateurs (comptes, facturation, contacts commerciaux, données de navigation sur notre site).
          </li>
          <li>
            <strong>Sous-traitant</strong>, agissant sur instruction du Cabinet (responsable de traitement), pour :
            les données des Clients Finaux du Cabinet collectées via le portail sécurisé du Service (identité,
            coordonnées, documents déposés). Pour ces données, toute demande d'exercice de droits doit être adressée
            en priorité au Cabinet concerné.
          </li>
        </ul>
      </LegalSection>

      <LegalSection titre="3. Données traitées en tant que responsable de traitement">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="py-2 pr-3 font-semibold">Catégorie</th>
                <th className="py-2 pr-3 font-semibold">Finalité</th>
                <th className="py-2 font-semibold">Base légale</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-3">Compte Cabinet et Utilisateurs</td>
                <td className="py-2 pr-3">Création et gestion du compte, authentification, gestion des droits</td>
                <td className="py-2">Exécution du contrat</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-3">Facturation</td>
                <td className="py-2 pr-3">Facturation, gestion de l'abonnement, prévention de la fraude</td>
                <td className="py-2">Exécution du contrat, obligations comptables</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-3">Support et contact commercial</td>
                <td className="py-2 pr-3">Réponse aux demandes, suivi de la relation client</td>
                <td className="py-2">Intérêt légitime</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Données techniques de connexion</td>
                <td className="py-2 pr-3">Sécurité, diagnostic et correction des incidents</td>
                <td className="py-2">Intérêt légitime</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection titre="4. Données traitées en tant que sous-traitant, pour le compte des Cabinets">
        <p>
          Ces données concernent les Clients Finaux des Cabinets, c'est-à-dire les personnes dont le dossier est
          constitué par un Cabinet utilisateur du Service : identité (nom, prénom), coordonnées (email, téléphone le
          cas échéant), documents justificatifs déposés via le portail sécurisé, ainsi que les données extraites
          automatiquement de ces documents (montants, dates, anomalies détectées).
        </p>
        <p>
          Ces données sont traitées exclusivement sur instruction du Cabinet, pour les finalités qu'il détermine
          (constitution et suivi du dossier, relances).
        </p>
      </LegalSection>

      <LegalSection titre="5. Destinataires et sous-traitants ultérieurs">
        <p>
          Nous faisons appel aux prestataires suivants, chacun n'intervenant que dans la mesure où l'intégration
          correspondante est activée par l'Éditeur :
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="py-2 pr-3 font-semibold">Prestataire</th>
                <th className="py-2 pr-3 font-semibold">Rôle</th>
                <th className="py-2 font-semibold">Localisation</th>
              </tr>
            </thead>
            <tbody>
              {SOUS_TRAITANTS.map((s) => (
                <tr key={s.prestataire} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-3 font-medium">{s.prestataire}</td>
                  <td className="py-2 pr-3">{s.role}</td>
                  <td className="py-2">{s.localisation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Cette liste est mise à jour à mesure de l'évolution des intégrations techniques du Service. Tout ajout d'un
          nouveau sous-traitant ultérieur impliquant les données des Clients Finaux fait l'objet d'une information
          préalable des Cabinets concernés, conformément à l'article 28 du RGPD.
        </p>
      </LegalSection>

      <LegalSection titre="6. Transferts de données hors Union européenne">
        <p>
          L'hébergement principal (base de données, stockage documentaire, email) est situé dans l'Union européenne.
          Le recours à <strong>Stripe</strong> (paiement) implique un transfert de données vers les États-Unis,
          encadré par les clauses contractuelles types de la Commission européenne.
        </p>
      </LegalSection>

      <LegalSection titre="7. Durées de conservation">
        <ul className="list-disc space-y-2 pl-5">
          <li>Données de compte Cabinet/Utilisateur : conservées pendant toute la durée de la relation contractuelle, puis 12 mois après résiliation.</li>
          <li>Données de facturation : conservées 10 ans (durée légale de conservation des documents comptables).</li>
          <li>
            Données des Clients Finaux (dossiers, documents) : conservées selon la durée définie par chaque Cabinet,
            avec anonymisation automatique 3 ans après clôture du dossier par défaut, ou effacement anticipé à la
            demande du Cabinet.
          </li>
          <li>Journaux techniques et données de sécurité : conservés 12 mois.</li>
        </ul>
      </LegalSection>

      <LegalSection titre="8. Sécurité des données">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger les données traitées :
          chiffrement au repos des documents stockés, authentification par mot de passe haché et jetons d'accès à
          durée de vie limitée, cloisonnement strict des données entre Cabinets, chiffrement des communications
          (HTTPS), et limitation des accès aux seules personnes habilitées.
        </p>
      </LegalSection>

      <LegalSection titre="9. Cookies et traceurs">
        <p>
          L'application utilise le stockage local du navigateur (jetons de connexion) strictement nécessaire au
          fonctionnement du Service, sans dépôt de cookie publicitaire ou de mesure d'audience tiers. Si un outil
          d'analyse d'audience ou de mesure marketing est ajouté par la suite, un bandeau de consentement conforme
          aux recommandations de la CNIL sera mis en place.
        </p>
      </LegalSection>

      <LegalSection titre="10. Vos droits">
        <p>
          Conformément au RGPD, toute personne concernée dispose des droits d'accès, de rectification, d'effacement,
          de limitation, d'opposition et de portabilité sur les données la concernant.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Si vous êtes un Cabinet ou un Utilisateur</strong> : ces droits s'exercent directement auprès de
            nous à l'adresse imulhomabiala@gmail.com, ou depuis votre espace de compte.
          </li>
          <li>
            <strong>Si vous êtes le Client Final d'un Cabinet</strong> utilisant le Service : ces droits s'exercent
            en priorité auprès du Cabinet concerné, responsable de traitement de vos données.
          </li>
        </ul>
        <p>
          Vous disposez également du droit d'introduire une réclamation auprès de la Commission Nationale de
          l'Informatique et des Libertés (CNIL) —{" "}
          <a href="https://www.cnil.fr" className="underline" target="_blank" rel="noreferrer">
            www.cnil.fr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection titre="11. Modifications de la présente politique">
        <p>
          Cette politique peut être mise à jour pour refléter une évolution légale, réglementaire ou technique du
          Service. La date de dernière mise à jour figure en tête de ce document. En cas de modification
          substantielle, les Cabinets en sont informés par email ou notification dans le Service.
        </p>
      </LegalSection>

      <LegalSection titre="12. Contact">
        <p>Pour toute question relative à cette politique ou à l'exercice de vos droits : imulhomabiala@gmail.com.</p>
      </LegalSection>
    </LegalLayout>
  );
}
