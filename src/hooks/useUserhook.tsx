import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { AuthContextType, Fournisseur, User } from "../types/user.types";
import Spiner from "../components/const/Spiner";
import { toast } from "react-toastify";
import { restClient } from "../api/client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const login = async (credentials: { login: string, password: string }) => {
        setIsLoading(true);
        try {
            const response = await restClient.post('/api/login', credentials);

            
            const { utilisateur, fournisseur, token } = response.data;;
            setUser(utilisateur);
            setFournisseur(fournisseur);
            localStorage.setItem('token', token);
            localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
            localStorage.setItem('fournisseur', JSON.stringify(fournisseur));
            checkAuthStatus();
            return utilisateur;
        } catch (error: any) {      
            let errorMessage = "Erreur lors de la connexion";
            if (error.response) {
                // Erreur venant du serveur
                if (error.response.data.message === "The given data was invalid.") {
                    errorMessage = "Identifiant ou mot de passe incorrect";
                } else if (error.response.data.errors) {
                    // Gestion des erreurs de validation Laravel
                    const firstError = Object.values(error.response.data.errors)[0];
                    errorMessage = Array.isArray(firstError) ? firstError[0] : "Données invalides";
                } else {
                    errorMessage = error.response.data.message || errorMessage;
                }
            }
            toast.error(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await restClient.post('/api/logout');
            setUser(null);
            setFournisseur(null);
            localStorage.removeItem('token');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('token');
        const utilisateurStored = localStorage.getItem('utilisateur');
        const fournisseurStored = localStorage.getItem('fournisseur');

        if (!token) {
            setIsLoading(false);
            return;
        }

        // Charger d'abord les données du localStorage pour un affichage immédiat
        if (utilisateurStored) {
            setUser(JSON.parse(utilisateurStored));
        }
        if (fournisseurStored) {
            setFournisseur(JSON.parse(fournisseurStored));
        }

        const login = utilisateurStored ? JSON.parse(utilisateurStored).login : null;
        
        if (!login) {
            setIsLoading(false);
            return;
        }

        try {
            // Récupérer le profil utilisateur
            const response = await restClient.post('/api/profile', { login });
            const utilisateur = response.data.utilisateur;
            
            
            setUser(utilisateur);
            localStorage.setItem('utilisateur', JSON.stringify(utilisateur));

            // Récupérer les détails du fournisseur si l'utilisateur en a un
            if (utilisateur?.fournisseur_id) {
                const fournisseurResponse = await fetch(
                    `https://backsignup.h-tsoft.com//graphql?query={fournisseurs(id: ${utilisateur.fournisseur_id}){id,TSSCOD_0_0,nom,adresse,telephone,email,categoriefournisseur_id,categoriefournisseur{id,designation},typefournisseur{id,designation},typefournisseur_id,code,score,ca_annuel,pays_id}}`
                );
                
                const fournisseurData = await fournisseurResponse.json();
                const fetchedFournisseur = fournisseurData?.data?.fournisseurs?.[0];
                // console.log("voici la reponse de l api fournisseur",fetchedFournisseur);
                if (fetchedFournisseur) {
                    const fournisseurWithText: Fournisseur = {
                        id: fetchedFournisseur.id,
                        nom: fetchedFournisseur.nom,
                        code: fetchedFournisseur.code,
                        TSSCOD_0_0: fetchedFournisseur.TSSCOD_0_0,
                        TSSCOD_0_1: fetchedFournisseur.TSSCOD_0_1,
                        adresse: fetchedFournisseur.adresse || "",
                        telephone: fetchedFournisseur.telephone || "",
                        email: fetchedFournisseur.email || "",
                        categoriefournisseur_id: fetchedFournisseur.categoriefournisseur_id,
                        typefournisseur_id: fetchedFournisseur.typefournisseur_id,
                        categoriefournisseur_text: fetchedFournisseur.categoriefournisseur?.designation || "",
                        typefournisseur_text: fetchedFournisseur.typefournisseur?.designation || "",
                        created_at: fetchedFournisseur.created_at || "",
                        updated_at: fetchedFournisseur.updated_at || "",
                        score: fetchedFournisseur.score,
                        ca_annuel: fetchedFournisseur.ca_annuel,
                        pays_id: fetchedFournisseur.pays_id,
                    };

                    setFournisseur(fournisseurWithText);
                    localStorage.setItem('fournisseur', JSON.stringify(fournisseurWithText));
                }
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du statut d'authentification:", error);
            // En cas d'erreur, on garde les données du localStorage si elles existent
            // On déconnecte seulement si l'erreur indique un token invalide
            if (error && typeof error === 'object' && 'response' in error) {
                const responseError = error as any;
                if (responseError.response?.status === 401 || responseError.response?.status === 403) {
                    // Token invalide ou expiré, déconnecter l'utilisateur
                    setUser(null);
                    setFournisseur(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('utilisateur');
                    localStorage.removeItem('fournisseur');
                }
            }
            // Sinon, on garde l'utilisateur connecté avec les données du localStorage
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const contextValue = useMemo(() => ({
        user,
        setIsLoading,
        setUser,
        fournisseur,
        setFournisseur,
        isLoading,
        login,
        logout
    }), [user, fournisseur, isLoading]);

    if (isLoading) return <Spiner />;

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};