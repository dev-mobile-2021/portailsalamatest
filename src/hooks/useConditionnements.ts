import { useEffect, useState } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getConditionnementsQuery } from "../api/graphql/queries";
import { Conditionnement } from "../types/Conditionnement.types";

const useConditionnements = () => {
  const [conditionnements, setConditionnements] = useState<Conditionnement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConditionnements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Appel GraphQL pour récupérer les conditionnements
        const response = await fetchGraphQL<{ data: { conditionnements: Conditionnement[] } }>(
          getConditionnementsQuery()
        );

        // Vérification et mise à jour des conditionnements
        if (response.data?.data?.conditionnements) {
          setConditionnements(response.data.data.conditionnements);
        } else {
          throw new Error("Structure inattendue de la réponse ou aucun conditionnement trouvé.");
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors de la récupération des conditionnements.");
      } finally {
        setLoading(false);
      }
    };

    fetchConditionnements();
  }, []);

  return { conditionnements, loading, error };
};

export default useConditionnements;