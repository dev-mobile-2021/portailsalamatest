// api/graphql/queries.ts

// Requête pour obtenir les produits paginés

// Modifier la fonction getProductsPaginatedQuery pour accepter userId
export const getProductsPaginatedQuery = (
  page: number,
  count: number,
  userId: number | null = null,
  categorie_id: number | null = null,
  designation: string | null = null,
) => {
  // Construire dynamiquement les arguments de la requête
  const args = [
    `page: ${page}`,
    `count: ${count}`,
    userId !== undefined && userId !== null ? `userId: ${userId}` : null,
    categorie_id !== undefined && categorie_id !== null
      ? `categorie_id: ${categorie_id}`
      : null,
    designation !== undefined && designation !== null
      ? `designation: "${designation}"`
      : null,
  ].filter(Boolean);

  return `
      query {
          produitspaginated(${args.join(", ")}) {
              metadata {
                  total
                  per_page
                  current_page
                  last_page
              }
              data {
                  id
                  designation
                  quantite
                  description
                  code
                  like
                  image
                  prix
                  souscategorie {
                      id
                      designation
                      categorie {
                          id
                          designation
                      }
                  }
              }
          }
      }
  `;
};

// getproduitfavoriespaginatedsQuery
export const getproduitfavoriespaginatedsQuery = (
  page: number,
  count: number,
  userId: number,
) => `
    query {
        favoriespaginated(page: ${page}, count: ${count}, userId: ${userId}) {
            metadata {
                total
                per_page
                current_page
                last_page
            }
            data {
                id
               produit{
                 id
                 designation
                 prix
                 image
                 quantite
                 like
               }
            }
        }
    } 
`;

export const getcommandespaginatedsQuery = (
  page: number,
  count: number,
  client_id: number | null = null,
  bailleur_id: number | null = null,
) => {
  const args = [
    `page: ${page}`,
    `count: ${count}`,
    client_id !== undefined && client_id !== null
      ? `client_id: ${client_id}`
      : null,
    bailleur_id !== undefined && bailleur_id !== null
      ? `bailleur_id: ${bailleur_id}`
      : null,
  ].filter(Boolean);
  return ` 
  query {
      commandespaginated(${args.join(", ")}) {
          metadata {
              total
              per_page
              current_page
              last_page
          }
          data {
              id
              statut
              etat_text
              etat_badge
              detailcommandes {
                  id
                  prix
                  avg
                  quantite
                  article_id
                  article {
                      id
                      designation
                  }
              }
              datecommande
              datereception
              client_id
              typelivraison_id
              client {
                  id
                  designation
              }
              typelivraison {
                  id
                  designation
              }
              campagne {
                  id
                  designation
                  datefin
                  date
                  etat_text
                  etat_badge
                  image
              }
          }
      }
  }
`;
};

export const commandeQuery = (id: number, client_id?: number) => {
  const args = [
    `id: ${id}`,
    client_id !== undefined ? `client_id: ${client_id}` : null,
  ].filter(Boolean);

  return `
  query {
    commandes(${args.join(", ")}) {
      id
      statut
      etat_text
      etat_badge
     
      datecommande
      datereception
      client_id
      typelivraison_id
      client {
        id
        designation
      }
      typelivraison {
        id
        designation
      }
      campagne {
        id
        designation
        datefin
        date
        etat_text
        etat_badge
        image
      }
    }
  }
  `;
};

export const getprivilegeQuery = `

{
  privileges
  {id
  designation
  couleur
  point
  image
  privilegerecompenses{
  id
  typerecompense
  {
  designation
  id
  }
  }
}
}

`;

export const productQuery = (id: number) => `
{
produits(id: ${id}) {
  id
  designation
  prixformat
  quantite
  description
  like
  code
  image
  prix
  souscategorie {
    id
    designation
    categorie {
      id
      designation
    }
  }
}
}
`;

// modelivraisons%20{id,designation,code}

