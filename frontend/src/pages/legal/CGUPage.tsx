import { Link } from "react-router-dom";
import { LegalLayout, LegalSection } from "../../components/layout/LegalLayout";

export function CGUPage() {
  return (
    <LegalLayout titre="Conditions Générales de Vente et d'Utilisation (CGU/CGV)" derniereMiseAJour="10 août 2026">
      <LegalSection titre="Préambule">
        <p>
          Les présentes Conditions Générales de Vente et d'Utilisation (ci-après les « CGU ») régissent l'accès et
          l'utilisation du service <strong>Mon Dossier</strong> (ci-après le « Service »), plateforme SaaS de
          collecte et de vérification de dossiers clients à destination des cabinets de professions réglementées
          (avocats, notaires, syndics de copropriété, courtiers, experts-comptables), édité par une entreprise
          individuelle en cours d'immatriculation, représentée par Ibrahim-Trésor Mabiala-Mulho (ci-après
          l'« Éditeur »). L'identité juridique complète (raison sociale, SIRET, siège social) sera publiée dès
          l'obtention de l'immatriculation.
        </p>
        <p>
          Contact : imulhomabiala@gmail.com. Hébergeur applicatif : Scalingo SAS (France). Hébergeur du stockage
          documentaire : OVHcloud (Union européenne).
        </p>
        <p>Toute souscription au Service implique l'acceptation pleine et entière des présentes CGU par le client (ci-après le « Cabinet » ou le « Client »).</p>
      </LegalSection>

      <LegalSection titre="1. Définitions">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Service</strong> : la plateforme logicielle accessible en mode SaaS permettant au Cabinet de
            créer des dossiers, de collecter des documents auprès de ses propres clients (« Clients Finaux ») via un
            portail sécurisé, de suivre leur complétude, d'automatiser les relances et d'exporter les données vers
            ses outils métier.
          </li>
          <li>
            <strong>Cabinet</strong> : la personne morale (cabinet d'avocats, étude notariale, syndic, cabinet de
            courtage ou d'expertise-comptable) titulaire d'un compte sur le Service.
          </li>
          <li>
            <strong>Utilisateur</strong> : toute personne physique disposant d'un accès nominatif au Service pour le
            compte du Cabinet (administrateur ou collaborateur).
          </li>
          <li>
            <strong>Client Final</strong> : la personne physique ou morale, cliente du Cabinet, dont les documents
            sont collectés via le portail du Service à l'initiative du Cabinet.
          </li>
          <li>
            <strong>Compte</strong> : l'espace nominatif du Cabinet sur le Service, créé lors de l'inscription.
          </li>
          <li>
            <strong>Données</strong> : toute donnée, information ou document déposé, saisi ou généré sur le Service
            par le Cabinet, ses Utilisateurs ou les Clients Finaux.
          </li>
        </ul>
      </LegalSection>

      <LegalSection titre="2. Objet">
        <p>
          Les présentes CGU ont pour objet de définir les conditions et modalités dans lesquelles l'Éditeur met le
          Service à disposition du Cabinet, ainsi que les droits et obligations réciproques des parties dans ce
          cadre.
        </p>
      </LegalSection>

      <LegalSection titre="3. Accès au Service et inscription">
        <p>
          3.1. L'accès au Service est réservé aux personnes morales exerçant une activité professionnelle réglementée
          éligible (avocat, notaire, syndic de copropriété, courtier, expert-comptable). L'Éditeur se réserve le
          droit de vérifier cette qualité et de refuser ou suspendre l'accès en cas de doute raisonnable.
        </p>
        <p>
          3.2. L'inscription s'effectue en ligne, via le formulaire dédié, par la création d'un premier compte
          administrateur pour le Cabinet. Les informations fournies lors de l'inscription doivent être exactes,
          complètes et tenues à jour.
        </p>
        <p>
          3.3. L'administrateur du Cabinet peut ensuite inviter d'autres Utilisateurs (administrateurs ou
          collaborateurs) par email ; chaque Utilisateur choisit son propre mot de passe lors de l'activation de son
          compte et est responsable de la confidentialité de ses identifiants.
        </p>
        <p>
          3.4. Le Cabinet est seul responsable de l'usage qui est fait des accès attribués à ses Utilisateurs, y
          compris en cas d'usage non autorisé résultant d'un défaut de vigilance dans la gestion de ces accès.
        </p>
      </LegalSection>

      <LegalSection titre="4. Description du Service">
        <p>
          4.1. Le Service permet notamment : la création et le suivi de dossiers clients, la définition de listes de
          documents requis par type de dossier, la mise à disposition d'un portail sécurisé permettant au Client
          Final de déposer ses documents, l'envoi de relances automatiques par email et, le cas échéant, par SMS,
          l'extraction automatisée d'informations depuis les documents déposés (OCR) et la détection d'anomalies, la
          signature électronique de documents, l'export des données vers certains logiciels métier, et des fonctions
          d'intégration avec des outils tiers via webhooks.
        </p>
        <p>
          4.2. Certaines fonctionnalités reposent sur des prestataires techniques tiers (voir la Politique de
          confidentialité, section « Sous-traitants ») et peuvent être indisponibles ou dégradées en cas de
          dysfonctionnement de ces prestataires, sans que la responsabilité de l'Éditeur puisse être recherchée à ce
          titre au-delà de ses obligations de moyens.
        </p>
        <p>
          4.3. L'Éditeur se réserve le droit de faire évoluer les fonctionnalités du Service, d'en ajouter ou d'en
          retirer, sous réserve d'en informer le Cabinet dans un délai raisonnable lorsque cette évolution affecte
          substantiellement l'usage qu'il en fait.
        </p>
      </LegalSection>

      <LegalSection titre="5. Tarifs et modalités de paiement">
        <p>
          5.1. Le Service est proposé selon plusieurs formules (« Starter », facturée à l'usage en fonction du
          nombre de dossiers traités, « Cabinet » et « Premium », facturées au forfait), dont le détail et les
          tarifs en vigueur sont communiqués au Cabinet lors de la souscription et accessibles depuis son espace de
          facturation.
        </p>
        <p>
          5.2. Le paiement s'effectue par prélèvement automatique récurrent via le prestataire de paiement
          <strong> Stripe</strong>, dans les conditions générales d'utilisation de ce dernier acceptées séparément
          par le Cabinet lors de la mise en place du moyen de paiement. Le Cabinet peut à tout moment consulter ses
          factures et gérer son moyen de paiement depuis l'espace de gestion d'abonnement mis à disposition (portail
          Stripe).
        </p>
        <p>
          5.3. En cas d'échec de paiement, l'Éditeur en informe le Cabinet et peut suspendre l'accès au Service à
          l'issue d'un délai de régularisation de 15 jours, sans préjudice des sommes dues.
        </p>
        <p>5.4. Sauf mention contraire, les tarifs sont exprimés hors taxes et majorés du taux de TVA en vigueur.</p>
      </LegalSection>

      <LegalSection titre="6. Durée, suspension et résiliation">
        <p>
          6.1. Les présentes CGU prennent effet à compter de l'inscription du Cabinet et sont conclues pour la durée
          de l'abonnement souscrit, avec reconduction tacite selon les modalités propres à la formule choisie.
        </p>
        <p>
          6.2. Le Cabinet peut résilier son abonnement à tout moment depuis son espace de gestion d'abonnement ; la
          résiliation prend effet à l'échéance de la période en cours, sans remboursement prorata temporis sauf
          disposition légale contraire.
        </p>
        <p>
          6.3. L'Éditeur peut suspendre ou résilier l'accès au Service, après mise en demeure restée infructueuse, en
          cas de manquement grave du Cabinet à ses obligations (notamment usage non conforme, défaut de paiement,
          atteinte à la sécurité du Service ou aux droits de tiers).
        </p>
        <p>
          6.4. À l'issue de la résiliation, les Données du Cabinet sont conservées puis supprimées ou anonymisées
          conformément aux durées de conservation décrites dans la Politique de confidentialité, sauf obligation
          légale de conservation plus longue ou demande expresse d'export préalable formulée par le Cabinet.
        </p>
      </LegalSection>

      <LegalSection titre="7. Obligations du Cabinet">
        <p>
          7.1. Le Cabinet s'engage à n'utiliser le Service que pour les besoins légitimes de son activité
          professionnelle, dans le respect des lois et règlements applicables, y compris ceux régissant l'exercice de
          sa profession réglementée (secret professionnel, déontologie, obligations de vigilance LCB-FT le cas
          échéant).
        </p>
        <p>
          7.2. Le Cabinet demeure seul responsable des Données qu'il dépose, saisit ou fait déposer par ses Clients
          Finaux sur le Service, de leur exactitude, de leur licéité et du respect des droits des tiers (notamment
          des Clients Finaux) sur ces Données.
        </p>
        <p>
          7.3. Le Cabinet garantit disposer, à l'égard de ses Clients Finaux, de toute base légale et information
          nécessaire à la collecte de leurs données personnelles via le portail du Service, l'Éditeur agissant en
          qualité de sous-traitant au sens de l'article 28 du RGPD pour le traitement de ces données.
        </p>
        <p>
          7.4. Le Cabinet s'interdit tout usage du Service de nature à porter atteinte à la sécurité, à l'intégrité
          ou à la disponibilité de la plateforme, ainsi que toute tentative d'accès non autorisé aux données d'un
          autre Cabinet.
        </p>
      </LegalSection>

      <LegalSection titre="8. Obligations et responsabilité de l'Éditeur">
        <p>
          8.1. L'Éditeur s'engage à mettre en œuvre les moyens raisonnables pour assurer la disponibilité, la
          sécurité et le bon fonctionnement du Service, sans garantie d'absence totale d'interruption ou d'erreur.
        </p>
        <p>
          8.2. L'Éditeur ne saurait être tenu responsable des dommages résultant d'un usage non conforme du Service
          par le Cabinet, d'une indisponibilité imputable à un tiers (hébergeur, prestataire technique, opérateur de
          télécommunication) ou d'un cas de force majeure.
        </p>
        <p>
          8.3. La responsabilité de l'Éditeur, lorsqu'elle est engagée, est limitée aux dommages directs et
          plafonnée, tous préjudices confondus, au montant des sommes effectivement versées par le Cabinet au titre
          du Service au cours des douze (12) mois précédant le fait générateur.
        </p>
        <p>
          8.4. En aucun cas l'Éditeur ne pourra être tenu responsable des conséquences d'une décision professionnelle
          prise par le Cabinet sur la base des informations extraites automatiquement (OCR, détection d'anomalies)
          par le Service, ces fonctionnalités constituant une aide et non une validation juridique ou comptable des
          documents traités.
        </p>
      </LegalSection>

      <LegalSection titre="9. Protection des données personnelles">
        <p>
          Le traitement des données personnelles dans le cadre du Service est décrit dans la{" "}
          <Link to="/confidentialite" className="underline">
            Politique de confidentialité
          </Link>
          , qui fait partie intégrante des présentes CGU. Pour les données personnelles des Clients Finaux collectées
          pour le compte du Cabinet, l'Éditeur agit en qualité de sous-traitant au sens de l'article 28 du RGPD ; un
          contrat de sous-traitance spécifique peut être conclu séparément avec chaque Cabinet.
        </p>
      </LegalSection>

      <LegalSection titre="10. Propriété intellectuelle">
        <p>
          10.1. Le Service, son architecture, ses fonctionnalités, ses interfaces et tous les éléments qui le
          composent (à l'exclusion des Données du Cabinet) demeurent la propriété exclusive de l'Éditeur ou de ses
          concédants.
        </p>
        <p>
          10.2. Le Cabinet conserve l'ensemble des droits sur les Données qu'il dépose sur le Service et concède à
          l'Éditeur, pour la durée du contrat, une licence non exclusive d'utilisation de ces Données strictement
          limitée aux besoins de la fourniture du Service.
        </p>
      </LegalSection>

      <LegalSection titre="11. Confidentialité">
        <p>
          Chaque partie s'engage à conserver strictement confidentielles les informations non publiques de l'autre
          partie dont elle aurait connaissance à l'occasion de l'exécution des présentes, et à ne les utiliser que
          pour les besoins de la relation contractuelle.
        </p>
      </LegalSection>

      <LegalSection titre="12. Hébergement des données">
        <p>
          Les données du Service sont hébergées par <strong>Scalingo</strong> (application et base de données,
          France) et <strong>OVHcloud</strong> (stockage des documents, région Paris — Union européenne). La liste à
          jour des sous-traitants techniques figure dans la Politique de confidentialité.
        </p>
      </LegalSection>

      <LegalSection titre="13. Force majeure">
        <p>
          Aucune des parties ne pourra être tenue responsable d'un manquement à ses obligations résultant d'un cas de
          force majeure au sens de l'article 1218 du Code civil et de la jurisprudence des tribunaux français.
        </p>
      </LegalSection>

      <LegalSection titre="14. Modification des CGU">
        <p>
          L'Éditeur peut modifier les présentes CGU à tout moment, notamment pour se conformer à une évolution
          légale, réglementaire ou technique. Le Cabinet est informé de toute modification substantielle par email ou
          notification dans le Service au moins 30 jours avant son entrée en vigueur. La poursuite de l'utilisation
          du Service après cette date vaut acceptation des CGU modifiées.
        </p>
      </LegalSection>

      <LegalSection titre="15. Droit applicable et juridiction compétente">
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige et à défaut de résolution amiable,
          compétence exclusive est attribuée aux tribunaux du ressort du siège social de l'Éditeur, sous réserve des
          règles impératives applicables en matière de compétence.
        </p>
      </LegalSection>

      <LegalSection titre="16. Contact">
        <p>Pour toute question relative aux présentes CGU : imulhomabiala@gmail.com.</p>
      </LegalSection>
    </LegalLayout>
  );
}
