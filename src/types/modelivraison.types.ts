

export interface ModeLivraison {
    id: number;
    designation: string;
    code: string;
}

export interface Depot {
    id: number;
    designation: string;
    description: string;
    adresse: string;
    latitude: number;
    longitude: number;
}


export interface ModePaiement {
    id: number;
    designation: string;
    image: string;
    code: string;
}