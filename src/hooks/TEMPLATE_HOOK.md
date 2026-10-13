/**
 * ============================================================================
 * TEMPLATE POUR CRÉER UN NOUVEAU HOOK
 * ============================================================================
 * 
 * INSTRUCTIONS :
 * 1. Copier ce fichier et renommer en "use[NomDuHook].ts"
 * 2. Créer le type de réponse dans "src/types/[NomDuHook].types.ts"
 * 3. Choisir une des deux approches ci-dessous selon vos besoins :
 *    - APPROCHE A : Mutation avec React Query (POST/PUT/DELETE) -> useCrud
 *    - APPROCHE B : Fetch simple (GET ou autres) -> fetch direct
 * 4. Supprimer l'approche non utilisée
 * 5. Remplacer tous les commentaires TODO par votre code
 * 6. Tester le hook dans un composant
 * 
 * ============================================================================
 */

// ============================================================================
// APPROCHE A : MUTATION AVEC REACT QUERY (useCrud)
// ============================================================================
// Utilisez cette approche pour :
// - Envoyer des données POST/PUT/DELETE
// - Bénéficier du cache et de la gestion d'état de React Query
// - Exemple : useTarifSage
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useCrud } from "./useCrud";
// TODO: Importer votre type depuis le dossier types
// import { YourResponseType } from "../types/YourType.types";

const useYourHookWithMutation = () => {
  // TODO: Remplacer "YourResponseType" par votre type
  // TODO: Remplacer "api/your-endpoint" par votre endpoint
  // TODO: Remplacer "yourQueryKey" par une clé unique pour le cache
  const { useCreateItem } = useCrud<any>("api/your-endpoint", "yourQueryKey");
  const mutation = useCreateItem();

  // TODO: Remplacer "data" par un nom significatif (ex: tarif, commande, etc.)
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  // TODO: Renommer "fetchData" selon votre cas (ex: fetchTarif, createCommande)
  // TODO: Adapter les paramètres selon vos besoins
  const fetchData = useCallback(
    async (param1: string, param2: string = "") => {
      setError(null);
      try {
        // TODO: Adapter le payload selon votre API
        const response = await mutation.mutateAsync({
          param1,
          param2,
          // Ajoutez d'autres champs ici
        });
        
        setData(response.data ?? null);
        return response.data;
      } catch (err: any) {
        console.error("[useYourHook] Erreur:", err);
        setError(err);
        setData(null);
        throw err;
      }
    },
    [mutation.mutateAsync]
  );

  return {
    data, // TODO: Renommer selon votre contexte
    loading: mutation.isPending,
    error,
    fetchData, // TODO: Renommer selon votre contexte
  };
};

// export default useYourHookWithMutation;

// ============================================================================
// APPROCHE B : FETCH DIRECT (avec useEffect)
// ============================================================================
// Utilisez cette approche pour :
// - Récupérer des données automatiquement au montage du composant
// - Utiliser GraphQL ou une API REST simple
// - Recharger les données quand un paramètre change
// - Exemple : useClients
// ============================================================================

// import { useEffect, useState } from "react";
import { restClient } from "../api/client";
// OU pour GraphQL :
// import { fetchGraphQL } from "../api/graphql/graphqlService";
// import { getYourQuery } from "../api/graphql/queries";

// TODO: Importer votre type depuis le dossier types
// import { YourType } from "../types/YourType.types";

const useYourHookWithFetch = (paramId?: number | null) => {
  // TODO: Remplacer "items" par un nom significatif (ex: clients, produits, etc.)
  // TODO: Remplacer "any[]" par votre type (ex: Client[], Produit[])
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // OPTION 1 : REST API avec restClient
        // TODO: Remplacer "api/your-endpoint" par votre endpoint
        const response = await restClient.get(`api/your-endpoint/${paramId ?? ""}`);
        
        if (response.data) {
          setItems(response.data);
        } else {
          setItems([]);
        }

        // OPTION 2 : GraphQL (décommenter si besoin)
        // const response = await fetchGraphQL<{ data: { items: any[] } }>(
        //   getYourQuery(paramId)
        // );
        // if (response.data?.data?.items) {
        //   setItems(response.data.data.items);
        // } else {
        //   setItems([]);
        // }

      } catch (err: any) {
        console.error("[useYourHook] Erreur:", err);
        setError(err.message || "Erreur lors de la récupération des données.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    // TODO: Adapter la condition selon vos besoins
    // Exécuter uniquement si paramId existe, ou toujours, etc.
    if (paramId) {
      fetchItems();
    }
  }, [paramId]); // TODO: Ajouter d'autres dépendances si nécessaire

  return { items, loading, error }; // TODO: Renommer selon votre contexte
};

// export default useYourHookWithFetch;

// ============================================================================
// EXEMPLES D'UTILISATION
// ============================================================================

/**
 * EXEMPLE 1 : Utilisation avec mutation (APPROCHE A)
 * 
 * const MonComposant = () => {
 *   const { data, loading, error, fetchData } = useYourHookWithMutation();
 * 
 *   const handleSubmit = async () => {
 *     try {
 *       await fetchData("param1", "param2");
 *       toast.success("Succès !");
 *     } catch (err) {
 *       toast.error("Erreur");
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       {loading && <p>Chargement...</p>}
 *       {error && <p>Erreur: {error}</p>}
 *       {data && <p>Résultat: {JSON.stringify(data)}</p>}
 *       <button onClick={handleSubmit}>Envoyer</button>
 *     </div>
 *   );
 * };
 */

/**
 * EXEMPLE 2 : Utilisation avec fetch automatique (APPROCHE B)
 * 
 * const MonComposant = ({ userId }: { userId: number }) => {
 *   const { items, loading, error } = useYourHookWithFetch(userId);
 * 
 *   if (loading) return <p>Chargement...</p>;
 *   if (error) return <p>Erreur: {error}</p>;
 * 
 *   return (
 *     <ul>
 *       {items.map(item => (
 *         <li key={item.id}>{item.name}</li>
 *       ))}
 *     </ul>
 *   );
 * };
 */
