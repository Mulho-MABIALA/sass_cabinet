import { Link } from "react-router-dom";

export function PublicFooter() {
  const annee = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {annee} Mon Dossier. Tous droits réservés.</p>
        <nav className="flex flex-wrap gap-4">
          <Link to="/" className="hover:text-slate-800">
            Accueil
          </Link>
          <Link to="/cgu" className="hover:text-slate-800">
            CGU / CGV
          </Link>
          <Link to="/confidentialite" className="hover:text-slate-800">
            Politique de confidentialité
          </Link>
          <a href="mailto:imulhomabiala@gmail.com" className="hover:text-slate-800">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