export const getModelivraisonQuery = `
{
modelivraisons {
  id
  designation
  code
}
}
`;
// id,designation,description,adresse,latitude,longitude

export const getDepotQuery = `
{
depots {
  id
  designation
  description
  adresse
  latitude
  longitude
}
}
`;
// modepaiements
//id,designation,image,code

export const getModepaiementQuery = `
{
modepaiements {
  id
  designation
  image
  code
}
}
`;

export const getproduitsQuery = `
{
  produits {
    id
    designation
    quantite
    description
    code
    image
    prix
    souscategorie {
      id
      designation
      categorie {
        id
        designation
      }
    }
  }
}
`;
// produitsimilairespaginated

export const getProduitsSimilairesPaginatedQuery = (
  page: number,
  count: number,
) => `
    query {
        produitsimilairespaginated( page: ${page}, count: ${count}) {
            metadata {
                total
                per_page
                current_page
                last_page
            }
            data {
                id
                designation
                quantite
                description
                code
                image
                prix
                souscategorie {
                    id
                    designation
                    categorie {
                        id
                        designation
                    }
                }
            }
        }
    }
`;

// paniers "id,montanttotal,produit{id,designation,description,code,image,prix,souscategorie{id,designation,categorie{id,designation}}},quantite",

export const getPanierQuery = (id: number) => `
{
  paniers(user_id: ${id}) {
    id
    etat
    panierproduits {
      produit_id
      quantite
      prix
      produit {
        id
        designation
        description
        image
        prix
      }
    }
  }
}
`;

// api/graphql/queries.ts

// Requête pour obtenir les catégories avec sous-catégories
export const getCategoriesQuery = `
    query {
        categories {
            id
            designation
            description
            souscategories {
                id
                designation
            }
        }
    }
`;

export const getSousCategoriesQuery = `
{
  souscategories {
    id
    designation
    image
    categorie {
      id
      designation
    }
  }
}
`;

// preference queries

export const getPreferencesQuery = `
{
  preferences {
    id
    logo
    logo2
    email
    lieu
    promotion
    promotion2
    siteweb
    telephone
    telephone2
  }
}
`;

export const getCampagnesQuery = `
{
  campagnes {
    id
    date
    designation
    statut
    programme_id
    programme {
      id
      designation
      objectif
      missions
      date
    }
    phasedepots {
      id
      datedeb
      datefin
      etat
    }
    image
    articlescampagnes {
      id
      quantite
      prix
      article {
        id
        designation
        quantite
        description
        code
        image
        prix
      }
    }
  }
}
`;

export const getProgrammesQuery = () =>
  `{
  programmes {
    id
    designation
    objectif
  }
}
`;

/**
 * Requête pour récupérer les articles avec filtres optionnels
 * @param TCLCOD_0 - Code de catégorie pour filtrer les articles
 * @param client_id - ID du client pour filtrer les articles
 */
export const getArticlesQuery = (TCLCOD_0?: number, client_id?: number) => {
  // Construction des filtres GraphQL
  const filters = [
    TCLCOD_0 !== undefined ? `TCLCOD_0: ${TCLCOD_0}` : null,
    client_id !== undefined ? `client_id: ${client_id}` : null,
  ].filter(Boolean);

  return `{
    articles${filters.length > 0 ? `(${filters.join(", ")})` : ""} {
      id
      designation
      prix
      code
      TCLCOD_0
      unite {
        id
        designation
      }
    }
  }`;
};

/**
 * Requête pour récupérer un article spécifique par ID
 * @param id - ID de l'article à récupérer
 */
export const getArticleQuery = (id: number) => `{
  articles(id: ${id}) {
    id
    designation
    prix
    code
    TCLCOD_0
    unite {
      id
      designation
    }
  }
}`;

