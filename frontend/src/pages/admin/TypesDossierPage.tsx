import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { typeDossiersApi } from "../../api/typeDossiers.api";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../api/client";
import { Secteur } from "../../types";

const LABELS_SECTEUR: Record<Secteur, string> = {
  avocat: "Avocat",
  notaire: "Notaire",
  syndic: "Syndic",
  courtier: "Courtier",
  expert_comptable: "Expert-comptable",
};

interface LigneDocument {
  nom: string;
  description: string;
  obligatoire: boolean;
}

function ligneVide(): LigneDocument {
  return { nom: "", description: "", obligatoire: true };
}

export function TypesDossierPage() {
  const queryClient = useQueryClient();
  const [nom, setNom] = useState("");
  const [secteur, setSecteur] = useState<Secteur>("avocat");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<LigneDocument[]>([ligneVide()]);
  const [erreur, setErreur] = useState<string | null>(null);

  const { data: typeDossiers, isLoading, error } = useQuery({
    queryKey: ["type-dossiers"],
    queryFn: () => typeDossiersApi.list(),
  });

  const creerMutation = useMutation({
    mutationFn: () =>
      typeDossiersApi.create({
        nom,
        secteur,
        description: description || undefined,
        documentsRequis: documents
          .filter((d) => d.nom.trim())
          .map((d) => ({
            nom: d.nom,
            description: d.description || undefined,
            obligatoire: d.obligatoire,
          })),
      }),
    onSuccess: () => {
      setNom("");
      setDescription("");
      setDocuments([ligneVide()]);
      setErreur(null);
      queryClient.invalidateQueries({ queryKey: ["type-dossiers"] });
    },
    onError: (err) => setErreur(err instanceof ApiError ? err.message : "Erreur lors de la création"),
  });

  function majLigne(index: number, champ: keyof LigneDocument, valeur: string | boolean) {
    setDocuments((prev) =>
      prev.map((ligne, i) => (i === index ? { ...ligne, [champ]: valeur } : ligne))
    );
  }

  function ajouterLigne() {
    setDocuments((prev) => [...prev, ligneVide()]);
  }

  function supprimerLigne(index: number) {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!nom.trim()) {
      setErreur("Nom du type de dossier requis");
      return;
    }
    if (documents.filter((d) => d.nom.trim()).length === 0) {
      setErreur("Au moins un document requis dans la checklist");
      return;
    }
    creerMutation.mutate();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Types de dossier</h1>
        <p className="mt-1 text-sm text-slate-500">
          Checklists de documents demandées aux clients, par type de dossier.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="nom" className="text-sm font-medium">
              Nom
            </label>
            <input
              id="nom"
              placeholder="Ex. Succession"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="secteur" className="text-sm font-medium">
              Secteur
            </label>
            <select
              id="secteur"
              value={secteur}
              onChange={(e) => setSecteur(e.target.value as Secteur)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {Object.entries(LABELS_SECTEUR).map(([valeur, label]) => (
                <option key={valeur} value={valeur}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium">
            Description (optionnel)
          </label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Checklist de documents</p>
          {documents.map((ligne, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 p-2">
              <input
                placeholder="Nom du document"
                value={ligne.nom}
                onChange={(e) => majLigne(index, "nom", e.target.value)}
                className="min-w-[10rem] flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Description (optionnel)"
                value={ligne.description}
                onChange={(e) => majLigne(index, "description", e.target.value)}
                className="min-w-[10rem] flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <label className="flex items-center gap-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={ligne.obligatoire}
                  onChange={(e) => majLigne(index, "obligatoire", e.target.checked)}
                />
                Obligatoire
              </label>
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
                onClick={() => supprimerLigne(index)}
                disabled={documents.length === 1}
              >
                Retirer
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={ajouterLigne}>
            + Ajouter un document
          </Button>
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <Button type="submit" disabled={creerMutation.isPending}>
          {creerMutation.isPending ? "Création..." : "Créer le type de dossier"}
        </Button>
      </form>

      {isLoading && <p className="text-sm text-slate-500">Chargement…</p>}
      {error && <p className="text-sm text-red-600">Impossible de charger les types de dossier.</p>}

      {typeDossiers && (
        <div className="space-y-3">
          {typeDossiers.map((type) => (
            <div key={type.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{type.nom}</p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                  {LABELS_SECTEUR[type.secteur]}
                </span>
              </div>
              {type.description && <p className="mt-1 text-sm text-slate-500">{type.description}</p>}
              <ul className="mt-2 space-y-0.5 text-sm text-slate-600">
                {type.documentsRequis.map((doc) => (
                  <li key={doc.id}>
                    {doc.nom} {doc.obligatoire ? "" : "(optionnel)"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {typeDossiers.length === 0 && (
            <p className="text-sm text-slate-500">Aucun type de dossier pour l'instant.</p>
          )}
        </div>
      )}
    </div>
  );
}
