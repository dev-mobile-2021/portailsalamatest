import { useEffect, useState } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getClientsQuery } from "../api/graphql/queries";
import { Client } from "../types/Client.types";

const useClients = (user_id: number | null = null) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchGraphQL<{ data: { clients: Client[] } }>(
          getClientsQuery(user_id)
        );

        if (response.data?.data?.clients) {
          setClients(response.data.data.clients);
        } else {
          setClients([]);
        }
      } catch (err: any) {
        console.error("[useClients] Erreur:", err);
        setError(err.message || "Erreur lors de la récupération des clients.");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user_id]);

  return { clients, loading, error };
};

export default useClients;
