import { Article, Campagne } from "./Campagne.types";
import { General } from "./general.types";
import { User } from "./user.types";

export interface Order {
    id: number;
    code?: string;
    codedevis?: string|null;
    codeproforma_agence?: string|null;
    codeproforma_central?: string|null;
    statut: number;
    etat_text: string;
    etat_cd_text: string;
    etat_cd_badge: string;
    etat_commande: number | null;
    etat_badge: string;
    detailcommandes: DetailCommande[];
    datecommande: string;
    datereception: string;
    client_id: number;
    typelivraison_id: number;
    client: User;
    typelivraison: General;
    campagne: Campagne;
    programme?: General;
}

export interface DetailCommande {
    id: number;
    prix: number;
    avg: number;
    quantite: number;
    article_id: number;
    article: Article;
}




// For the paginated response
export interface OrdersPaginatedResponse {
    data: Order[];
    metadata: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}