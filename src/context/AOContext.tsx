import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFiltreSubmissionContext } from "./FiltreSubmissionContext";
import { AO } from "../types/AO.types";
import { getAOsQuery } from "../api/graphql/queries";
import { useCrudGraph } from "../hooks/useCrudGraph";

import { useAuthContext } from "../hooks/useUserhook";

// import { mockAOs } from "../mocks/aoMocks";

interface AOContextType {
  aos: AO[];
  loading: boolean;
  error: string | null;
}

const AOContext = createContext<AOContextType>({ aos: [], loading: false, error: null });

export const useAOContext = () => useContext(AOContext);

export const AOProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const { filtreSubmission } = useFiltreSubmissionContext();
  const queryClient = useQueryClient();

  // Appel API avec le filtre
  const { data: aosData, isLoading, error, refetch } = useCrudGraph<AO>("aos").useFetchAll(
    getAOsQuery(user?.fournisseur_id, filtreSubmission),
    { fournisseur_id: user?.fournisseur_id, filtre: filtreSubmission },
    { enabled: !!user?.fournisseur_id }
  );

  // Quand le filtre change, invalider le cache et refetch
  useEffect(() => {
    // console.log("🔴 [AOContext] Filtre changé:", filtreSubmission);
    // Supprimer toutes les données en cache pour "aos"
    queryClient.removeQueries({ queryKey: ["aos"] });
    // Puis refetch avec le nouveau filtre
    refetch();
  }, [filtreSubmission, user?.fournisseur_id, queryClient, refetch]);

  // const aos = mockAOs;
  const aos = aosData || [];
  
  // console.log("📊 [AOContext] aos.length:", aos.length, "| isLoading:", isLoading, "| filtre:", filtreSubmission);

  return (
    <AOContext.Provider
      value={{
        aos,
        loading: isLoading,
        error: error ? String(error) : null,
      }}
    >
      {children}
    </AOContext.Provider>
  );
};
