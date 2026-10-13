// api/graphql/graphqlService.ts
import { AxiosResponse } from 'axios';
import { graphQLClient } from '../client';

export const fetchGraphQL = async <T>(query: string, variables: object = {}): Promise<AxiosResponse<T>> => {
    return await graphQLClient.post<T>('', { query, variables });
};

export const createGraphQL = async <T, D>(mutation: string, variables: D): Promise<AxiosResponse<T>> => {
    return await graphQLClient.post<T>('', { query: mutation, variables });
};

export const updateGraphQL = async <T, D>(mutation: string, variables: { id: string | number, item: D }): Promise<AxiosResponse<T>> => {
    return await graphQLClient.post<T>('', { query: mutation, variables });
};

export const deleteGraphQL = async <T>(mutation: string, variables: { id: string | number }): Promise<AxiosResponse<any>> => {
    return await graphQLClient.post<T>('', { query: mutation, variables });
};