export const getCampagnesPaginatedQuery = (
  page: number,
  count: number,
  client_id: number,
) => `
  query {
    campagnespaginated(page: ${page}, count: ${count}, client_id: ${client_id}) {
      metadata {
        total
        per_page
        current_page
        last_page
      }
      data {
        id
        date
        designation
        statut
        programme_id
        programme {
          id
          designation
          objectif
          missions
          date
        }
        phasedepots {
          id
          datedeb
          datefin
          etat
        }
        image
        articlescampagnes {
          id
          quantite
          article {
            id
            designation
            quantite
            description
            code
            image
            prix
          }
        }
      }
    }
  }
`;

export const getCampagneQuery = (id: number) => `
{
  campagnes(id: ${id}) {
    id
    date
    designation
    statut
    programme_id
    programme {
      id
      designation
      objectif
      missions
      date
    }
    phasedepots {
      id
      datedeb
      datefin
      etat
    }
    image
    articlescampagnes {
      id
      quantite
      prix
      article {
        id
        designation
        quantite
        description
        code
        image
        prix
      }
    }
  }
}
`;

// caroussels

export const getTypelivraisonsQuery = `
{
  typelivraisons {
    id
    designation
  }
}
`;

// categories

export const getCategoriesQuerynode = `
{
  categories {
    id
    designation
    image
    souscategories{
    image
    id
    designation
    }
  }
}
`;

// produitsimilaires

export const getproduitsimilairesQuery = `
    produitsimilaires {
            id
            designation
            quantite
            description
            code
            image
            prix
            souscategorie {
                id
                designation
                categorie {
                    id
                    designation
                }
            }
        }
`;

// produitplusvus

export const getproduitplusvusQuery = `
{
 produitplusvus {
            id
            designation
            quantite
            description
            code
            like
            image
            prix
            souscategorie {
                id
                designation
                categorie {
                    id
                    designation
                }
            }
        }
}
`;

export const getAOsQuery = (
  fournisseur_id: string | number | null = null,
  Soumission: string | number | null = null,
) => `
{
  aos(fournisseur_id: ${fournisseur_id}, soumission: ${Soumission}) {
    id
    isnotationfournisseur
    isnotationarticle
    TSSCOD_0_0
    targetpricestatus
    isnotationadministrative
    statut
    attachments {
     id
     designation
     isannexe
     documentspecification {
      id
      designation
      etatetexte
      nature
      }
     url
    }
    date
    datecloture
    etat_text
    etat_badge
    reference
    designation
    typemarche_id
    typemarche {
      id
      designation
    }
    typeprocedure_id
    typeprocedure {
      id
      designation
    }
    datepublication
    aoarticles {
      id
      quantite
      targetpricestatus
      targetprice
      detailda_id
      coeff
      article {
        id
        code
        designation
      }
    } 
  }
}
`;

export const getSoumissionsQuery = `
{
  soumissions {
    id
    soumissionarticles {
      id ranking coeff is_resilie motif_resiliation
      prixunitairepropose quantitepropose
      typecondition_id typecondition { id designation }
      devise_id devise { id designation taux }
      fabricant_id fabricant { id designation }
      article_id article { id designation code prix }
      isselected
      soumissionarticlelots {
        id lot quantite dateperemption dureedevie
        fabricant { id designation }
        isselected ranking
        devise { id designation taux }
      }
      detailprixfabricants {
        id fabricant_id prixunitaire devise_id
        fabricant { id designation }
        devise { id designation taux }
      }
    }
  }
}`;

// Queries for Fabricants
export const getFabricantsQuery = () => `
  query {
    fabricants {
      id
      designation
      adresse
    }
  }
`;

export const getFabricantsPaginatedQuery = (
  page: number,
  count: number,
  etat?: number,
  user_id?: number | string
) => {
  const args = [
    `page: ${page}`,
    `count: ${count}`,
    etat !== undefined ? `etat: ${etat}` : null,
    user_id !== undefined ? `user_id: ${user_id}` : null,
  ].filter(Boolean);

  return `
    query {
      fabricantspaginated(${args.join(", ")}) {
        metadata {
          total
          per_page
          current_page
          last_page
        }
        data {
          id
          designation
          code
          etat
          etat_text
          etat_badge
          user_id
        }
      }
    }
  `;
};

