import { General } from "./general.types";

export interface AuthContextType {
    user: User | null;
    fournisseur: Fournisseur | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setFournisseur: React.Dispatch<React.SetStateAction<Fournisseur | null>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
    login: (credentials: { login: string, password: string }) => Promise<void>;
    logout: () => Promise<void>;
}

export interface User {
    id: number;
    name: string;
    email: string;
    login: string;
    role_id: number;
    role: {
        isadmin: 1|0;
    } & General;
    image: string | null;
    profilable_id: number;
    profilable_type: string;
    TSSCOD_0_0: "TRANS"|"BES"|"MED";
    // Champs de base nécessaires
    created_at: string;
    updated_at: string;
    // Champs optionnels
    [key: string]: any; // Pour les autres champs dynamiques
}

export interface Fournisseur {
    TSSCOD_0_0: "TRANS"|"BES"|"MED";
    TSSCOD_0_1: "TRANS"|"BES"|"MED"|"TRT";
    adresse: string;
    categoriefournisseur_id: number;
    categoriefournisseur_text: string ;
    code: string;
    email: string;
    id: number;
    nom: string;
    telephone: string;
    typefournisseur_id: number;
    typefournisseur_text: string;
    // Champs optionnels
    [key: string]: any; // Pour les autres champs dynamiques

}
