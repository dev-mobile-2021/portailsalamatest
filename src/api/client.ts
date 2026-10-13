// api/client.ts
import axios from 'axios';
import { BASE_URL } from '../utils/variable';

export const graphQLClient = axios.create({
    baseURL: BASE_URL + 'graphql',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const restClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false,
});

// Ajouter un intercepteur pour mettre à jour le token avant chaque requête
restClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log(token,"envoyer");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});




restClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Rediriger vers la page de connexion si le token est invalide ou expiré
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);