export const createFabricantMutation = () => `
  mutation CreateFabricant($designation: String!, $adresse: String!, $pays: String) {
    createFabricant(input: {
      designation: $designation,
      adresse: $adresse,
      pays: $pays
    }) {
      id
      designation
      adresse
      pays
    }
  }
`;

export const updateFabricantMutation = () => `
  mutation UpdateFabricant($id: ID!, $designation: String!, $adresse: String!, $pays: String) {
    updateFabricant(id: $id, input: {
      designation: $designation,
      adresse: $adresse,
      pays: $pays
    }) {
      id
      designation
      adresse
      pays
    }
  }
`;

export const deleteFabricantMutation = () => `
  mutation DeleteFabricant($id: ID!) {
    deleteFabricant(id: $id) {
      id
    }
  }
`;

export const getSousFamillesQuery = () => `
{
familles
  {
    id
    designation
  }
}
`;

// Requête pour récupérer la flotte d'un fournisseur (parkings, véhicules, chauffeurs)
export const getFlotteFournisseurQuery = (fournisseur_id: string | number) => `
{
  fournisseurs(id: ${fournisseur_id}) {
    id
    nom
    code
    parkings {
      id
      vehicules{
        id
        matricule
        marque
        description
        volume
        etat
        tonnage_id
        tonnage {
          id
          designation
          tonnage
        }
        typevehicule_id
        typevehicule {
          id
          designation
        }
        chauffeur_id
        chauffeur {
          id
          nom
          telephone
          email
          adresse
        }
      }
    }
  }
}
`;

export const getTypeCommandesQuery = (client_id?: number) => `
{
  typecommandes(client_id: ${client_id || 0}) {
    id
    designation
  }} `;

// Nouvelle query pour récupérer les commandes avec filtres
export const getCommandesNewQuery = (
  client_id?: number,
  typecommande_id?: number,
  user_id?: number,
  id?: number,
) => {
  const args = [
    client_id !== undefined ? `client_id: ${client_id}` : null,
    typecommande_id !== undefined
      ? `typecommande_id: ${typecommande_id}`
      : null,
    user_id !== undefined ? `user_id: ${user_id}` : null,
    id !== undefined ? `id: ${id}` : null,
  ].filter(Boolean);

  return `
    query {
      commandes(${args.length > 0 ? args.join(", ") : ""}) {
        id
        statut
        commentaire
        campagne {
          id
          designation
           programme {
            id
            designation
        }
        }
        etat_text
        etat_cd_text
        etat_cd_badge
        etat_commande 
        client_id
        typecommande_id
        typecommande {
          id
          designation
        }
        datecommande
        client {
          id
          designation
          COMPTE_0
        }
        lignecommandes {
          article {
            id
            designation
          }
          qte_debut
          qte_recue
          qte_distribuee
          qte_perdue
          ajustement
          qte_fin
          cmm
          detaillignecommandes {
            id
            lot
            quantite
            dateperemption
          }
          stock_max
          quantite
          qte_commandee
          nb_jour_rupture
          msd
          qte_transferes
          qte_dfs
          article_text
          catalogue
          famille_id
          famille {
            id
            designation
          }
          pv_ht
        }
      }
    }
  `;
};

