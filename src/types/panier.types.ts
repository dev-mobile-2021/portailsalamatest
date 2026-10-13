// panier.types.ts

import { Product } from "./product.types";

export interface Panier {
    id: number;
    etat: number;
    panierproduits: PanierProduit[];
}

// Type pour un produit dans un panier
export interface PanierProduit {
    produit_id: number;
    quantite: number;
    prix: number;
    produit: Product;
}
