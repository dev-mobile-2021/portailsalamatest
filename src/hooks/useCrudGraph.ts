// hooks/useCrud.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGraphQL, createGraphQL, updateGraphQL, deleteGraphQL } from '../api/graphql/graphqlService';
import { extractPaginatedData } from '../utils/outils';

export const useCrudGraph = <T>(type: string) => {

    /**
     * useFetchAll is a custom hook that performs a GraphQL query and returns a paginated list of items.
     * 
     * @param query The GraphQL query string to be executed.
     * @param variables An optional object containing variables for the query.
     * @param options Optional configuration object. Includes:
     *  - enabled: A boolean indicating whether the query should be executed. Defaults to true.
     * 
     * @returns A `useQuery` hook from `react-query` that provides the query result, status, and other properties.
     */

    const useFetchAll = (query: string, variables: object = {}, options: { enabled?: boolean } = {}) => {
        return useQuery<T[]>({
            queryKey: [type, variables], // Ajoutez les variables à la clé de requête pour éviter les conflits
            queryFn: async () => {
                const { data } = await fetchGraphQL<T[]>(query, variables);
                return extractPaginatedData(data, type);
            },
            enabled: options.enabled !== false, // Utilisez `enabled` de `options`
        });
    };

    const useCreateItem = <T, D>(mutation: string) => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (variables: D) => createGraphQL<T, D>(mutation, variables),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: [type] }),
        });
    };

    const useUpdateItem = <T, D>(mutation: string) => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (variables: { id: string | number, item: D }) => updateGraphQL<T, D>(mutation, variables),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: [type] }),
        });
    };

    const useDeleteItem = (mutation: string) => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (id: string | number) => deleteGraphQL<any>(mutation, { id }),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: [type] }),
        });
    };

    return {
        useFetchAll,
        useCreateItem,
        useUpdateItem,
        useDeleteItem,
    };
};