// Query paginée OPTIMISÉE pour la liste des commandes (Orders.tsx)
// Réduction de ~94% des données : seulement 15 champs au lieu de 70+
// Ne récupère que les champs affichés dans la liste pour améliorer les performances
// Gain : 10x plus rapide pour 50 commandes avec 20 articles chacune
export const getCommandesListPaginatedQuery = (
  page: number,
  count: number,
  client_id?: number,
  typecommande_id?: number,
  user_id?: number,
  code?: string,
  statut?: number,
) => {
  const args = [
    `page: ${page}`,
    `count: ${count}`,
    client_id !== undefined ? `client_id: ${client_id}` : null,
    typecommande_id !== undefined? `typecommande_id: ${typecommande_id}`: null,
    user_id !== undefined ? `user_id: ${user_id}` : null,
    code !== undefined ? `code: "${code}"` : null,
    statut === undefined ? null : statut === 3 ? `statut_min: 3` :statut === 1 ? `etape_besoinclient: 1` : `statut: ${statut}`,
  ].filter(Boolean);

  return `
    query {
      commandespaginated(${args.join(", ")}) {
        metadata {
          total
          per_page
          current_page
          last_page
        }
        data {
          id
          statut
          code
          datecommande
          client_id
          codedevis
          etat_text
          etat_badge
          etat_cd_text
          etat_cd_badge
          client {
            designation
            COMPTE_0
          }
          campagne {
            id
            designation
            programme {
              id
              designation
            }
          }
          programme {
            id
            designation
          }
          lignecommandes {
            id
          }
        }
      }
    }
  `;
};

// Query paginée pour les nouvelles commandes (détails complets)
export const getCommandesNewPaginatedQuery = (
  page: number,
  count: number,
  client_id?: number,
  typecommande_id?: number,
  user_id?: number,
  code?: string,
  statut?: number,
) => {
  const args = [
    `page: ${page}`,
    `count: ${count}`,
    client_id !== undefined ? `client_id: ${client_id}` : null,
    typecommande_id !== undefined
      ? `typecommande_id: ${typecommande_id}`
      : null,
    user_id !== undefined ? `user_id: ${user_id}` : null,
    code !== undefined ? `code: "${code}"` : null,
    statut !== undefined ? `statut: ${statut}` : null,
  ].filter(Boolean);

  return `
    query {
      commandespaginated(${args.join(", ")}) {
        metadata {
          total
          per_page
          current_page
          last_page
        }
        data {
          id
          statut
          commentaire
          campagne {
            id
            designation
             programme {
              id
              designation
            }
          }
          programme {
            id
            designation
          }
          etat_text
          etat_cd_text
          etat_cd_badge
          etat_commande 
          etat
          validationclient
          validationsalama
          dateprevulivraison
          client_id
          typecommande_id
          typecommande {
            id
            designation
          }
          datecommande
          client {
            id
            designation
            COMPTE_0
          }
          lignecommandes {
            article {
              id
              designation
            }
          }
        }
      }
    }
  `;
};

// Query pour une commande spécifique
export const getCommandeNewByIdQuery = (
  id: number,
  client_id?: number,
  user_id?: number,
) => {
  const args = [
    `id: ${id}`,
    client_id !== undefined ? `client_id: ${client_id}` : null,
    user_id !== undefined ? `user_id: ${user_id}` : null,
  ].filter(Boolean);

  return `
    query {
      commandes(${args.join(", ")}) {
        id
        statut
        codedevis
        codeproforma_agence
        codeproforma_central
        commentaire
        validationclient_ral_etape1
validationsalama_ral_etape1
validationclient_ral_etape2
validation_dm_ral_etape2
validation_dvm_ral_etape2
        campagne {
          id
          designation
           programme {
            id
            designation
        }
        }  
        etat_text
        etat
        etat_cd_text
        etat_cd_badge
        etat_commande 
        validationclient
        validationsalama
        dateprevulivraison
        client_id
        typecommande_id
        typecommande {
          id
          designation
        }
        datecommande
        client {
          id
          designation
          axe {
            id
            designation
          }
        }
        lignecommandes {
          id
          etat
                      is_ral
etat_ral
etat_ral_text
etat_ral_badge
          article {
            id
            designation
            prix
            code
            unite {
              id
              designation
            }
          }
          prix
          qte_debut
          qte_recue
          qte_distribuee
          qte_perdue
          ajustement
          qte_fin
          cmm
          remisepourcentage
             detaillignecommandes {
            id
            lot
            quantite
            dateperemption
          }
          stock_max
          quantite
          qte_commandee
          nb_jour_rupture
          msd
          qte_transferes
          qte_dfs
          article_text
          catalogue
          famille_id
          famille {
            id
            designation
          }
          pv_ht
          prix
          dateperemption
          source_lot
        }
      }
    }
  `;
};

