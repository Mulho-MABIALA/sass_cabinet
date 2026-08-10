import { InputHTMLAttributes, useState } from "react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  // Permet de reprendre exactement le style des autres champs de chaque formulaire (thème clair ou
  // sombre, ex. console plateforme) : pas de style par défaut imposé côté bordure/fond.
  inputClassName: string;
  // Couleur de l'icône, à adapter selon le fond du formulaire (thème clair vs sombre).
  iconClassName?: string;
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.7 19.7 0 0 1 4.22-5.94" />
      <path d="M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.87 19.87 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// Champ mot de passe avec bouton "afficher/masquer" (icône œil), réutilisé sur tous les formulaires
// (connexion, inscription, invitation, console plateforme).
export function PasswordInput({ inputClassName, iconClassName, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} className={`${inputClassName} pr-10`} {...props} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className={`absolute inset-y-0 right-0 flex items-center px-3 ${iconClassName ?? "text-slate-400 hover:text-slate-600"}`}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
