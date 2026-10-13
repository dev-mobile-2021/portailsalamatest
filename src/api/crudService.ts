import { AxiosResponse } from "axios";
import { restClient } from "./client";

export const fetchAll = async <T>(endpoint: string): Promise<AxiosResponse<T[], any>> => {
    return await restClient.get<T[]>(endpoint);
};

export const fetchOne = async <T>(endpoint: string, id: string | number): Promise<AxiosResponse<T, any>> => {
    return await restClient.get<T>(`${endpoint}/${id}`);
};

export const createItem = async <T, D>(endpoint: string, data: D): Promise<AxiosResponse<T, any>> => {
    return await restClient.post<T>(endpoint, data);
};

export const updateItem = async <T, D>(endpoint: string, id: string | number, item: D): Promise<AxiosResponse<T, any>> => {
    return await restClient.put<T>(`${endpoint}/${id}`, item);
};

export const deleteItem = async <T>(endpoint: string, id: string | number): Promise<AxiosResponse<any, any>> => {
    return await restClient.delete<T>(`${endpoint}/${id}`);
};


export const existOrCreate = async <T, D>(endpoint: string, data: D): Promise<AxiosResponse<T, any>> => {
    return await restClient.post<T>(endpoint, data);
};


/**
 * R cup re une liste d' l ments en fonction de leur id.
 * @param endpoint Le point de terminaison de l'API.
 * @param id L'identifiant de la ressource.
 * @returns Une promesse qui se r solve avec la liste d' l ments.
 */
export const fetchListById = async <T>(endpoint: string, id: string | number): Promise<AxiosResponse<T[], any>> => {
    return await restClient.get<T[]>(`${endpoint}/${id}`);
};