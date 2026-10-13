import React, { useState } from "react";
import folder_icon from "../../assets/images/folder_img.png";
import doc_icon from "../../assets/images/doc_icon.png";
import ConfirmationPopup from "../ui/ConfirmationPopup";
import { Fournisseur } from "../../types/user.types";
import { useBonDeCommande } from "../../hooks/useBonDeCommande";

interface Document {
  id: string | number;
  label: string;
  pdfUrl: string;
  etat: string;
}

interface BonDeCommandeProps {
  Data: any;
  staticPurchaseOrdersByDate: Array<[string, Array<Document>]>;
  fournisseur?: Fournisseur;
}


const BonDeCommande: React.FC<BonDeCommandeProps> = ({ staticPurchaseOrdersByDate, Data, fournisseur: currentFournisseur }) => {
  const [confirmation, setConfirmation] = useState({
    isVisible: false,
    action: () => {},
    title: "",
    message: "",
  });

  // 🆕 Utilisation du hook useBonDeCommande
  const {
    bcInfo,
    loadingBc,
    errorBc,
    pdfUrl,
    validatingBc,
    rejectingBc,
    notification,
    handleValidateBc,
    handleRejectBc,
    clearNotification,
  } = useBonDeCommande({
    soumissionId: Data?.soumissionId,
    codeFournisseur: currentFournisseur?.code,
    referenceAO: Data?.tender?.reference,
  });

  const handleConfirm = () => {
    setConfirmation({
      isVisible: true,
      action: () => {
        handleValidateBc();
        setConfirmation({ ...confirmation, isVisible: false });
      },
      title: "Valider le bon de commande",
      message: `Êtes-vous sûr de vouloir valider ce bon de commande ? Cette action confirmera votre acceptation.`,
    });
  };

  const handleReject = (docId: string | number) => {
    setConfirmation({
      isVisible: true,
      action: () => {
        handleRejectBc();
        setConfirmation({ ...confirmation, isVisible: false });
      },
      title: "Rejeter le document",
      message: `Voulez-vous vraiment rejeter le document ${docId} ?`,
    });
  };

  return (
    <>
      {/* Styles CSS pour les améliorations */}
      <style>{` ...existing code... `}</style>
      
      {/* Notification de succès/erreur */}
      {notification.show && (
        <div 
          className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show position-fixed`}
          role="alert"
          style={{
            top: '20px',
            right: '20px',
            zIndex: 9999,
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div className="d-flex align-items-center">
            <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
            <strong>{notification.message}</strong>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearNotification}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="bg-white p-3 rounded-3 shadow-sm" style={{ border: "1.5px solid #1FB05B", borderRadius: "16px" }}>
        <h5 className="mb-4 d-flex align-items-center gap-2" style={{ color: "#1FB05B", fontWeight: 700 }}>
          <img src={folder_icon} alt="Bon de commande" style={{ width: 26 }} />
          Bon de commande
        </h5>

        {/* Bannière d'alerte pour contrat résilié */}
        {bcInfo && Number(bcInfo.etat) < 0 && (
          <div 
            className="alert alert-danger mb-4 d-flex align-items-center" 
            role="alert"
            style={{ 
              borderRadius: "12px", 
              border: "2px solid #dc3545",
              backgroundColor: "#f8d7da",
              padding: "16px 20px"
            }}
          >
            <div className="d-flex align-items-center">
              <i className="fas fa-exclamation-triangle me-3" style={{ fontSize: "2rem", color: "#dc3545" }}></i>
              <div>
                <h6 className="mb-1 fw-bold" style={{ color: "#721c24" }}>
                  <i className="fas fa-ban me-2"></i>
                  Contrat résilié
                </h6>
                <p className="mb-0 small" style={{ color: "#721c24" }}>
                  Ce contrat a été résilié. Aucune action n'est possible sur ce bon de commande.
                </p>
                {bcInfo.motif_resiliation && (
                  <p className="mb-0 small mt-2" style={{ color: "#721c24" }}>
                    <strong>Motif :</strong> {bcInfo.motif_resiliation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section État du contrat - toujours visible */}
        {bcInfo && (
          <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
            <div className="d-flex align-items-center flex-wrap gap-2">
              <span className="text-muted fw-semibold me-2">
                <i className="fas fa-info-circle me-1"></i>
                État du contrat :
              </span>
              
              {/* Badge état suivi (depuis l'API) */}
              {bcInfo.etat_suivi_text && (
                <span 
                  className={bcInfo.etat_suivi_badge || 'badge bg-secondary'}
                  style={{ 
                    fontSize: "0.8rem", 
                    padding: "8px 14px",
                    borderRadius: "20px",
                    color: "#333"
                  }}
                >
                  {bcInfo.etat_suivi_text}
                </span>
              )}
              
            </div>
          </div>
        )}

        {staticPurchaseOrdersByDate.length === 0 ? (
          <div className="text-muted text-center py-4">
            <i>Aucun bon de commande disponible pour le moment.</i>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {staticPurchaseOrdersByDate.map(([date, docs]) => (
              <div key={date} className="card p-3" style={{ borderRadius: 14, border: "1px solid #e9f5ef", minHeight: "40vh" }}>
                <div className="documents-section">
                  {docs.map((doc) => (
                    <div key={doc.id} className="document-item mb-4">
                      {/* Card du document principal */}
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
                            {/* Informations du document */}
                            <div className="col-lg-8 col-md-7">
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
                              
                                </div>
                                <div className="document-status d-flex flex-wrap gap-2">
                                  {/* Badge état BC */}
                                  {/* <span 
                                    className={`badge ${bcInfo?.etat_bc === 1 ? 'bg-success' : (bcInfo?.etat_bc && bcInfo.etat_bc > 1 ? 'bg-primary' : 'bg-warning')}`}
                                    style={{ 
                                      fontSize: "0.75rem", 
                                      padding: "6px 12px",
                                      borderRadius: "20px" 
                                    }}
                                  >
                                    <i className={`fas ${bcInfo?.etat_bc === 1 ? 'fa-check-circle' : (bcInfo?.etat_bc && bcInfo.etat_bc > 1 ? 'fa-check-double' : 'fa-clock')} me-1`}></i>
                                    {bcInfo?.etat_bc === 1 ? 'Disponible' : (bcInfo?.etat_bc && bcInfo.etat_bc > 1 ? 'Validé' : 'En préparation')}
                                  </span> */}
                                  
                                  {/* Badge état suivi (depuis l'API) */}
                                  {bcInfo?.etat_suivi_text && (
                                    <span 
                                      className={bcInfo.etat_suivi_badge || 'badge badge-secondary'}
                                      style={{ 
                                        fontSize: "0.75rem", 
                                        padding: "6px 12px",
                                        borderRadius: "20px" 
                                      }}
                                    >
                                      {bcInfo.etat_suivi_text}
                                    </span>
                                  )}
                                  
                              
                                </div>
                              </div>
                              {/* Informations supplémentaires */}
                              <div className="document-meta">
                                <div className="row g-2 mb-3">
                                  <div className="col-sm-6">
                                    <small className="text-muted d-block">
                                      <i className="fas fa-file-pdf text-danger me-1"></i>
                                      Format: PDF
                                    </small>
                                  </div>
                                  <div className="col-sm-6">
                                    <span 
                                      className={`badge ${
                                        bcInfo?.etat_bc === 1 ? 'bg-success' : 
                                        (bcInfo?.etat_bc && bcInfo.etat_bc > 1 ? 'bg-primary' : 
                                        (bcInfo?.etat_bc && bcInfo.etat_bc < 0 ? 'bg-danger' : 'bg-warning'))
                                      }`}
                                      style={{ 
                                        fontSize: "0.7rem", 
                                        padding: "5px 12px",
                                        borderRadius: "20px" 
                                      }}
                                    >
                                      {bcInfo?.etat_bc === 1
                                        ? 'Disponible' 
                                        : bcInfo?.etat_bc === -1
                                        ? 'Contrat résilié'
                                        : bcInfo?.etat_bc === -2
                                        ? 'Bon de commande rejeté'
                                        : (bcInfo?.etat_bc && bcInfo.etat_bc > 1 ? 'Validé' : 'En cours de traitement')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {/* Actions principales */}
                              <div className="d-flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                  onClick={() => {
                                    const urlToOpen = pdfUrl || doc.pdfUrl;
                                    console.log("📄 [BonDeCommande] Ouverture du PDF:", urlToOpen);
                                    window.open(urlToOpen, "_blank");
                                  }}
                                  style={{ borderRadius: "8px", fontWeight: "500" }}
                                  disabled={ !bcInfo || bcInfo.etat_bc < 1}
                                >
                                  <i className="fas fa-eye"></i>
                                  Prévisualiser
                                </button>
                              </div>
                            </div>
                            {/* Actions de validation - Affichées uniquement si etat_bc === 1 */}
                            {bcInfo?.etat_bc === 1 && (
                              <div className="col-lg-4 col-md-5">
                                <div className="validation-section">
                                  <h6 className="text-muted mb-3 fw-semibold">
                                    <i className="fas fa-tasks me-2"></i>
                                    Actions requises
                                  </h6>
                                  <div className="d-grid gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                                      onClick={() => handleConfirm()}
                                      style={{ 
                                        borderRadius: "10px", 
                                        fontWeight: "600",
                                        padding: "12px 20px"
                                      }}
                                      disabled={validatingBc}
                                    >
                                      {validatingBc ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                          Validation en cours...
                                        </>
                                      ) : (
                                        <>
                                          <i className="fas fa-check-circle"></i>
                                          Valider le BC
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
                                      onClick={() => handleReject(doc.id)}
                                      style={{ 
                                        borderRadius: "10px", 
                                        fontWeight: "500",
                                        padding: "8px 16px"
                                      }}
                                      disabled={validatingBc || rejectingBc}
                                    >
                                      {rejectingBc ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                          Rejet en cours...
                                        </>
                                      ) : (
                                        <>
                                          <i className="fas fa-times-circle"></i>
                                          Rejeter
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  {/* Statut de traitement */}
                                  <div 
                                    className="mt-3 p-3 rounded-3" 
                                    style={{ backgroundColor: '#d1f2eb' }}
                                  >
                                    <div className="d-flex flex-column gap-1">
                                      <div className="d-flex align-items-center">
                                        <i className="fas fa-check-circle text-success me-2"></i>
                                        <small className="text-success fw-semibold">
                                          {bcInfo?.etat_text}
                                        </small>
                                      </div>
                                      <small className="text-muted" style={{ fontSize: "0.75rem", marginLeft: "24px" }}>
                                        Cliquez sur "Valider le BC" pour confirmer votre acceptation
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Statut de traitement - Affiché uniquement si etat_bc !== 1 */}
                            {bcInfo?.etat_bc !== 1 && (
                              <div className="col-lg-4 col-md-5">
                                <div className="validation-section">
                                  <h6 className="text-muted mb-3 fw-semibold">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Statut
                                  </h6>
                                  <div 
                                    className="p-3 rounded-3" 
                                    style={{ 
                                      backgroundColor: bcInfo?.etat_bc && bcInfo.etat_bc > 1 ? '#e3f2fd' : 
                                        (bcInfo?.etat_bc && bcInfo.etat_bc < 0 ? '#f8d7da' : '#fff3cd')
                                    }}
                                  >
                                    <div className="d-flex flex-column gap-1">
                                      <div className="d-flex align-items-center">
                                        <i 
                                          className={`fas ${
                                            bcInfo?.etat_bc && bcInfo.etat_bc > 1 ? 'fa-check-double text-primary' : 
                                            (bcInfo?.etat_bc && bcInfo.etat_bc < 0 ? 'fa-times-circle text-danger' : 'fa-clock text-warning')
                                          } me-2`}
                                        ></i>
                                        <small 
                                          className={`${
                                            bcInfo?.etat_bc && bcInfo.etat_bc > 1 ? 'text-primary' : 
                                            (bcInfo?.etat_bc && bcInfo.etat_bc < 0 ? 'text-danger' : 'text-warning')
                                          } fw-semibold`}
                                        >
                                          {bcInfo?.etat_text}
                                        </small>
                                      </div>
                                      {(!bcInfo?.etat_bc || (bcInfo.etat_bc < 1 && bcInfo.etat_bc >= 0)) && (
                                        <small className="text-muted" style={{ fontSize: "0.75rem", marginLeft: "24px" }}>
                                          Le bon de commande sera bientôt disponible pour validation
                                        </small>
                                      )}
                                      {bcInfo?.etat_bc === -1 && (
                                        <small className="text-danger" style={{ fontSize: "0.75rem", marginLeft: "24px" }}>
                                          Le contrat a été résilié. Action impossible.
                                        </small>
                                      )}
                                      {bcInfo?.etat_bc === -2 && (
                                        <small className="text-danger" style={{ fontSize: "0.75rem", marginLeft: "24px" }}>
                                          Le bon de commande a été rejeté.
                                        </small>
                                      )}
                                      {bcInfo?.etat_bc && bcInfo.etat_bc > 1 && (
                                        <small className="text-muted" style={{ fontSize: "0.75rem", marginLeft: "24px" }}>
                                          Le bon de commande a été validé
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Section Accompte améliorée dynamique */}
                <div className="mt-4">
                  <div className="card shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e8f5e8", background: "linear-gradient(135deg, #f8fff8 0%, #f0f9f0 100%)" }}>
                    <div className="card-header" style={{ backgroundColor: "#1FB05B", borderRadius: "12px 12px 0 0", border: "none" }}>
                      <h6 className="mb-0 d-flex align-items-center gap-2 text-white">
                        <i className="fas fa-money-bill-wave"></i>
                        Accompte
                      </h6>
                    </div>
                    <div className="card-body p-4">
                      {loadingBc && (
                        <div className="d-flex align-items-center justify-content-center py-4">
                          <span className="spinner-border spinner-border-sm text-success me-2" role="status" aria-hidden="true"></span>
                          <span className="text-muted">Chargement des informations d'acompte...</span>
                        </div>
                      )}
                      {errorBc && <div className="alert alert-danger mb-0"><i className="fas fa-exclamation-circle me-2"></i>{errorBc}</div>}
                      {!loadingBc && !errorBc && !bcInfo && (
                        <div className="text-center py-4">
                          <i className="fas fa-info-circle text-muted mb-2" style={{ fontSize: "2rem" }}></i>
                          <p className="text-muted mb-0">Aucune information d'acompte disponible pour le moment.</p>
                        </div>
                      )}
                      {!loadingBc && bcInfo && (
                        <div className="row g-4">
                          {/* Total BC */}
                          <div className="col-lg-4 col-md-6">
                            <div className="info-card h-100 p-3 rounded-3" style={{ backgroundColor: "#ffffff", border: "2px solid #e1f5fe", boxShadow: "0 2px 8px rgba(31, 176, 91, 0.1)", transition: "transform 0.2s ease" }}>
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-file-invoice-dollar text-primary me-2" style={{ fontSize: "1.2rem" }}></i>
                                <span className="text-muted small fw-semibold">TOTAL BC</span>
                              </div>
                              <div className="value-display">
                                <span className="h4 fw-bold text-primary mb-0">
                                  {bcInfo.totalbc != null ? bcInfo.totalbc.toLocaleString('fr-FR') : '--'} 
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Pourcentage Accompte */}
                          <div className="col-lg-4 col-md-6">
                            <div className="info-card h-100 p-3 rounded-3" style={{ backgroundColor: "#ffffff", border: "2px solid #fff3e0", boxShadow: "0 2px 8px rgba(255, 152, 0, 0.1)", transition: "transform 0.2s ease" }}>
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-percentage text-warning me-2" style={{ fontSize: "1.2rem" }}></i>
                                <span className="text-muted small fw-semibold">POURCENTAGE</span>
                              </div>
                              <div className="value-display d-flex align-items-center">
                                <span className="h4 fw-bold text-warning mb-0 me-2">{bcInfo.acompte ?? 0}%</span>
                                <div className="progress flex-grow-1" style={{ height: "8px" }}>
                                  <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${bcInfo.acompte ?? 0}%` }} aria-valuenow={bcInfo.acompte ?? 0} aria-valuemin={0} aria-valuemax={100}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Montant Accompte */}
                          <div className="col-lg-4 col-md-6">
                            <div className="info-card h-100 p-3 rounded-3" style={{ backgroundColor: "#ffffff", border: "2px solid #e8f5e8", boxShadow: "0 2px 8px rgba(31, 176, 91, 0.15)", transition: "transform 0.2s ease" }}>
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-calculator text-success me-2" style={{ fontSize: "1.2rem" }}></i>
                                <span className="text-muted small fw-semibold">MONTANT CALCULÉ</span>
                              </div>
                              <div className="value-display">
                                <span className="h4 fw-bold text-success mb-0">
                                  {bcInfo.mntacompte != null ? bcInfo.mntacompte.toLocaleString('fr-FR') : '--'} 
                                </span>
                                <small className="text-muted d-block">{bcInfo.acompte ?? 0}% de {bcInfo.totalbc != null ? bcInfo.totalbc.toLocaleString('fr-FR') : '--'}</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmationPopup
          isVisible={confirmation.isVisible}
          title={confirmation.title}
          message={confirmation.message}
          onConfirm={confirmation.action}
          onCancel={() => setConfirmation({ ...confirmation, isVisible: false })}
        />
      </div>
    </>
  );
};

export default BonDeCommande;