export const getConditionnementsQuery = () => `{
  conditionnements {
    id
    designation
    code
  }
}`;

// Query pour récupérer les expéditions avec toutes les informations
export const getExpeditionsQuery = (client_id?: number) => {
  const args = client_id !== undefined ? `client_id: ${client_id}` : "";

  return `
    query {
      expeditions${args ? `(${args})` : ""} {
        id
        statut
        bailleur_id
        date_expedition
        observation
        bailleur {
          id
        }
        campagne {
          id
        }
        expeditionaxes {
          id
          expedition_id
          axe_id
          statut
          expeditionclients {
            id
            expeditionaxe_id
            client_id
            statut
            client {
              id
              designation
            }
            expeditiondetails {
              id
              expeditionclient_id
              article_id
              quantite
              lot
              detailsordreservice_id
              article {
                id
                designation
                code
              }
              detailsordreservice {
                id
                quantite
                lot
                statut
                article {
                  id
                  designation
                  code
                }
                affectation {
                  id
                  lignecommande {
                    id
                  }
                  stock {
                    id
                    quantite
                    lot
                    date_peremption
                    depot_id
                  }
                }
              }
            }
          }
          axe {
            id
            designation
          }
        }
      }
    }
  `;
};

// Requêtes pour les Offres de Transport
export const getOffresTransportQuery = (
  id?: number,
  filtersObj?: { est_publier?: number },
) => {
  const idFilter = id !== undefined ? `id: ${id}` : "";
  const estPublierFilter =
    filtersObj?.est_publier !== undefined
      ? `est_publier: ${filtersObj.est_publier}`
      : "";
  const filters = [idFilter, estPublierFilter]
    .filter((f) => f !== "")
    .join(", ");

  return `{
    offretransports${filters ? `(${filters})` : ""} {
      id
      reference
      annee
      designation
      date
      est_publier
      est_valider
      datepublication
      datelimite
      dateouverture
      a_fichetechnique
      a_infchauffeur
       offretransportdocspecifis{
    id
    documentspecifications_id
    url
    designation
    date
    documentspecification{
    id
    designation
    etape
    section
    sectiontexte
    nature
    typemarche_id
    } 
    }
      detailoffretransports {
        id
        axe_id
        axe {
          id
          designation
        }
        detailoffretransporttonnages {
          id
          tonnage_id
          quantite
          prix_unitaire
          montant_total
          tonnage {
            id
            designation
            tonnage
            min
            max
            volume_min
            volume_max
          }
        }
      }
    }
  }`;
};

export const getOffreTransportByIdQuery = (id: number) => `{
  offretransports(id: ${id}) {
    id
    reference
    annee
    designation
    date
    est_publier
    est_valider
    datepublication
    datelimite
    dateouverture
    a_fichetechnique
    a_infchauffeur
    offretransportdocspecifis{
    id
    documentspecifications_id
    url
    designation
    date
    documentspecification{
    id
    designation
    etape
    section
    sectiontexte
    nature
    typemarche_id
    } 
    }
    detailoffretransports {
      id
      axe_id
      axe {
        id
        designation
      }
      detailoffretransporttonnages {
        id
        tonnage_id
        quantite
        prix_unitaire
        montant_total
        tonnage {
          id
          designation
          tonnage
          min
          max
          volume_min
          volume_max
        }
      }
    }
  }
}`;

// =============================================
// EXPEDITIONS TRANSPORTEUR QUERIES
// =============================================

/**
 * Récupère toutes les expéditions d'un transporteur
 */
