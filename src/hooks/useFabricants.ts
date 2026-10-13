import { useState, useCallback, useEffect, useRef } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getFabricantsPaginatedQuery } from "../api/graphql/queries";
import { Fabricant, FabricantInput, FabricantesPaginatedResponse } from "../types/fabricant.types";
import { useCrud } from "./useCrud";

export interface PaginationMetadata {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export const useFabricants = () => {

  // ── GraphQL list state ────────────────────────────────────────────────────
  const [fabricants, setFabricants] = useState<Fabricant[]>([]);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [paginationMetadata, setPaginationMetadata] = useState<PaginationMetadata>({
    total: 0,
    per_page: 20,
    current_page: 1,
    last_page: 1,
  });

  // Pagination & filter params
  const [page, setPage] = useState<number>(1);
  const [count, setCount] = useState<number>(20);
  const [etat, setEtat] = useState<number | undefined>(undefined);
  const [userIdFilter, setUserIdFilter] = useState<number | string | undefined>(undefined);

  // ── Cache for fabricantsValides (useRef, never triggers re-render) ────────
  const fabricantsValidesCache = useRef<Fabricant[] | null>(null);
  const [fabricantsValides, setFabricantsValides] = useState<Fabricant[]>([]);

  // ── useCrud mutations (react-query) ───────────────────────────────────────
  const { useCreateItem,  useDeleteItem } = useCrud<Fabricant>("api/fabricant", "fabricant");
  const createMutation = useCreateItem();
  const deleteMutation = useDeleteItem();

  // Unified loading: GraphQL fetch OR any mutation in flight
  const loading = fetchLoading || createMutation.isPending ||  deleteMutation.isPending;

  // Unified error: prefer the most recent one
  const error = fetchError ?? createMutation.error  ?? deleteMutation.error ?? null;

  // ── Fetch paginated list (GraphQL) ────────────────────────────────────────
  const fetchFabricants = useCallback(async () => {
    try {
      setFetchLoading(true);
      setFetchError(null);

      const response = await fetchGraphQL<FabricantesPaginatedResponse>(
        getFabricantsPaginatedQuery(page, count, etat, userIdFilter)
      );

      if (response.data?.data?.fabricantspaginated?.data) {
        setFabricants(response.data.data.fabricantspaginated.data);
        if (response.data.data.fabricantspaginated.metadata) {
          setPaginationMetadata(response.data.data.fabricantspaginated.metadata);
        }
      } else {
        setFabricants([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération des fabricants.";
      console.error("[useFabricants] fetchFabricants:", message);
      setFetchError(message);
      setFabricants([]);
    } finally {
      setFetchLoading(false);
    }
  }, [page, count, etat, userIdFilter]);

  // Initial load + re-fetch when filters / page change
  useEffect(() => {
    fetchFabricants();
  }, [fetchFabricants]);

  // ── Fetch valid manufacturers — cached ────────────────────────────────────
  const fetchFabricantsValide = useCallback(async () => {
    // Return cached data immediately without hitting the network
    if (fabricantsValidesCache.current !== null) {
      setFabricantsValides(fabricantsValidesCache.current);
      return fabricantsValidesCache.current;
    }

    try {
      setFetchLoading(true);
      setFetchError(null);

      // etat = 1 → validated; large page size to retrieve the full list
      const response = await fetchGraphQL<FabricantesPaginatedResponse>(
        getFabricantsPaginatedQuery(1, 1000, 1)
      );

      const data = response.data?.data?.fabricantspaginated?.data ?? [];
      fabricantsValidesCache.current = data;   // persist in cache
      setFabricantsValides(data);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération des fabricants valides.";
      console.error("[useFabricants] fetchFabricantsValide:", message);
      setFetchError(message);
      setFabricantsValides([]);
      return [];
    } finally {
      setFetchLoading(false);
    }
  }, []);

  /** Invalidate fabricantsValides cache (e.g. after a new manufacturer is validated) */
  const clearValidesCache = useCallback(() => {
    fabricantsValidesCache.current = null;
  }, []);

  // ── Mutations via useCrud ─────────────────────────────────────────────────

  // POST api/fabricant
  const saveFabricant = useCallback(
    async (payload: FabricantInput) => {
      try {
        const response = await createMutation.mutateAsync(payload as unknown as Fabricant);
        // Refresh the list and bust the valides cache so the new entry appears
        clearValidesCache();
        await fetchFabricants();
        return response;
      } catch (err: unknown) {
        console.error("[useFabricants] saveFabricant:", err);
        throw err;
      }
    },
    [createMutation, fetchFabricants, clearValidesCache]
  );

  // POST api/fabricant (with id for update)
  const updateFabricant = useCallback(
    async (id: number, payload: Partial<FabricantInput>) => {
      try {
        const response = await createMutation.mutateAsync({
          id,
          ...payload
        } as unknown as Fabricant);
        // Refresh the list and bust the valides cache
        clearValidesCache();
        await fetchFabricants();
        return response;
      } catch (err: unknown) {
        console.error("[useFabricants] updateFabricant:", err);
        throw err;
      }
    },
    [createMutation, fetchFabricants, clearValidesCache]
  );

  // DELETE api/fabricant/{id}
  // Reserved for admins — kept for completeness but not exposed in the portal UI
  const deleteFabricant = useCallback(
    async (id: number) => {
      try {
        const response = await deleteMutation.mutateAsync(id);
        clearValidesCache();
        await fetchFabricants();
        return response;
      } catch (err: unknown) {
        console.error("[useFabricants] deleteFabricant:", err);
        throw err;
      }
    },
    [deleteMutation, fetchFabricants, clearValidesCache]
  );

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    // Data
    fabricants,
    fabricantsValides,

    // Status
    loading,
    mutationLoading: createMutation.isPending ||  deleteMutation.isPending,
    error,

    // Actions
    fetchFabricants,
    fetchFabricantsValide,
    clearValidesCache,
    saveFabricant,
    updateFabricant,
    deleteFabricant,

    // Pagination controls
    page,
    setPage,
    count,
    setCount,
    setEtat,
    userIdFilter,
    setUserIdFilter,
    paginationMetadata,
  };
};

export default useFabricants;