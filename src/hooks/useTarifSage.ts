import { useState, useCallback, useRef } from "react";
import { useCrud } from "./useCrud";
import { TarifResponse } from "../types/TarifSage.types";

/**
 * Hook to fetch tarif from `api/tarifsage`.
 * Uses the existing `useCrud` modular pattern (react-query + restClient).
 *
 * Built-in cache: same (codeArticle, codeCategorie) pair is fetched only once.
 * Call `clearCache()` when the client changes (different codeCategorie).
 */
const useTarifSage = () => {
  const { useCreateItem } = useCrud<TarifResponse>("api/tarifsage", "tarifsage");
  const mutation = useCreateItem();

  // Cache interne : clé = "codeArticle__codeCategorie" → TarifResponse
  const cache = useRef<Map<string, TarifResponse>>(new Map());

  const [tarif, setTarif] = useState<TarifResponse | null>(null);
  const [error, setError] = useState<any>(null);

  const fetchTarif = useCallback(
    async (codeArticle: string, codeCategorie: string = "") => {
      setError(null);

      // 1. Vérifier le cache
      const cacheKey = `${codeArticle}__${codeCategorie}`;
      const cached = cache.current.get(cacheKey);
      if (cached) {
        setTarif(cached);
        return cached;
      }

      // 2. Appel API si pas en cache
      try {
        const response = await mutation.mutateAsync({
          codeArticle,
          codeCategorie,
        }); // AxiosResponse<TarifResponse>
        const data = response.data ?? null;
        setTarif(data);

        // 3. Mettre en cache
        if (data) {
          cache.current.set(cacheKey, data);
        }

        return data;
      } catch (err: any) {
        setError(err);
        setTarif(null);
        throw err;
      }
    },
    [mutation.mutateAsync]
  );

  /** Vider le cache (à appeler quand le client change) */
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return {
    tarif,
    loading: mutation.isPending,
    error,
    fetchTarif,
    clearCache,
  };
};

export default useTarifSage;
