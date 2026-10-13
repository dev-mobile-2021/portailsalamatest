import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTruck, FaRoute, FaCalendarAlt } from "react-icons/fa";

// Import de l'image transport
import transportImg from "../assets/images/transporteur.png";

// Types
import { OffreTransport } from "../types/OffreTransport.types";

interface TransportOfferCardProps {
  offre: OffreTransport;
}

const TransportOfferCard: React.FC<TransportOfferCardProps> = ({ offre }) => {
  const navigate = useNavigate();

  // Formatage des dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calcul du nombre total de tonnages
  const totalTonnages = offre.detailoffretransports?.reduce(
    (acc, detail) => acc + (detail.detailoffretransporttonnages?.length || 0),
    0
  ) || 0;

  /*
  // Statut de l'offre - non utilisé pour le moment
  const getStatusBadge = () => {
    if (offre.est_valider) {
      return (
        <span className="badge bg-success d-flex align-items-center gap-1">
          <FaCheckCircle size={10} /> Validé
        </span>
      );
    }
    if (offre.est_publier) {
      return (
        <span className="badge bg-primary d-flex align-items-center gap-1">
          <FaClock size={10} /> Publié
        </span>
      );
    }
    return (
      <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
        <FaClock size={10} /> En attente
      </span>
    );
  };
  */

  return (
    <div
      className="card h-100 shadow-sm border-0"
      style={{ borderRadius: "12px", maxWidth: "400px", overflow: "hidden" }}
    >
      {/* Image d'en-tête */}
      <div
        style={{
          height: "120px",
          overflow: "hidden",
          position: "relative",
    
        }}
      >
        <img
          src={transportImg}
          alt={offre.designation}
          className="w-100 h-100"

        />
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
          }}
        >
      
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            color: "white",
          }}
        >
    
        </div>
      </div>

      {/* Contenu */}
      <div className="card-body d-flex flex-column p-3">
        {/* Référence et année */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted" style={{ fontSize: "0.75rem" }}>
            Réf: {offre.reference}
          </small>
          <span
            className="badge bg-light text-dark"
            style={{ fontSize: "0.7rem" }}
          >
            {offre.annee}
          </span>
        </div>

        {/* Titre */}
        <h6
          className="card-title fw-bold mb-2"
          style={{
            fontSize: "0.95rem",
            lineHeight: "1.3",
            color: "#1FB05B",
            minHeight: "40px",
          }}
        >
          {offre.designation}
        </h6>

        {/* Infos axes et tonnages */}
        <div className="d-flex gap-3 mb-3">
          <div className="d-flex align-items-center gap-1 text-muted">
            <FaRoute size={12} />
            <small style={{ fontSize: "0.75rem" }}>
              {offre.detailoffretransports?.length || 0} axe(s)
            </small>
          </div>
          <div className="d-flex align-items-center gap-1 text-muted">
            <FaTruck size={12} />
            <small style={{ fontSize: "0.75rem" }}>{totalTonnages} tonnage(s)</small>
          </div>
        </div>

        {/* Dates */}
        <div className="border-top pt-2 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted d-flex align-items-center gap-1">
              <FaCalendarAlt size={10} /> Publication
            </small>
            <small className="fw-semibold" style={{ color: "#1FB05B" }}>
              {formatDate(offre.datepublication)}
            </small>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted d-flex align-items-center gap-1">
              <FaCalendarAlt size={10} /> Date limite
            </small>
            <small className="fw-semibold text-danger">
              {formatDate(offre.datelimite)}
            </small>
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="mt-auto">
          <button
            className="btn btn-success rounded-pill px-3 py-1 fw-semibold shadow-sm w-100"
            style={{ fontSize: "0.8rem" }}
            onClick={() => navigate(`/client/transport-offer/${offre.id}`)}
          >
            Consulter l'offre
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportOfferCard;
