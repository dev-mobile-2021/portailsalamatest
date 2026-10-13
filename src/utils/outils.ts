




// convert base 64

import { deliveryZones } from "./variable";

export const convertBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            resolve(fileReader.result);
        };
        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

/**
 * Fonction qui extrait les données paginées d'une réponse d'API
 * Si la clé "produitspaginated" n'est pas présente dans la réponse,
 * cette fonction retourne un tableau vide.
 * @param {any} data - La réponse de l'API
 * @param {string} key - La clé de la propriété à extraire
 * @returns {any[]} - Le tableau de données paginées
 */
export const extractPaginatedData = (data: any, key: string) => {
    const result = data?.data?.[key];

    

    // Si c'est un objet, l'entourer dans un tableau
    if (result && typeof result === 'object' && !Array.isArray(result)) {
        return [result];
    }

    // Sinon, retourner directement le tableau (ou un tableau vide si `result` est undefined)
    return result || [];
};



export const getDeliveryFee = (name: string): number => {
    // Rechercher la zone correspondante
    const zone = deliveryZones.find((zone) => zone.label.includes(name));

    // Retourner le coût de livraison si la zone est trouvée, sinon retourner 0
    return zone ? zone.value : 0;
};