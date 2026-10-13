import React from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationCircle } from "react-icons/fa";

// Import des images locales
import pharmaProductsImg from "../assets/images/pharma_products.png";
import labEquipmentImg from "../assets/images/lab_equipment.png";
import transportImg from "../assets/images/transporteur.png";

interface TenderCardProps {
    id: number;
    titre: string;
    publishedDate: string;
    reference: string;
    deadline: string;
    description: string;
    typeCampagne: string;
    TSSCOD: string;
    status: number | string;
    // onViewAO: (AOId: number) => void;
}

const TenderCard: React.FC<TenderCardProps> = ({
    id, titre, publishedDate, reference, deadline, description, typeCampagne, TSSCOD, status
}) => {
    const navigate = useNavigate();
    // Images différentes selon le type
const getImageForTender = (TSSCOD = "") => {
  const keywordToImageMap = [
    {
      keywords: ["MED", "med", ""],
      image: pharmaProductsImg, // Image produits pharmaceutiques
    },
    {
      keywords: ["BES", "BSER"],
      image: labEquipmentImg, // Image équipements de laboratoire
    },
    {
      keywords: ["TRS", "transport"],
      image: transportImg, // Image équipements de laboratoire
    },
  ];

  for (const { keywords, image } of keywordToImageMap) {
    if (keywords.some((keyword) => keyword && TSSCOD.includes(keyword))) {
      return image;
    }
  }

  // Default image if no keywords matched
  return pharmaProductsImg;
};
  
    
    return (
    <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '12px', maxWidth: "400px", position: 'relative' }}>
      {/* Icône flottante */}
      {status === 1 && (
        <div style={{
          position: 'absolute',
          right: '-20px',
          transform: 'translateY(-50%)',
          zIndex: 1000
        }}>
          <FaExclamationCircle 
        size={50} 
        style={{
          animation: "colorChange 1s infinite",
          filter: "drop-shadow(0px 0px 5px rgba(0,0,0,0.3))"
        }}
          />
        </div>
      )}

      <style>
        {`
          @keyframes colorChange {
            0% { color: white; }
            50% { color: red }
            100% { color: white; }
          }
        `}
      </style>

      {/* Image */}
      <div style={{ height: '140px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
        <img
          src={getImageForTender(TSSCOD)}
          alt={titre}
          className="card-img-top w-100 h-100"
          style={{ objectFit: 'cover' }}
        />
  </div>

  {/* Contenu */}
  <div className="card-body d-flex flex-column text-center p-3">
    <div className="mb-1">
      <small className="fw-semibold" style={{ color: "#1FB05B", fontSize: "0.75rem" }}>
        Publié le {publishedDate}
      </small>
    </div>

    <div className="mb-2">
      <small className="text-danger fw-semibold" style={{ fontSize: "0.75rem" }}>
        Date limite : {deadline}
      </small>
      <hr className="my-2" />
    </div>

    <h6 className="card-title text-success fw-bold mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.2' }}>
      {titre}
    </h6>

    <div className="mb-2">
      <small className="text-muted fst-italic" style={{ fontSize: "0.75rem" }}>
        Référence : {reference}
      </small>
    </div>

    <p className="card-text text-muted small mb-3" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
      {description}
    </p>

    <div className="mt-auto">
      <button
        className="btn btn-success rounded-pill px-3 py-1 fw-semibold shadow-sm"
        style={{ fontSize: '0.75rem' }}
        onClick={() => {
          if (typeCampagne === "Appel d'offre ouvert") {
            navigate(`/client/tender/${id}`);
          } else if (typeCampagne === "Draft") {
            navigate(`/client/tenderDraft/${id}`);
          } 
            // else if (typeCampagne === "AOR") {
            //   navigate(`/client/tenderAOR/${id}`);
            // } 
          else {
            navigate(`/client/tender/${id}`);
          }
        }}
      >
        Consulter
      </button>
    </div>
  </div>
</div>

    );
};

export default TenderCard;