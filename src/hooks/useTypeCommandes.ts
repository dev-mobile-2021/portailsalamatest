import { useEffect, useState } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getTypeCommandesQuery } from "../api/graphql/queries";
import { TypeCommande } from "../types/TypeCommande.types";
import { useAuthContext } from "./useUserhook";


const useTypeCommandes = () => {
  const [typeCommandes, setTypeCommandes] = useState<TypeCommande[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  useEffect(() => {
    const fetchTypeCommandes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Appel GraphQL pour récupérer les types de commandes
        const response = await fetchGraphQL<{ data: { typecommandes: TypeCommande[] } }>(
          getTypeCommandesQuery(user?.client_id || 0)
        );
        if (response.data?.data?.typecommandes) {
          setTypeCommandes(response.data.data.typecommandes);
        } else {
          throw new Error("Structure inattendue de la réponse ou aucune sous-famille trouvée.");
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors de la récupération des sous-familles.");
      } finally {
        setLoading(false);
      }
    };

    fetchTypeCommandes();
  }, []);

  return { typeCommandes, loading, error };
};

export default useTypeCommandes;