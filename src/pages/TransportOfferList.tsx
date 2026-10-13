import React from "react";
import TransportOfferCard from "../components/TransportOfferCard";
import { OffreTransport } from "../types/OffreTransport.types";

interface TransportOfferListProps {
  offres: OffreTransport[];
  loading?: boolean;
}

const TransportOfferList: React.FC<TransportOfferListProps> = ({ offres, loading = false }) => {
  if (loading) {
    return (
      <div className="container bg-white rounded-3 p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des offres de transport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container bg-white rounded-3 p-4">
      {offres.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>Aucune offre de transport disponible pour le moment.</p>
        </div>
      ) : (
        <div className="row g-4">
          {offres.map((offre) => (
            <div key={offre.id} className="col-lg-3 col-md-6 col-sm-12">
              <TransportOfferCard offre={offre} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransportOfferList;
