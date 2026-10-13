export interface AOR {
  id: number;
  titre: string;
  reference: string;
  deadline: string;
  publishedDate: string;
  description: string;
  type: string;
  coefficient: number;
  ouvertureOffres: string;
  soumissions: {
    id: number;
    nom: string;
    etat: string;
    produits: {
      id: number;
      nom: string;
      quantite: number;
      targetPrice: number;
      disponible: number;
      prix: string;
      fabricant: string;
      amm: string;
      prequalifie: boolean;
    }[];
  }[];
  documents: {
    id: number;
    label: string;
    url: string;
  }[];
}
