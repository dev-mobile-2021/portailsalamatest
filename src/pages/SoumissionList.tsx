import { FaCalendarAlt, FaFileAlt, FaBoxes, FaExclamationCircle } from "react-icons/fa";

interface SoumissionListProps {
  soumissions: Array<{
    id: string;
    date: string;
    ao_id: string;
    ao: {
      id: string;
      reference: string;
      datecloture: string;
      datepublication: string;
      targetpricestatus: number;
      typemarche: {
        id: string;
        designation: string;
      };
      aoarticles: Array<{
        id: string;
        article: {
          id: string;
          designation: string;
        };
      }>;
    };
  }>;
  onViewSoumission: (aoId: number) => void;
}

const SoumissionList = ({ soumissions, onViewSoumission }: SoumissionListProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Non spécifié";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatutCloture = (dateCloture: string) => {
    if (!dateCloture) return { text: "En cours", color: "#1FB05B", bgColor: "#f0fdf4" };
    
    const now = new Date();
    const cloture = new Date(dateCloture);
    
    if (now > cloture) {
      return { text: "Clôturé", color: "#dc3545", bgColor: "#fff5f5" };
    } else {
      const diffTime = cloture.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 3) {
        return { text: `${diffDays}j restant`, color: "#ff9800", bgColor: "#fff8f0" };
      }
      return { text: "En cours", color: "#1FB05B", bgColor: "#f0fdf4" };
    }
  };

  if (soumissions.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <FaFileAlt size={48} color="#cbd5e0" />
        </div>
        <h5 className="text-muted">Aucune soumission trouvée</h5>
        <p className="text-muted">Vous n'avez pas encore soumissionné à des appels d'offres.</p>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {soumissions.map((soumission) => {
        const statut = getStatutCloture(soumission.ao?.datecloture);
        
        return (
          <div key={soumission.id} className="col-12 col-md-6 col-lg-4">
            <div
              className="card h-100 shadow-sm"
              style={{
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
              }}
              onClick={() => onViewSoumission(Number(soumission.ao_id))}
            >
              {/* Icône flottante pour targetpricestatus */}
              {soumission.ao?.targetpricestatus === 1 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  zIndex: 1000
                }}>
                  <FaExclamationCircle 
                    size={40} 
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
                    50% { color: red; }
                    100% { color: white; }
                  }
                `}
              </style>

              <div className="card-body p-4">
                {/* En-tête avec type et statut */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span
                    className="badge"
                    style={{
                      backgroundColor: "#1FB05B",
                      color: "white",
                      fontSize: "11px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontWeight: "500",
                    }}
                  >
                    {soumission.ao?.typemarche?.designation || "N/A"}
                  </span>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: statut.bgColor,
                      color: statut.color,
                      fontSize: "11px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontWeight: "600",
                      border: `1px solid ${statut.color}33`,
                    }}
                  >
                    {statut.text}
                  </span>
                </div>

                {/* Référence */}
                <h5
                  className="card-title mb-3"
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#2c3e50",
                    lineHeight: "1.4",
                  }}
                >
                  {soumission.ao?.reference || "Référence non disponible"}
                </h5>

                {/* Informations */}
                <div className="mb-3" style={{ fontSize: "13px", color: "#6b7280" }}>
                  <div className="d-flex align-items-center mb-2">
                    <FaCalendarAlt
                      size={14}
                      color="#1FB05B"
                      style={{ marginRight: "8px" }}
                    />
                    <span>
                      <strong>Publication:</strong> {formatDate(soumission.ao?.datepublication)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaCalendarAlt
                      size={14}
                      color="#dc3545"
                      style={{ marginRight: "8px" }}
                    />
                    <span>
                      <strong>Clôture:</strong> {formatDate(soumission.ao?.datecloture)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaBoxes
                      size={14}
                      color="#6b7280"
                      style={{ marginRight: "8px" }}
                    />
                    <span>
                      <strong>Articles:</strong> {soumission.ao?.aoarticles?.length || 0}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaFileAlt
                      size={14}
                      color="#1FB05B"
                      style={{ marginRight: "8px" }}
                    />
                    <span>
                      <strong>Soumis le:</strong> {formatDate(soumission.date)}
                    </span>
                  </div>
                </div>

                {/* Bouton */}
                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: "#1FB05B",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "500",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#18a04b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#1FB05B";
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewSoumission(Number(soumission.ao_id));
                  }}
                >
                  Voir le tableau de suivi
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SoumissionList;
