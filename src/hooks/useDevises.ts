import { useEffect, useState, useRef, useCallback } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getDevisesQuery } from "../api/graphql/queries";
import { Devise } from "../types/Devise.types";

const useDevises = () => {
  const [devises, setDevises] = useState<Devise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cache interne : clé = "devises" → Devise[]
  const cache = useRef<Map<string, Devise[]>>(new Map());

  useEffect(() => {
    const fetchDevises = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Vérifier le cache
        const cacheKey = "devises";
        const cached = cache.current.get(cacheKey);
        if (cached) {
          setDevises(cached);
          setLoading(false);
          return;
        }

        // 2. Appel API si pas en cache
        const response = await fetchGraphQL<{ data: { devises: Devise[] } }>(
          getDevisesQuery()
        );

        if (response.data?.data?.devises) {
          // Filtrer les devises avec designation vide
          const filteredDevises = response.data.data.devises.filter(
            (devise: Devise) => devise.designation && devise.designation.trim()
          );
          setDevises(filteredDevises);
          // 3. Mettre en cache
          cache.current.set(cacheKey, filteredDevises);
        } else {
          setDevises([]);
        }
      } catch (err: any) {
        console.error("[useDevises] Erreur:", err);
        setError(err.message || "Erreur lors de la récupération des devises.");
        setDevises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDevises();
  }, []);

  /** Vider le cache */
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { devises, loading, error, clearCache };
};

export default useDevises;
