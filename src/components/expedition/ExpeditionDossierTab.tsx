import React, { useState } from "react";
import { Mission } from "../../types/Mission.types";
import { FaRetweet } from "react-icons/fa";

// Type simplifié pour la liste des chauffeurs disponibles
interface ChauffeurOption {
  id: string;
  nom: string;
  telephone?: string;
  email?: string;
}

// Type simplifié pour la liste des véhicules disponibles
interface VehiculeOption {
  id: string;
  matricule: string;
  marque: string;
  tonnage: number;
  tonnage_designation?: string;
  typevehicule?: string;
}

interface ExpeditionDossierTabProps {
  mission: Mission;
  formatDate: (dateStr: string) => string;

  downloadingPdf: boolean;
  onDownloadBC: () => void;

  acceptingMission: boolean;
  onAcceptMission: () => void;

  rejectingMission?: boolean;
  onRejectMission?: () => void;

  downloadingOM: boolean;
  onDownloadOM: () => void;
  
  onDownloadPVRD: () => void;
  onDownloadBonRetour: () => void;
  onDownloadFichePointage: () => void;
  onDownloadBL: () => void;

  // Props pour le changement de chauffeur
  chauffeursDisponibles: ChauffeurOption[];
  loadingChauffeurs?: boolean;
  onChangeChauffeur?: (chauffeurId: string) => void;

  // Props pour le changement de véhicule
  vehiculesDisponibles: VehiculeOption[];
  loadingVehicules?: boolean;
  onChangeVehicule?: (vehiculeId: string) => void;

  showSuccess: (title: string, message: string) => void;
}

