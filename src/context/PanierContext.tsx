// PanierContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PanierProduit } from "../types/panier.types";

interface PanierContextType {
    cartItems: PanierProduit[];
    setCartItems: (items: PanierProduit[]) => void;
    cartItemCount: number;
    setCartItemCount: (count: number) => void;
}

const PanierContext = createContext<PanierContextType | undefined>(undefined);

export const PanierProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<PanierProduit[]>([]);
    const [cartItemCount, setCartItemCount] = useState(0);

    const LOCAL_STORAGE_KEY = "paniers";

    // Charger le panier depuis le localStorage au montage du composant
    useEffect(() => {
        const localCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localCart) {
            const parsedCart = JSON.parse(localCart) as PanierProduit[];
            setCartItems(parsedCart);
            setCartItemCount(parsedCart.length);
        }
    }, []);

    // Mettre à jour le localStorage chaque fois que cartItems change
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        setCartItemCount(cartItems.length);
    }, [cartItems]);

    return (
        <PanierContext.Provider value={{ cartItems, setCartItems, cartItemCount, setCartItemCount }}>
            {children}
        </PanierContext.Provider>
    );
};

export const usePanierContext = () => {
    const context = useContext(PanierContext);
    if (!context) {
        throw new Error("usePanierContext doit être utilisé dans un PanierProvider");
    }
    return context;
};