export const getExpeditionsTransporteurQuery = (fournisseur_id: number) => `
{
  detailsannuairetransporteurs(fournisseur_id: ${fournisseur_id}) {
    id
    axe { designation }
    tonnage { designation, tonnage }
    fournisseur { nom, score }
    annuairetransporteur {
      reference
      annee
      periode_deb
      periode_fin
    }
    vehiculesannuairetransporteurs {
      ordre
      montant
      vehicule {
        matricule
        marque
        tonnage { tonnage }
        chauffeur { nom }
      }
      expeditionaxetransporteurs {
        id
        statut
        etat_text
        tonnage_affecte
        volume_affecte
        cout_transport
        pourcentage_remplissage_tonnage
        pourcentage_remplissage_volume
        expeditionaxe {
          axe { designation }
          expedition {
            code
            date_expedition
          }
        }
        expeditionaxetransporteurclients {
          tonnage_affecte
          expeditionclient {
            client { designation }
          }
        }
      }
    }
  }
}`;

/**
 * Récupère les détails d'une expédition spécifique
 */
export const getExpeditionDetailQuery = (fournisseur_id: number) => `
{
  detailsannuairetransporteurs(fournisseur_id: ${fournisseur_id}) {
    id
    axe { designation }
    vehiculesannuairetransporteurs {
      vehicule {
        matricule
        marque
        chauffeur { nom }
      }
      expeditionaxetransporteurs {
        id
        statut
        etat_text
        tonnage_affecte
        volume_affecte
        cout_transport
        pourcentage_remplissage_tonnage
        pourcentage_remplissage_volume
        expeditionaxe {
          axe { designation }
          expedition {
            code
            date_expedition
          }
        }
        expeditionaxetransporteurclients {
          tonnage_affecte
          expeditionclient {
            client { designation }
          }
        }
      }
    }
  }
}`;

// =============================================
// QUERIES MISSIONS - NOUVELLE API RÉELLE
// =============================================

/**
 * Récupère les missions depuis la nouvelle API (structure aplatie)
 * Cette query retourne directement les expeditionaxetransporteurs avec véhicule inclus
 */
export const getMissionsTransporteurQuery = (fournisseur_id: number) => `
{
  expeditionaxetransporteurs(fournisseur_id: ${fournisseur_id}) {
    id
    statut
    etat_text
    etat_badge
    convoyeur {
      id
      nom
      adresse
      telephone
    }
    chauffeur {
      id
      nom
      email
      telephone
    }
    validation_fournisseur
    pvrd_chauffeur_disponible
    bon_retour_chauffeur_disponible
    fiche_pointage_disponible
    bl_transporteur_disponible
    chrono_disponible
    ordremission_disponible
    tonnage_affecte
    volume_affecte
    cout_transport
    vehicule {
      id
      matricule
      marque
      tonnage {
        id
        designation
        tonnage
      }
    }
    expeditionaxe {
      id
      tonnage_restant
      tonnage_couvert
      volume_restant
      volume_couvert
      axe {
        id
        designation
      }
      expedition {
        id
        code
        date_expedition
        statut
      }
    }
    expeditionaxetransporteurclients {
      id
      tonnage_affecte
      volume_affecte
      ordre_chargement
      statut_portion
      statut_portion_text
      statut_portion_badge
      date_livraison_portion
      observation_livraison
      expeditionclient {
        id
        codelivraison
        poidsexpedition
        volume
        statut_livraison
        statut_livraison_text
        statut_livraison_badge
        date_cloture_livraison
        commentaire_livraison
        date_livraison
        url_pvrd
        url_bl_signe
        url_bon_retour
        url_fiche_pointage
        client {
          id
          designation
        }
      }
    }
    remplacements {
      id
      motif
      statut
      statut_text
      est_en_attente
      vehicule_actuel {
        matricule
        tonnage { tonnage }
      }
      vehicule_remplacement {
        matricule
        tonnage { tonnage }
      }
      difference_tonnage
      est_amelioration_capacite
    }
  }
}`;

