// types/product.types.ts
export interface Product {
    id: number;
    designation: string;
    quantite: number;
    description: string;
    like : number;
    prixformat: string;
    prix: number;
    image: string;
    souscategorie: {
        id: number;
        designation: string;
        categorie: {
            id: number;
            designation: string;
        };
    };
}
