/**
 * Hook useArticles
 *
 * Hook personnalisé pour récupérer les articles depuis l'API GraphQL.
 * Utilise React Query (useQuery) pour bénéficier du cache automatique
 * et éviter les requêtes redondantes au serveur.
 *
 * Les données sont mises en cache de manière permanente (Infinity) et
 * ne sont rafraîchies que lorsque l'utilisateur recharge la page.
 *
 * @param params - Paramètres optionnels de filtrage
 * @param params.TCLCOD_0 - Code de catégorie pour filtrer les articles
 * @param params.client_id - ID du client pour filtrer les articles
 *
 * @returns {Object} - Objet contenant articles, loading et error
 *
 * @example
 * ```tsx
 * const { articles, loading, error } = useArticles({ client_id: 123 });
 * ```
 */

import { useQuery } from "@tanstack/react-query";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getArticlesQuery, getArticleQuery } from "../api/graphql/queries";
import {
  Article,
  ArticlesResponse,
  UseArticlesParams,
} from "../types/Article.types";

export const useArticles = (params?: UseArticlesParams) => {

  console.log("recuperation des articles")
  const { data, isLoading, error } = useQuery({
    // Clé de cache unique basée sur les paramètres
    // Si les mêmes paramètres sont utilisés dans d'autres composants, le cache est partagé
    queryKey: ["articles", params?.TCLCOD_0],

    // Fonction de récupération des données
    queryFn: async () => {
      const query = getArticlesQuery(params?.TCLCOD_0);
      const response = await fetchGraphQL<{ data: ArticlesResponse }>(query);

      if (!response.data?.data?.articles) {
        console.error(
          "[useArticles] Structure inattendue de la réponse:",
          response,
        );
        return [];
      }

      // Mapper les articles avec la structure attendue
      return response.data.data.articles.map((article) => ({
        ...article,
        pvht: article.prix,
        categorie: article.TCLCOD_0 || "Non spécifié",
        multiple: 1,
        conditionnement: article.conditionnement || 1,
        unite:
          typeof article.unite === "object" && article.unite
            ? article.unite.designation
            : article.unite || "Non spécifié",
      })) as Article[];
    },

    // Les données restent fraîches indéfiniment
    // Seul un rechargement de page déclenchera une nouvelle requête
    staleTime: Infinity,

    // Les données restent en cache indéfiniment
    gcTime: Infinity,

    // 1 seule tentative en cas d'échec
    retry: 1,
  });

  return {
    articles: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
};

/**
 * Hook useArticle
 *
 * Hook personnalisé pour récupérer un article spécifique depuis l'API GraphQL.
 * Utilise React Query pour le cache et le partage de données entre composants.
 *
 * @param id - ID de l'article à récupérer
 *
 * @returns {Object} - Objet contenant article, loading et error
 *
 * @example
 * ```tsx
 * const { article, loading, error } = useArticle(123);
 * ```
 */
export const useArticle = (id: number) => {
  const { data, isLoading, error } = useQuery({
    // Clé de cache unique pour cet article spécifique
    queryKey: ["article", id],

    // Fonction de récupération des données
    queryFn: async () => {
      const query = getArticleQuery(id);
      const response = await fetchGraphQL<{ data: ArticlesResponse }>(query);

      if (
        !response.data?.data?.articles ||
        response.data.data.articles.length === 0
      ) {
        console.error("[useArticle] Article non trouvé pour l'ID:", id);
        return null;
      }

      const fetchedArticle = response.data.data.articles[0];

      return {
        ...fetchedArticle,
        pvht: fetchedArticle.prix,
        conditionnement: fetchedArticle.conditionnement || 1,
        categorie: fetchedArticle.TCLCOD_0 || "Non spécifié",
        multiple: 1,
        unite:
          typeof fetchedArticle.unite === "object" && fetchedArticle.unite
            ? fetchedArticle.unite.designation
            : fetchedArticle.unite || "Non spécifié",
      } as Article;
    },

    // Ne pas exécuter si l'ID n'est pas valide
    enabled: !!id && id > 0,

    // Les données restent fraîches indéfiniment
    staleTime: Infinity,

    // Les données restent en cache indéfiniment
    gcTime: Infinity,

    // 1 seule tentative en cas d'échec
    retry: 1,
  });

  return {
    article: data || null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
};

export default useArticles;