const ExpeditionDossierTab: React.FC<ExpeditionDossierTabProps> = ({
  mission,
  formatDate,
  downloadingPdf,
  onDownloadBC,
  acceptingMission,
  onAcceptMission,
  rejectingMission,
  onRejectMission,
  downloadingOM,
  onDownloadOM,
  onDownloadPVRD,
  onDownloadBonRetour,
  onDownloadFichePointage,
  onDownloadBL,
  chauffeursDisponibles,
  loadingChauffeurs,
  onChangeChauffeur,
  vehiculesDisponibles,
  loadingVehicules,
  onChangeVehicule,
  showSuccess,
}) => {
  // État local pour afficher/masquer le dropdown de changement de chauffeur
  const [showChauffeurDropdown, setShowChauffeurDropdown] = useState(false);
  // État local pour afficher/masquer le dropdown de changement de véhicule
  const [showVehiculeDropdown, setShowVehiculeDropdown] = useState(false);

  return (
    <>
      {/* Actions */}
      <div
        className="card mb-4"
        style={{
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div className="card-body d-flex gap-3 flex-wrap align-items-center" style={{ padding: "16px 24px" }}>
          <button
            className="btn"
            onClick={onDownloadBC}
            disabled={downloadingPdf}
            style={{
              backgroundColor: "#1FB05B",
              color: "white",
              borderRadius: "8px",
              padding: "10px 24px",
              fontWeight: 500,
              border: "none",
            }}
          >
            {downloadingPdf ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Téléchargement...
              </>
            ) : (
              "Télécharger BC"
            )}
          </button>

          {/* Affichage selon l'état de validation_fournisseur */}
          {mission.validation_fournisseur === 99 ? (
            // Mission refusée - Afficher un badge d'état
            <div
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                borderRadius: "8px",
                padding: "10px 24px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Mission refusée
            </div>
          ) : (
            <>
              {/* Bouton Accepter la mission */}
              <button
                className="btn"
                onClick={onAcceptMission}
                disabled={acceptingMission || mission.validation_fournisseur === 1}
                style={{
                  backgroundColor: mission.validation_fournisseur === 1 ? "#28a745" : "#007bff",
                  color: "white",
                  borderRadius: "8px",
                  padding: "10px 24px",
                  fontWeight: 500,
                  border: "none",
                  cursor: mission.validation_fournisseur === 1 ? "default" : acceptingMission ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {acceptingMission ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    Traitement...
                  </>
                ) : mission.validation_fournisseur === 1 ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Mission acceptée
                  </>
                ) : (
                  <>J'accepte cette mission</>
                )}
              </button>

              {/* Bouton Rejeter la mission - visible seulement si pas encore validé */}
              {mission.validation_fournisseur === 0 && onRejectMission && (
                <button
                  className="btn"
                  onClick={onRejectMission}
                  disabled={rejectingMission || acceptingMission}
                  style={{
                    backgroundColor: "transparent",
                    color: "#dc3545",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    fontWeight: 500,
                    border: "1px solid #dc3545",
                    cursor: rejectingMission ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {rejectingMission ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Traitement...
                    </>
                  ) : (
                    <>Refuser cette mission</>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Colonne gauche */}
        <div className="col-lg-6">
          {/* Informations */}
          <div
            className="card mb-4"
            style={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="card-header"
              style={{ backgroundColor: "white", borderBottom: "1px solid #e9ecef", padding: "16px 20px" }}
            >
              <h6 style={{ margin: 0, fontWeight: 600 }}>Informations</h6>
            </div>
            <div className="card-body" style={{ padding: "20px" }}>
              <div className="row g-4">
                <div className="col-6">
                  <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>Date d'expédition</div>
                  <div style={{ fontWeight: 500, fontSize: "15px" }}>{formatDate(mission.date_expedition)}</div>
                </div>
                <div className="col-6">
                  <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>Axe</div>
                  <div style={{ fontWeight: 500, fontSize: "15px" }}>{mission.axe.designation}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Véhicule & Chauffeur */}
          <div
            className="card mb-4"
            style={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="card-header"
              style={{ backgroundColor: "white", borderBottom: "1px solid #e9ecef", padding: "16px 20px" }}
            >
              <h6 style={{ margin: 0, fontWeight: 600 }}>Véhicule & Chauffeur</h6>
            </div>
            <div className="card-body" style={{ padding: "20px" }}>
              <div className="row g-4">
                <div className="col-6">
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {/* Icône Switch pour changer de véhicule */}
                    <span
                      title="Changer de véhicule"
                      onClick={() => setShowVehiculeDropdown(!showVehiculeDropdown)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        cursor: "pointer",
                        fontSize: "16px",
                        opacity: showVehiculeDropdown ? 1 : 0.6,
                        transition: "opacity 0.2s ease",
                      }}
                    >
                      <FaRetweet />
                    </span>

                    {/* Dropdown liste des véhicules */}
                    {showVehiculeDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "40px",
                          right: "8px",
                          width: "250px",
                          backgroundColor: "white",
                          borderRadius: "8px",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                          zIndex: 100,
                          maxHeight: "200px",
                          overflowY: "auto",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 12px",
                            borderBottom: "1px solid #e9ecef",
                            backgroundColor: "#f8f9fa",
                            fontWeight: 600,
                            fontSize: "12px",
                            color: "#6c757d",
                          }}
                        >
                          Sélectionner un véhicule
                        </div>
                        {loadingVehicules ? (
                          <div style={{ padding: "16px", textAlign: "center" }}>
                            <span className="spinner-border spinner-border-sm" />
                          </div>
                        ) : vehiculesDisponibles.filter(v => v.id !== mission.vehicule?.id).length === 0 ? (
                          <div style={{ padding: "16px", textAlign: "center", color: "#6c757d", fontSize: "13px" }}>
                            Aucun véhicule conforme au tonnage requis
                          </div>
                        ) : (
                          vehiculesDisponibles.filter(v => v.id !== mission.vehicule?.id).map((vehicule) => (
                            <div
                              key={vehicule.id}
                              onClick={() => {
                                if (onChangeVehicule) {
                                  onChangeVehicule(vehicule.id);
                                  setShowVehiculeDropdown(false);
                                  showSuccess("Véhicule modifié", `${vehicule.matricule} a été assigné à cette mission.`);
                                }
                              }}
                              style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f0f0f0",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#f8f9fa";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                              }}
                            >
                              <div style={{ fontWeight: 500, fontSize: "13px", color: "#1FB05B" }}>{vehicule.matricule}</div>
                              <div style={{ fontSize: "11px", color: "#6c757d" }}>
                                {vehicule.marque} - {vehicule.tonnage}T
                                {vehicule.typevehicule && ` (${vehicule.typevehicule})`}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "8px" }}>Véhicule</div>
                    <div style={{ fontWeight: 600, fontSize: "16px", color: "#1FB05B" }}>{mission.vehicule.matricule}</div>
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>
                      {mission.vehicule.marque} - {mission.vehicule.tonnage}T
                    </div>
                    
                    {/* Alerte minimaliste si un remplacement de véhicule est en attente */}
                    {mission.remplacements && mission.remplacements.length > 0 && (
                      <div 
                        style={{ 
                          marginTop: "10px", 
                          padding: "8px 10px", 
                          backgroundColor: "#f8f9fa", 
                          borderRadius: "6px",
                          borderLeft: `3px solid ${mission.remplacements.some(r => r.est_en_attente) ? "#ffc107" : mission.remplacements.some(r => r.statut === 1) ? "#28a745" : "#dc3545"}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "12px", color: "#6c757d" }}>⟳</span>
                            <span style={{ fontSize: "12px", color: "#495057" }}>
                              {mission.remplacements.length} demande{mission.remplacements.length > 1 ? "s" : ""} de remplacement
                            </span>
                          </div>
                          {/* Badge du dernier statut */}
                          {(() => {
                            const lastRemp = mission.remplacements[0];
                            return (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  backgroundColor: lastRemp.est_en_attente ? "#fff3cd" : lastRemp.statut === 1 ? "#d4edda" : "#f8d7da",
                                  color: lastRemp.est_en_attente ? "#856404" : lastRemp.statut === 1 ? "#155724" : "#721c24",
                                }}
                              >
                                {lastRemp.statut_text || (lastRemp.est_en_attente ? "En attente" : "Traité")}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "8px" }}>Convoyeur</div>
                    {mission.convoyeur && (
                      <>
                        <div style={{ fontWeight: 600, fontSize: "16px", color: "#1FB05B" }}>{mission.convoyeur.nom}</div>
                        <div style={{ fontSize: "13px", color: "#6c757d" }}>{mission.convoyeur.adresse}</div>
                        <div style={{ fontSize: "13px", color: "#6c757d" }}>{mission.convoyeur.telephone}</div>
                      </>
                    )}
                    {!mission.convoyeur && (
                      <div style={{ fontSize: "13px", color: "#6c757d", fontWeight: "bold" }}>Convoyeur non assigné</div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {/* Icône Switch pour changer de chauffeur */}
                    <span
                      title="Changer de chauffeur"
                      onClick={() => setShowChauffeurDropdown(!showChauffeurDropdown)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        cursor: "pointer",
                        fontSize: "16px",
                        opacity: showChauffeurDropdown ? 1 : 0.6,
                        transition: "opacity 0.2s ease",
                      }}
                    >
                      <FaRetweet />
                    </span>

                    {/* Dropdown liste des chauffeurs */}
                    {showChauffeurDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "40px",
                          right: "8px",
                          width: "220px",
                          backgroundColor: "white",
                          borderRadius: "8px",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                          zIndex: 100,
                          maxHeight: "200px",
                          overflowY: "auto",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 12px",
                            borderBottom: "1px solid #e9ecef",
                            backgroundColor: "#f8f9fa",
                            fontWeight: 600,
                            fontSize: "12px",
                            color: "#6c757d",
                          }}
                        >
                          Sélectionner un chauffeur
                        </div>
                        {loadingChauffeurs ? (
                          <div style={{ padding: "16px", textAlign: "center" }}>
                            <span className="spinner-border spinner-border-sm" />
                          </div>
                        ) : chauffeursDisponibles.length === 0 ? (
                          <div style={{ padding: "16px", textAlign: "center", color: "#6c757d", fontSize: "13px" }}>
                            Aucun chauffeur disponible
                          </div>
                        ) : (
                          chauffeursDisponibles.map((chauffeur) => (
                            <div
                              key={chauffeur.id}
                              onClick={() => {
                                if (onChangeChauffeur) {
                                  onChangeChauffeur(chauffeur.id);
                                  setShowChauffeurDropdown(false);
                                  showSuccess("Chauffeur modifié", `${chauffeur.nom} a été assigné à cette mission.`);
                                }
                              }}
                              style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f0f0f0",
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#f8f9fa";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                              }}
                            >
                              <div style={{ fontWeight: 500, fontSize: "13px" }}>{chauffeur.nom}</div>
                              {chauffeur.telephone && (
                                <div style={{ fontSize: "11px", color: "#6c757d" }}>{chauffeur.telephone}</div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "8px" }}>Chauffeur</div>
                    <div style={{ fontWeight: 600, fontSize: "16px" }}>{mission.chauffeur.nom}</div>
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>{mission.chauffeur.telephone}</div>
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>{mission.chauffeur.email}</div>
                    <div className="d-flex gap-2 mt-3 flex-wrap">
                      <button
                        className="btn btn-sm flex-grow-1"
                        onClick={onDownloadOM}
                        disabled={downloadingOM || !mission.ordremission_disponible}
                        title={!mission.ordremission_disponible ? "Document non disponible" : "Télécharger l'Ordre de Mission"}
                        style={{
                          backgroundColor: mission.ordremission_disponible ? "#1FB05B" : "#ccc",
                          color: "white",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontWeight: 500,
                          fontSize: "12px",
                          border: "none",
                          cursor: !mission.ordremission_disponible ? "not-allowed" : "pointer",
                          opacity: !mission.ordremission_disponible ? 0.6 : 1,
                        }}
                      >
                        {downloadingOM ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            OM...
                          </>
                        ) : (
                          "Télécharger OM"
                        )}
                      </button>
                      
                      <button
                        className="btn btn-sm flex-grow-1"
                        onClick={onDownloadFichePointage}
                        disabled={!mission.fiche_pointage_disponible}
                        title={!mission.fiche_pointage_disponible ? "Document non disponible" : "Télécharger la Fiche de Pointage"}
                        style={{
                          backgroundColor: mission.fiche_pointage_disponible ? "#6c757d" : "#ccc",
                          color: "white",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontWeight: 500,
                          fontSize: "12px",
                          border: "none",
                          cursor: !mission.fiche_pointage_disponible ? "not-allowed" : "pointer",
                          opacity: !mission.fiche_pointage_disponible ? 0.6 : 1,
                        }}
                      >
                        Fiche Pointage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="col-lg-6">
          {mission.validation_fournisseur === 1 ? (
            <>
              {/* Chargement */}
              <div
                className="card mb-4"
                style={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="card-header"
                  style={{ backgroundColor: "white", borderBottom: "1px solid #e9ecef", padding: "16px 20px" }}
                >
                  <h6 style={{ margin: 0, fontWeight: 600 }}>Chargement</h6>
                </div>
                <div className="card-body" style={{ padding: "20px" }}>
                  <div className="row g-3 mb-4">
                    <div className="col-4 text-center">
                      <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>Tonnage</div>
                      <div style={{ fontWeight: 700, fontSize: "20px", color: "#1FB05B" }}>{mission.tonnage_affecte} T</div>
                    </div>
                    <div className="col-4 text-center">
                      <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>Volume</div>
                      <div style={{ fontWeight: 600, fontSize: "20px" }}>{mission.volume_affecte} m³</div>
                    </div>
                    <div className="col-4 text-center">
                      <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>Capacité</div>
                      <div style={{ fontWeight: 600, fontSize: "20px" }}>{mission.vehicule.tonnage} T</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ fontSize: "13px", color: "#6c757d" }}>Remplissage Tonnage</span>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{mission.pourcentage_remplissage_tonnage}%</span>
                    </div>
                    <div className="progress" style={{ height: "10px", borderRadius: "5px", backgroundColor: "#e9ecef" }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${mission.pourcentage_remplissage_tonnage}%`,
                          backgroundColor: "#1FB05B",
                          borderRadius: "5px",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ fontSize: "13px", color: "#6c757d" }}>Remplissage Volume</span>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{mission.pourcentage_remplissage_volume}%</span>
                    </div>
                    <div className="progress" style={{ height: "10px", borderRadius: "5px", backgroundColor: "#e9ecef" }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${mission.pourcentage_remplissage_volume}%`,
                          backgroundColor: "#17a2b8",
                          borderRadius: "5px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clients */}
              <div
                className="card"
                style={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="card-header d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: "white", borderBottom: "1px solid #e9ecef", padding: "16px 20px" }}
                >
                  <h6 style={{ margin: 0, fontWeight: 600 }}>Clients à livrer</h6>
                  <span
                    style={{
                      backgroundColor: "#1FB05B15",
                      color: "#1FB05B",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {mission.clients.length}
                  </span>
                </div>
                <div className="card-body p-0">
                  {mission.clients.map((client, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "14px 20px",
                        borderBottom: idx < mission.clients.length - 1 ? "1px solid #e9ecef" : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <span
                          style={{
                            backgroundColor: "#f8f9fa",
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "12px",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#6c757d",
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span style={{ fontWeight: 500,fontSize: "13px" }}>{client.designation}</span>
                      </div>
                      <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                        {/* Bouton pour télécharger le BL */}
                        <button
                          type="button"
                          title={!mission.bl_transporteur_disponible ? "Document non disponible" : "Télécharger le Bon de Livraison"}
                          onClick={onDownloadBL}
                          disabled={!mission.bl_transporteur_disponible}
                          style={{
                            backgroundColor: "transparent",
                            border: mission.bl_transporteur_disponible ? "1px solid #007bff" : "1px solid #ccc",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            cursor: !mission.bl_transporteur_disponible ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            color: mission.bl_transporteur_disponible ? "#007bff" : "#999",
                            transition: "all 0.2s ease",
                            opacity: !mission.bl_transporteur_disponible ? 0.6 : 1,
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>BL</span>
                        </button>

                        {/* Bouton pour télécharger le PVRD */}
                        <button
                          type="button"
                          title={!mission.pvrd_chauffeur_disponible ? "Document non disponible" : "Télécharger le PVRD"}
                          onClick={onDownloadPVRD}
                          disabled={!mission.pvrd_chauffeur_disponible}
                          style={{
                            backgroundColor: "transparent",
                            border: mission.pvrd_chauffeur_disponible ? "1px solid #007bff" : "1px solid #ccc",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            cursor: !mission.pvrd_chauffeur_disponible ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            color: mission.pvrd_chauffeur_disponible ? "#007bff" : "#999",
                            transition: "all 0.2s ease",
                            opacity: !mission.pvrd_chauffeur_disponible ? 0.6 : 1,
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>PVRD</span>
                        </button>

                        {/* Bouton pour télécharger le Bon de retour */}
                        <button
                          type="button"
                          title={!mission.bon_retour_chauffeur_disponible ? "Document non disponible" : "Télécharger le Bon de retour"}
                          onClick={onDownloadBonRetour}
                          disabled={!mission.bon_retour_chauffeur_disponible}
                          style={{
                            backgroundColor: "transparent",
                            border: mission.bon_retour_chauffeur_disponible ? "1px solid #007bff" : "1px solid #ccc",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            cursor: !mission.bon_retour_chauffeur_disponible ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            color: mission.bon_retour_chauffeur_disponible ? "#007bff" : "#999",
                            transition: "all 0.2s ease",
                            opacity: !mission.bon_retour_chauffeur_disponible ? 0.6 : 1,
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>Retour</span>
                        </button>

                        <span style={{ color: "#1FB05B", fontWeight: 600 }}>{client.tonnage_affecte} T</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Message si mission non acceptée
            <div
              className="card"
              style={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div className="card-body text-center" style={{ padding: "40px 20px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6c757d"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h6 style={{ fontWeight: 600, color: "#495057", marginBottom: "8px" }}>
                  Contenu verrouillé
                </h6>
                <p style={{ color: "#6c757d", fontSize: "14px", marginBottom: "16px" }}>
                  Les détails du chargement et la liste des clients seront visibles après avoir accepté cette mission.
                </p>
                {mission.validation_fournisseur === 99 && (
                  <div
                    style={{
                      backgroundColor: "#f8d7da",
                      color: "#721c24",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    Cette mission a été refusée
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpeditionDossierTab;
