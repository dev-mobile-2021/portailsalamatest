import { useState, useEffect } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import {
  getOffresTransportQuery,
  getOffreTransportByIdQuery,
} from "../api/graphql/queries";
import {
  OffreTransport,
  OffresTransportResponse,
  UseOffresTransportProps,
} from "../types/OffreTransport.types";

// ========================================
// 🔧 TOGGLE MOCK DATA - Mettre à true pour tester sans API
// ========================================
const USE_MOCK = false; // Changer à false pour utiliser l'API réelle
// ========================================

// Ré-exporter les types pour faciliter l'utilisation
export type {
  Tonnage,
  DetailOffreTransportTonnage,
  Axe,
  DetailOffreTransport,
  OffreTransport,
} from "../types/OffreTransport.types";

export const useOffresTransport = (props?: UseOffresTransportProps) => {
  const [offresTransport, setOffresTransport] = useState<OffreTransport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffresTransport = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = getOffresTransportQuery(props?.id);
        const response = await fetchGraphQL<{ data: OffresTransportResponse }>(query);

        console.log('Réponse des offres de transport:', response);
        if (response.data?.data?.offretransports) {
          setOffresTransport(response.data.data.offretransports);
        } else {
          throw new Error("Structure inattendue de la réponse ou aucune offre de transport trouvée.");
        }
      } catch (err: any) {
        console.error('Erreur lors de la récupération des offres de transport:', err);
        setError(err.message || "Erreur lors de la récupération des offres de transport.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffresTransport();
  }, [props?.id]);

  return { offresTransport, loading, error };
};

// Données mock pour les tests (en dehors du hook pour éviter les recréations)
const MOCK_OFFRE_TRANSPORT: OffreTransport = {
  id: 1,
  reference: "OT-2024-001",
  annee: 2024,
  designation: "Offre de Transport - Livraison Marchandises (MOCK)",
  date: "2024-01-15",
  est_publier: true,
  est_valider: true,
  datepublication: "2024-01-10",
  datelimite: "2027-02-15",
  dateouverture: "2024-02-20",
  a_fichetechnique: true,
  a_infchauffeur: true,
  attachments: [],
  offretransportdocspecifis: [],
  detailoffretransports: [
    {
      id: 1,
      axe_id: 1,
      axe: { id: 1, designation: "Antananarivo → Toamasina" },
      detailoffretransporttonnages: [
        { id: 1, tonnage_id: 1, quantite: 3, prix_unitaire: 500000, montant_total: 1500000, tonnage: { id: 1, designation: "5 Tonnes", tonnage: 5, min: 0, max: 5, volume_min: 0, volume_max: 20 } },
        { id: 2, tonnage_id: 2, quantite: 2, prix_unitaire: 800000, montant_total: 1600000, tonnage: { id: 2, designation: "10 Tonnes", tonnage: 10, min: 5, max: 10, volume_min: 20, volume_max: 40 } },
      ],
    },
    {
      id: 2,
      axe_id: 2,
      axe: { id: 2, designation: "Antananarivo → Mahajanga" },
      detailoffretransporttonnages: [
        { id: 3, tonnage_id: 3, quantite: 1, prix_unitaire: 1200000, montant_total: 1200000, tonnage: { id: 3, designation: "20 Tonnes", tonnage: 20, min: 10, max: 20, volume_min: 40, volume_max: 80 } },
        { id: 4, tonnage_id: 1, quantite: 2, prix_unitaire: 600000, montant_total: 1200000, tonnage: { id: 1, designation: "5 Tonnes", tonnage: 5, min: 0, max: 5, volume_min: 0, volume_max: 20 } },
      ],
    },
  ],
};

// Hook pour une offre de transport spécifique
export const useOffreTransport = (id: number) => {
  const [offreTransport, setOffreTransport] = useState<OffreTransport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si USE_MOCK est activé, retourner directement les données mock
    if (USE_MOCK) {
      console.log("[useOffreTransport] 🔧 MODE MOCK ACTIVÉ - ID:", id);
      // Créer une copie du mock avec l'ID correct
      setOffreTransport({ ...MOCK_OFFRE_TRANSPORT, id: id || 1 });
      setLoading(false);
      return;
    }

    const fetchOffreTransport = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = getOffreTransportByIdQuery(id);
        const response = await fetchGraphQL<{ data: OffresTransportResponse }>(query);

        if (response.data?.data?.offretransports && response.data.data.offretransports.length > 0) {
          setOffreTransport(response.data.data.offretransports[0]);
        } else {
          throw new Error("Offre de transport non trouvée.");
        }
      } catch (err: any) {
        console.error('Erreur lors de la récupération de l\'offre de transport:', err);
        setError(err.message || "Erreur lors de la récupération de l'offre de transport.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOffreTransport();
    }
  }, [id]);

  return { offreTransport, loading, error };
};
