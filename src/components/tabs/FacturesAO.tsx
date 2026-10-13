import React from "react";
import { FaClipboardCheck } from "react-icons/fa";
import folder_icon from "../../assets/images/folder_img.png";
import doc_icon from "../../assets/images/doc_icon.png";

interface FacturesProps {
  // Vous pouvez ajouter des props pour les données des factures si nécessaire
}

const Factures: React.FC<FacturesProps> = () => {
  // Données statiques des factures (à remplacer par des props si nécessaire)
  const facturesByDate = [
    [
      { id: "f001", date: "10 Septembre 2025", label: "Facture 001", pdfUrl: "/docs/facture-001.pdf" },
      { id: "f002", date: "11 Septembre 2025", label: "Facture 002", pdfUrl: "/docs/facture-002.pdf" },
    ],
  ];

  return (
    <div
      className="bg-white p-3 rounded-3 shadow-sm"
      style={{ border: "1.5px solid #1FB05B", borderRadius: "16px" }}
    >
      <h5
        className="mb-4 d-flex align-items-center gap-2"
        style={{ color: "#1FB05B", fontWeight: 700 }}
      >
        <img src={folder_icon} alt="Factures" style={{ width: 26 }} />
        Factures
      </h5>

      {facturesByDate.length === 0 ? (
        <div className="text-muted text-center py-4">
          <i>Aucune facture disponible pour le moment.</i>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {facturesByDate.map((docs) => (
            <div
              className=" p-3 mb-4"
              style={{
                borderRadius: 14,
                border: "1px solid #e9f5ef",
                minHeight: "50vh",
                paddingBottom: "20vh",
              }}
            >
              <div className="documents-section">
                {docs.map((doc) => (
                  <div key={doc.id} className="document-item mb-4">
                    <div 
                      className="card shadow-sm document-card"
                      style={{ 
                        borderRadius: "12px", 
                        border: "1px solid #e8f5e8",
                        background: "linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="row align-items-center">
                          <div className="col-lg-12">
                            <div className="d-flex align-items-center mb-3">
                              <div 
                                className="document-icon me-3 d-flex align-items-center justify-content-center"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  backgroundColor: "#e8f5e8",
                                  borderRadius: "12px",
                                  border: "2px solid #1FB05B"
                                }}
                              >
                                <img
                                  src={doc_icon}
                                  alt="Document"
                                  style={{ height: 28, width: 28 }}
                                />
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1 fw-bold text-dark">{doc.label}</h6>
                                <small className="text-muted">
                                  <FaClipboardCheck className="me-1" />
                                  Date: {doc.date}
                                </small>
                              </div>
                            </div>
                            <div className="document-meta">
                              <div className="row g-2 mb-3">
                                <div className="col-md-6">
                                  <div className="p-2 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                                    <small className="text-muted d-block">Type de document</small>
                                    <span className="fw-semibold">Facture</span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="p-2 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                                    <small className="text-muted d-block">Statut</small>
                                    <span className="badge bg-success">Disponible</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                onClick={() => window.open(doc.pdfUrl, "_blank")}
                                style={{ borderRadius: "8px", fontWeight: "500" }}
                              >
                                <i className="fas fa-eye"></i>
                                Prévisualiser
                              </button>
                              <a
                                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                                href={doc.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                style={{ borderRadius: "8px", fontWeight: "500" }}
                              >
                                <i className="fas fa-download"></i>
                                Télécharger
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Factures;
