import { QueryObserverResult, UseBaseMutationResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createItem, deleteItem, fetchAll, fetchListById, fetchOne, updateItem } from "../api/crudService";
import { AxiosResponse } from "axios";
import { restClient } from "../api/client";



export const useCrud = <T>(endpoint: string, type: string) => {

    const useFetchAll = (): QueryObserverResult<T[], any> => {
        return useQuery<T[]>({
            queryFn: async () => {
                const { data } = await fetchAll<T>(endpoint);
                return data;
            },

            queryKey: [type],
        });
    };



    const useFetchOne = (id: string | number): QueryObserverResult<T, any> => {
        return useQuery<T>({
            queryFn: async () => {
                const { data } = await fetchOne<T>(endpoint, id); // Ensuring correct type handling
                return data;
            },
            queryKey: [endpoint, id],
        });
    };


    const useCreateItem = (): UseBaseMutationResult<AxiosResponse<T, any>, unknown, any, unknown> => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (item: any) => createItem(endpoint, item),
            onSuccess: () => {
                queryClient.invalidateQueries();
            },
            onError: (error: any) => {
                console.error("Error creating item:", error);
            }
        });
    }

    /**
     * useCreateFormData is a hook for creating items with file uploads using FormData.
     * It wraps around axios.post with multipart/form-data headers.
     * Use this hook when you need to send files along with your data.
     * @returns A mutation hook that accepts FormData as input
     */
    const useCreateFormData = (): UseBaseMutationResult<AxiosResponse<any>, unknown, FormData, unknown> => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (formData: FormData) =>
                restClient.post(endpoint, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                }),
            onSuccess: () => {
                queryClient.invalidateQueries();
            },
            onError: (error: any) => {
                console.error("Error creating item with FormData:", error);
            },
        });
    }


    /**
     * useUpdateItem is a hook that wraps around the updateItem API call in crudService.
     * It takes an id and a url as parameters, and returns a useMutation hook.
     * The hook will call updateItem with the id and the item to be updated as parameters.
     * On success, the hook will invalidate the query for the given type, and navigate to the given url.
     * On error, the hook will log the error to the console.
     * @param id The id of the item to be updated.
     * @param url The url to navigate to after the update is successful.
     */
    const useUpdateItem = (): UseBaseMutationResult<AxiosResponse<T, any>, unknown, any, unknown> => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: ({ id, item }: { id: number, item: any }) => {
                console.log(endpoint, id, item);
                return updateItem(endpoint, id, item);
            },
            onSuccess: () => {
                queryClient.invalidateQueries();
            },
            onError: (error: any) => {
                console.error("Error updating item:", error);
            }
        });

    };




    const useDeleteItem = (): UseBaseMutationResult<AxiosResponse<any, any>, unknown, number | string, unknown> => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (id: number | string) => deleteItem(endpoint, id),
            onSuccess: () => {
                console.log(queryClient.getQueriesData({}));
                queryClient.invalidateQueries();
                console.log(queryClient.getQueriesData({}));
            },
            onError: (error: any) => {
                console.error("Error deleting item:", error);
            }
        });
    };


    // useFetchListById 

    /**
     * useFetchListById is a hook that wraps around the fetchListById API call in crudService.
     * It takes an id as a parameter, and returns a useQuery hook.
     * The hook will call fetchListById with the id as a parameter.
     * The hook will only be enabled if the id is a valid number.
     * The hook will return the result of the query, which will be an array of items of type T.
     * @param id The id of the list to be fetched.
     */
    const useFetchListById = (id: number): QueryObserverResult<T[], any> => {
        return useQuery<T[]>({
            queryFn: async () => {
                const { data } = await fetchListById<T>(endpoint, id);
                return data;
            },
            queryKey: [endpoint, id],
            enabled: !!id,
        });
    };




    return {
        useFetchAll,
        useFetchOne,
        useCreateItem,
        useCreateFormData,
        useUpdateItem,
        useDeleteItem,
        useFetchListById
    }
}