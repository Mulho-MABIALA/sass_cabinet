import { ChangeEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { portailApi } from "../../api/portail.api";
import { DocumentStatusBadge, DossierStatusBadge } from "../../components/ui/StatusBadge";
import { ApiError } from "../../api/client";

export function PortailClientPage() {
  const { token } = useParams<{ token: string }>();
  const queryClient = useQueryClient();
  const [erreurParDocument, setErreurParDocument] = useState<Record<string, string>>({});

  const {
    data: vue,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["portail", token],
    queryFn: () => portailApi.getByToken(token as string),
    enabled: Boolean(token),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ documentRequisId, file }: { documentRequisId: string; file: File }) =>
      portailApi.upload(token as string, documentRequisId, file),
    onSuccess: (_data, variables) => {
      setErreurParDocument((prev) => ({ ...prev, [variables.documentRequisId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["portail", token] });
    },
    onError: (err, variables) => {
      setErreurParDocument((prev) => ({
        ...prev,
        [variables.documentRequisId]: err instanceof ApiError ? err.message : "Échec de l'envoi",
      }));
    },
  });

  function handleFileChange(documentRequisId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ documentRequisId, file });
    event.target.value = "";
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-slate-500">Chargement…</p>;
  }

  if (error || !vue) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-red-600">Lien invalide ou expiré. Contactez votre cabinet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 space-y-1">
          <p className="text-sm text-slate-500">{vue.cabinetNom}</p>
          <h1 className="text-2xl font-semibold">Bonjour {vue.nomClient}</h1>
          <p className="text-sm text-slate-500">
            Dossier « {vue.typeDossierNom} » — <DossierStatusBadge statut={vue.statutDossier} />
          </p>
        </div>

        <div className="space-y-3">
          {vue.documents.map((doc) => (
            <div
              key={doc.documentDeposeId}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {doc.nom} {doc.obligatoire && <span className="text-red-600">*</span>}
                  </p>
                  {doc.description && (
                    <p className="text-xs text-slate-500">{doc.description}</p>
                  )}
                  {doc.nomFichier && (
                    <p className="mt-1 text-xs text-slate-500">Fichier : {doc.nomFichier}</p>
                  )}
                </div>
                <DocumentStatusBadge statut={doc.statut} />
              </div>

              {doc.statut !== "valide" && (
                <div className="mt-3">
                  <label className="inline-block cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                    {doc.statut === "manquant" ? "Déposer un fichier" : "Redéposer un fichier"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => handleFileChange(doc.documentRequisId, e)}
                    />
                  </label>
                  {erreurParDocument[doc.documentRequisId] && (
                    <p className="mt-1 text-xs text-red-600">
                      {erreurParDocument[doc.documentRequisId]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
