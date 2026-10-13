import { useEffect, useState } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getVehiculesQuery } from "../api/graphql/queries";
import { Vehicule } from "../types/Parking.types";

interface UseVehiculesParams {
  fournisseur_id: number;
  tonnage_id: number;
}

const useParkings = ({ fournisseur_id, tonnage_id }: UseVehiculesParams) => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchGraphQL<{ data: { vehicules: Vehicule[] } }>(
          getVehiculesQuery(fournisseur_id, tonnage_id)
        );

        if (response.data?.data?.vehicules) {
          setVehicules(response.data.data.vehicules);
        } else {
          setVehicules([]);
        }
      } catch (err: any) {
        console.error("[useParkings] Erreur:", err);
        setError(err.message || "Erreur lors de la récupération des véhicules.");
        setVehicules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicules();
  }, [fournisseur_id, tonnage_id]);

  return { vehicules, loading, error };
};

export default useParkings;
