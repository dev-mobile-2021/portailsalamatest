import React, { createContext, useContext, useState, useEffect } from "react";
import { Depot, ModeLivraison, ModePaiement } from "../types/modelivraison.types";

// Définir le type du contexte
interface DeliveryContextType {
    user: any; // Remplacez `any` par le type de votre utilisateur
    setUser: (user: any) => void;
    currentPosition: google.maps.LatLngLiteral | null;
    setCurrentPosition: (position: google.maps.LatLngLiteral | null) => void;
    otherPosition: google.maps.LatLngLiteral | null;
    setotherPosition: (position: google.maps.LatLngLiteral | null) => void;
    deliveryAddress: string | null;
    setDeliveryAddress: (address: string | null) => void;
    deliveryMode: ModeLivraison | null;
    setDeliveryMode: (mode: ModeLivraison | null) => void;
    selectedDepot: Depot | null;
    setSelectedDepot: (depot: Depot | null) => void;
    paiementMode: ModePaiement | null;
    setPaiementMode: (mode: ModePaiement | null) => void;
    prepareDeliveryObject: () => {
        user: any;
        currentPosition: google.maps.LatLngLiteral | null;
        deliveryAddress: string | null;
        deliveryMode: ModeLivraison | null;
        selectedDepot: Depot | null;
    };
}

// Créer le contexte
const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

// Créer un fournisseur de contexte
export const DeliveryProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);
    const [otherPosition, setotherPosition] = useState<google.maps.LatLngLiteral | null>(null);

    const [deliveryAddress, setDeliveryAddress] = useState<string | null>(null);
    const [deliveryMode, setDeliveryMode] = useState<ModeLivraison | null>(null);
    const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
    const [paiementMode, setPaiementMode] = useState<ModePaiement | null>(null);


    // Surveiller la position actuelle de l'utilisateur
    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setCurrentPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error(error);
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    // Préparer l'objet de livraison
    const prepareDeliveryObject = () => {
        return {
            user,
            currentPosition,
            deliveryAddress,
            deliveryMode,
            selectedDepot,
        };
    };

    return (
        <DeliveryContext.Provider
            value={{
                user,
                setUser,
                currentPosition,
                setCurrentPosition,
                otherPosition,
                setotherPosition,
                deliveryAddress,
                setDeliveryAddress,
                deliveryMode,
                setDeliveryMode,
                selectedDepot,
                setSelectedDepot,
                paiementMode,
                setPaiementMode,
                prepareDeliveryObject,
            }}
        >
            {children}
        </DeliveryContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte
export const useDelivery = () => {
    const context = useContext(DeliveryContext);
    if (!context) {
        throw new Error("useDelivery must be used within a DeliveryProvider");
    }
    return context;
};