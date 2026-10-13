import { useEffect, useState } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getChauffeursQuery } from "../api/graphql/queries";
import { Chauffeur } from "../types/Expedition.types";



interface UseChauffeurParams {
  fournisseur_id?: number;
}

const useChauffeurs = ({ fournisseur_id }: UseChauffeurParams) => {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fournisseur_id) {
      setChauffeurs([]);
      return;
    }

    const fetchChauffeurs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchGraphQL<{ data: { chauffeurs: Chauffeur[] } }>(
          getChauffeursQuery(fournisseur_id)
        );

        if (response.data?.data?.chauffeurs) {
          setChauffeurs(response.data.data.chauffeurs);
        } else {
          setChauffeurs([]);
        }
      } catch (err: any) {
        console.error("[useChauffeurs] Erreur:", err);
        setError(err.message || "Erreur lors de la récupération des chauffeurs.");
        setChauffeurs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChauffeurs();
  }, [fournisseur_id]);

  return { chauffeurs, loading, error };
};

export default useChauffeurs;
