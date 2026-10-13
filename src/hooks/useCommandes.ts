import { useState, useEffect, useCallback } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import {
  getCommandesNewQuery,
  getCommandesNewPaginatedQuery,
  getCommandeNewByIdQuery,
  getCommandesListPaginatedQuery,
} from "../api/graphql/queries";
import {
  Commande,
  CommandesResponse,
  CommandesPaginatedResponse,
} from "../types/Commande.types";

interface UseCommandesProps {
  client_id?: number;
  user_id?: number;
  typecommande_id?: number;
  id?: number;
}

interface UseCommandesPaginatedProps {
  page?: number;
  count?: number;
  client_id?: number;
  typecommande_id?: number;
  user_id?: number;
  code?: string;
  status?: number;
}

export const useCommandes = (props?: UseCommandesProps) => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchGraphQL<{ data: CommandesResponse }>(
          getCommandesNewQuery(
            props?.client_id,
            props?.typecommande_id,
            props?.user_id,
            props?.id,
          ),
        );

        if (response.data?.data?.commandes) {
          setCommandes(response.data.data.commandes);
        } else {
          throw new Error(
            "Structure inattendue de la réponse ou aucune commande trouvée.",
          );
        }
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la récupération des commandes.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [props?.client_id, props?.typecommande_id, props?.id, props?.user_id]);

  return { commandes, loading, error };
};

// Hook pour les commandes paginées
export const useCommandesPaginated = (
  props: UseCommandesPaginatedProps | null,
) => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [metadata, setMetadata] = useState({
    total: 0,
    per_page: props?.count || 10,
    current_page: props?.page || 1,
    last_page: 1,
  });
  const [loading, setLoading] = useState<boolean>(!!props);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommandes = async () => {
      if (!props) {
        setLoading(false);
        setCommandes([]);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const page = props.page || 1;
        const count = props.count || 10;

        const response = await fetchGraphQL<{
          data: CommandesPaginatedResponse;
        }>(
          getCommandesNewPaginatedQuery(
            page,
            count,
            props.client_id,
            props.typecommande_id,
            props.user_id,
            props.code,
            props.status,
          ),
        );

        console.log("Response Commandes Paginated:", response);

        if (response.data?.data?.commandespaginated) {
          setCommandes(response.data.data.commandespaginated.data);
          setMetadata(response.data.data.commandespaginated.metadata);
        } else {
          throw new Error(
            "Structure inattendue de la réponse ou aucune commande trouvée.",
          );
        }
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la récupération des commandes.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [
    props?.page,
    props?.count,
    props?.client_id,
    props?.typecommande_id,
    props?.user_id,
    props?.code,
    props?.status,
    !!props,
  ]);

  return { commandes, metadata, loading, error };
};

// Hook pour les commandes paginées avec gestion des actions de pagination
export const useCommandesPaginatedWithControls = (
  initialProps?: Omit<UseCommandesPaginatedProps, "page" | "count">,
) => {
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(10);

  const props = initialProps
    ? {
        ...initialProps,
        page,
        count,
      }
    : null;

  const result = useCommandesPaginated(props);

  const nextPage = () => {
    if (page < result.metadata.last_page) {
      setPage(page + 1);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= result.metadata.last_page) {
      setPage(pageNumber);
    }
  };

  const changeCount = (newCount: number) => {
    setCount(newCount);
    setPage(1); // Reset to first page when changing page size
  };

  return {
    ...result,
    page,
    count,
    nextPage,
    previousPage,
    goToPage,
    changeCount,
    canGoNext: page < result.metadata.last_page,
    canGoPrevious: page > 1,
  };
};

// Hook OPTIMISÉ pour la liste des commandes (Orders.tsx) - Utilise la requête allégée
export const useCommandesListPaginatedWithControls = (
  initialProps?: Omit<UseCommandesPaginatedProps, "page" | "count">,
) => {
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(10);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [metadata, setMetadata] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  });
  const [loading, setLoading] = useState<boolean>(!!initialProps);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommandes = async () => {
      if (!initialProps) {
        setLoading(false);
        setCommandes([]);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetchGraphQL<{
          data: CommandesPaginatedResponse;
        }>(
          getCommandesListPaginatedQuery(
            page,
            count,
            initialProps.client_id,
            initialProps.typecommande_id,
            initialProps.user_id,
            initialProps.code,
            initialProps.status,
          ),
        );

        console.log("Response Commandes List Paginated:", response);

        if (response.data?.data?.commandespaginated) {
          setCommandes(response.data.data.commandespaginated.data);
          setMetadata(response.data.data.commandespaginated.metadata);
        } else {
          throw new Error(
            "Structure inattendue de la réponse ou aucune commande trouvée.",
          );
        }
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la récupération des commandes.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [
    page,
    count,
    initialProps?.client_id,
    initialProps?.typecommande_id,
    initialProps?.user_id,
    initialProps?.code,
    initialProps?.status,
    !!initialProps,
  ]);

  const nextPage = () => {
    if (page < metadata.last_page) {
      setPage(page + 1);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= metadata.last_page) {
      setPage(pageNumber);
    }
  };

  const changeCount = (newCount: number) => {
    setCount(newCount);
    setPage(1);
  };

  return {
    commandes,
    metadata,
    loading,
    error,
    page,
    count,
    nextPage,
    previousPage,
    goToPage,
    changeCount,
    canGoNext: page < metadata.last_page,
    canGoPrevious: page > 1,
  };
};

// Hook pour une commande spécifique
export const useCommande = (
  id: number,
  client_id?: number,
  user_id?: number,
) => {
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommande = useCallback(async () => {
    if (!id) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetchGraphQL<{ data: CommandesResponse }>(
        getCommandeNewByIdQuery(id, client_id, user_id),
      );

      console.log("Response Commande:", response);

      if (
        response.data?.data?.commandes &&
        response.data.data.commandes.length > 0
      ) {
        const fetchedCommande = response.data.data.commandes[0];
        setCommande(fetchedCommande);
        return fetchedCommande;
      }

      throw new Error("Commande non trouvée.");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération de la commande.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, client_id, user_id]);

  useEffect(() => {
    if (id) {
      fetchCommande();
    }
  }, [id, fetchCommande]);

  return { commande, loading, error, refetch: fetchCommande };
};
