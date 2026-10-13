import { useEffect, useState, useCallback, useMemo } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { HistoriqueDemandeClient } from "../types/HistoriqueDemandeClient.types";

// Query for single lignecommande_id
const getHistoriqueDemandeClientQuery = (lignecommande_id: number) => `{
  historiquedemandeclients(lignecommande_id: ${lignecommande_id}) {
    id
    quantite_actuelle
    quantite_demandee
    motif_demande
    affecter_nouveau_lot
    lignecommande_id
    statut
    motif_refus
    demandeur_id
    validateur_id
    date_demande
    date_traitement
  }
}`;

export interface HistoriqueByLigneId {
  [lignecommande_id: number]: HistoriqueDemandeClient[];
}

interface UseHistoriqueDemandeClientBatchResult {
  historiqueByLigneId: HistoriqueByLigneId;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasDemandeEnCours: (ligneId: number) => boolean;
  getDerniereDemande: (ligneId: number) => HistoriqueDemandeClient | null;
  getHistorique: (ligneId: number) => HistoriqueDemandeClient[];
}

/**
 * Hook to fetch historiquedemandeclients for multiple lignecommande_ids
 * Fetches each ID individually in parallel using Promise.all
 */
const useHistoriqueDemandeClientBatch = (
  lignecommande_ids: (number | undefined)[]
): UseHistoriqueDemandeClientBatchResult => {
  const [historiqueByLigneId, setHistoriqueByLigneId] = useState<HistoriqueByLigneId>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out undefined values and get unique IDs
  const validIds = useMemo(() => {
    return [...new Set(lignecommande_ids.filter((id): id is number => id !== undefined && id !== null))];
  }, [lignecommande_ids]);

  const fetchHistorique = useCallback(async () => {
    if (validIds.length === 0) {
      setHistoriqueByLigneId({});
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch individually for each id in parallel
      const results = await Promise.all(
        validIds.map(async (id) => {
          try {
            const response = await fetchGraphQL<{
              data: { historiquedemandeclients: HistoriqueDemandeClient[] };
            }>(getHistoriqueDemandeClientQuery(id));
            return {
              id,
              data: response.data?.data?.historiquedemandeclients || []
            };
          } catch {
            return { id, data: [] };
          }
        })
      );

      // Group by lignecommande_id
      const grouped: HistoriqueByLigneId = {};
      results.forEach(result => {
        grouped[result.id] = result.data;
      });

      setHistoriqueByLigneId(grouped);
    } catch (err: any) {
      console.error("[useHistoriqueDemandeClientBatch] Erreur:", err);
      setError(
        err.message ||
          "Erreur lors de la récupération de l'historique des demandes."
      );
      setHistoriqueByLigneId({});
    } finally {
      setLoading(false);
    }
  }, [validIds]);

  useEffect(() => {
    fetchHistorique();
  }, [fetchHistorique]);

  // Check if a specific ligne has a pending request
  const hasDemandeEnCours = useCallback((ligneId: number): boolean => {
    const historique = historiqueByLigneId[ligneId] || [];
    return historique.some(
      (demande) =>
        demande.statut === 0 ||
        demande.statut === "0" ||
        demande.statut === "en_attente" ||
        demande.statut === "pending"
    );
  }, [historiqueByLigneId]);

  // Get the most recent demand for a specific ligne
  const getDerniereDemande = useCallback((ligneId: number): HistoriqueDemandeClient | null => {
    const historique = historiqueByLigneId[ligneId] || [];
    if (historique.length === 0) return null;
    
    return [...historique].sort(
      (a, b) =>
        new Date(b.date_demande).getTime() - new Date(a.date_demande).getTime()
    )[0];
  }, [historiqueByLigneId]);

  // Get all historique for a specific ligne
  const getHistorique = useCallback((ligneId: number): HistoriqueDemandeClient[] => {
    return historiqueByLigneId[ligneId] || [];
  }, [historiqueByLigneId]);

  return {
    historiqueByLigneId,
    loading,
    error,
    refetch: fetchHistorique,
    hasDemandeEnCours,
    getDerniereDemande,
    getHistorique,
  };
};

export default useHistoriqueDemandeClientBatch;
