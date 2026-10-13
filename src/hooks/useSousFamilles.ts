import { useState, useEffect } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getSousFamillesQuery } from "../api/graphql/queries";
import { SousFamille} from "../types/SousFamille.types";

export const useSousFamilles = () => {
  const [sousFamilles, setSousFamilles] = useState<SousFamille[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSousFamilles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Appel GraphQL pour récupérer les sous-familles
        const response = await fetchGraphQL<{ data: { familles: SousFamille[] } }>(
          getSousFamillesQuery()
        );

        // Vérification et mise à jour des sous-familles
        if (response.data?.data?.familles) {
          setSousFamilles(response.data.data.familles);
        } else {
          throw new Error("Structure inattendue de la réponse ou aucune sous-famille trouvée.");
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors de la récupération des sous-familles.");
      } finally {
        setLoading(false);
      }
    };

    fetchSousFamilles();
  }, []);

  return { sousFamilles, loading, error };
};