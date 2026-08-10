import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { typeDossiersApi } from "../../api/typeDossiers.api";
import { dossiersApi } from "../../api/dossiers.api";
import { createDossierFormSchema } from "../../schemas/dossier.schema";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";

export function NouveauDossierPage() {
  const navigate = useNavigate();

  const { data: typeDossiers } = useQuery({
    queryKey: ["type-dossiers"],
    queryFn: () => typeDossiersApi.list(),
  });

  const [typeDossierId, setTypeDossierId] = useState("");
  const [nomClient, setNomClient] = useState("");
  const [emailClient, setEmailClient] = useState("");
  const [telephoneClient, setTelephoneClient] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const typeSelectionne = typeDossiers?.find((t) => t.id === typeDossierId);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErreur(null);

    const parsed = createDossierFormSchema.safeParse({
      typeDossierId,
      nomClient,
      emailClient,
      telephoneClient,
    });
    if (!parsed.success) {
      setErreur(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    setChargement(true);
    try {
      const dossier = await dossiersApi.create(parsed.data);
      navigate(`/dossiers/${dossier.id}`);
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Erreur lors de la création");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Nouveau dossier</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div className="space-y-1">
          <label htmlFor="typeDossier" className="text-sm font-medium">
            Type de dossier
          </label>
          <select
            id="typeDossier"
            value={typeDossierId}
            onChange={(e) => setTypeDossierId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Sélectionner...</option>
            {typeDossiers?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nom}
              </option>
            ))}
          </select>
          {typeSelectionne && (
            <p className="text-xs text-slate-500">
              Checklist : {typeSelectionne.documentsRequis.map((d) => d.nom).join(", ")}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="nomClient" className="text-sm font-medium">
            Nom du client
          </label>
          <input
            id="nomClient"
            value={nomClient}
            onChange={(e) => setNomClient(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="emailClient" className="text-sm font-medium">
            Email du client
          </label>
          <input
            id="emailClient"
            type="email"
            value={emailClient}
            onChange={(e) => setEmailClient(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="telephoneClient" className="text-sm font-medium">
            Téléphone du client (optionnel — active les relances par SMS)
          </label>
          <input
            id="telephoneClient"
            type="tel"
            placeholder="+33612345678"
            value={telephoneClient}
            onChange={(e) => setTelephoneClient(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <Button type="submit" disabled={chargement} className="w-full">
          {chargement ? "Création..." : "Créer le dossier"}
        </Button>
      </form>
    </div>
  );
}