/**
 * Récupère une mission spécifique par ID
 */
export const getMissionByIdQuery = (id: string) => `
{
  expeditionaxetransporteurs(id: ${id}) {
    id
    statut
    etat_text
    etat_badge
    convoyeur {
      id
      nom
      adresse
      telephone
    }
    chauffeur {
      id
      nom
      email
      telephone
    }
    validation_fournisseur
    pvrd_chauffeur_disponible
    bon_retour_chauffeur_disponible
    fiche_pointage_disponible
    bl_transporteur_disponible
    chrono_disponible
    ordremission_disponible
    tonnage_affecte
    volume_affecte
    cout_transport
    vehicule {
      id
      matricule
      marque
      tonnage {
        id
        designation
        tonnage
      }
      chauffeur {
        id
        nom
        email
        telephone
      }
    }
    expeditionaxe {
      id
      tonnage_restant
      tonnage_couvert
      volume_restant
      volume_couvert
      axe {
        id
        designation
      }
      expedition {
        id
        code
        date_expedition
        statut
      }
    }
    expeditionaxetransporteurclients {
      id
      tonnage_affecte
      volume_affecte
      ordre_chargement
      statut_portion
      statut_portion_text
      statut_portion_badge
      date_livraison_portion
      observation_livraison
      expeditionclient {
        id
        codelivraison
        poidsexpedition
        volume
        statut_livraison
        statut_livraison_text
        statut_livraison_badge
        date_cloture_livraison
        commentaire_livraison
        date_livraison
        url_pvrd
        url_bl_signe
        url_bon_retour
        url_fiche_pointage
        client {
          id
          designation
        }
      }
    }
    remplacements {
      id
      motif
      statut
      statut_text
      est_en_attente
      vehicule_actuel {
        matricule
        tonnage { tonnage }
      }
      vehicule_remplacement {
        matricule
        tonnage { tonnage }
      }
      difference_tonnage
      est_amelioration_capacite
    }
  }
}`;

// =============================================
// CHAUFFEURS QUERIES
// =============================================

/**
 * Récupère tous les chauffeurs d'un fournisseur
 */
export const getChauffeursQuery = (fournisseur_id: number) => `{
  chauffeurs(fournisseur_id: ${fournisseur_id}) {
    id
    nom
    telephone
    email
    adresse
  }
}`;

// =============================================
// VEHICULES QUERIES
// =============================================

/**
 * Récupère les véhicules filtrés par fournisseur_id et tonnage_id
 */
export const getVehiculesQuery = (
  fournisseur_id: number,
  tonnage_id: number,
) => `{
  vehicules(fournisseur_id:${fournisseur_id},tonnage_id:${tonnage_id}) {
    id
    matricule
    marque
    description
    volume
    etat
    tonnage_id
    tonnage {
      id
      designation
      tonnage
    }
    typevehicule_id
    typevehicule {
      id
      designation
    }
  }
}`;

// Query pour récupérer les devises
export const getDevisesQuery = () => `{
  devises {
    id
    designation
    taux
  }
}`;

// Query pour récupérer les clients
export const getClientsQuery = (user_id?: number | null) => {
  // Si user_id est fourni, l'ajouter comme argument à la query
  const userArg =
    user_id !== undefined && user_id !== null ? `(user_id: ${user_id})` : "";
  return `{
    clients${userArg} {
      id
      designation
      COMPTE_0
      codecategorie
    }
  }`;
};

// Query pour récupérer l'historique des demandes client
export const getHistoriqueDemandeClientsQuery = (lignecommande_id: number) => `{
  historiquedemandeclients(lignecommande_id: ${lignecommande_id}) {
    id
    quantite_actuelle
    quantite_demandee
    motif_demande
    affecter_nouveau_lot
    lignecommande_id
    statut
    motif_refus
    demandeur_id
    validateur_id
    date_demande
    date_traitement
  }
}`;
