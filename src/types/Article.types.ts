/**
 * Types pour les Articles
 * Définit les structures de données pour les articles du système
 */

export type Article = {
  id: number;
  designation: string;
  prix: number;
  pvht?: number;
  code: string;
  TCLCOD_0?: number;
  conditionnement?: number;
  unite?:
    | {
        id: number;
        designation: string;
      }
    | string;
  image?: string;
  categorie?: string | number;
  multiple?: number;
};

export type ArticlesResponse = {
  articles: Article[];
};

export type UseArticlesParams = {
  TCLCOD_0?: number;
};
