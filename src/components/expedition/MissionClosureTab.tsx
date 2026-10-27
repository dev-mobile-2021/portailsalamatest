import React from "react";
import { LivraisonClient, Mission } from "../../types/Mission.types";

// URL de base pour les fichiers uploadés
const BASE_URL = "https://backsignup.h-tsoft.com";

interface MissionClosureTabProps {
  mission: Mission;

  completedCount: number;
  totalClients: number;
  progressPercent: number;

  livraisons: Record<string, LivraisonClient>;
  updateLivraison: (key: string, field: keyof LivraisonClient, value: any) => void;

  submitting: boolean;
  onBackToDetails: () => void;
  onSubmit: (clientKey: string) => void;
}

const MissionClosureTab: React.FC<MissionClosureTabProps> = ({
  mission,
  completedCount,
  totalClients,
  progressPercent,
  livraisons,
  updateLivraison,
  submitting,
  onSubmit,
}) => {
  return (
    <>
      {/* Progress Bar */}
      <div
        className="card mb-4"
        style={{
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div className="card-body" style={{ padding: "16px 24px" }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span style={{ fontSize: "14px", fontWeight: 500 }}>Progression de la clôture</span>
            <span style={{ fontSize: "14px", color: "#6c757d" }}>
              {completedCount} / {totalClients} clients complétés
            </span>
          </div>
          <div className="progress" style={{ height: "8px", borderRadius: "4px", backgroundColor: "#e9ecef" }}>
            <div
              className="progress-bar"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? "#28a745" : "#1FB05B",
                borderRadius: "4px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Preuves de livraison */}
      <div
        className="card mb-4"
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
          <h6 style={{ margin: 0, fontWeight: 600 }}>Preuves de livraison</h6>
          <span
            style={{
              backgroundColor: completedCount === totalClients ? "#28a74515" : "#ffc10715",
              color: completedCount === totalClients ? "#28a745" : "#856404",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {completedCount === totalClients ? "Complet" : `${totalClients - completedCount} restant(s)`}
          </span>
        </div>
        <div className="card-body" style={{ padding: "16px 20px" }}>
          {mission.clients.map((client, idx) => {
            const key = `${idx}`;
            const livraison = livraisons[key] || {
              date: "",
              heure: "",
              bl_signe: null,
              pvrd_signe: null,
              bon_retour_signe: null,
              fiche_pointage_signe: null,
              client_designation: client.designation,
            };
            
            // Vérifier si le client est clôturé via l'API (statut_livraison = 1 = Livré)
            const isClosedByApi = client.statut_livraison === 1;
            
            // Vérifier si les documents ont été uploadés via les URLs de l'API
            const hasBlSigne = !!client.url_bl_signe;
            const hasPvrd = !!client.url_pvrd;
            const hasBonRetour = !!client.url_bon_retour;
            const hasFichePointage = !!client.url_fiche_pointage;
            const apiComplete = hasBlSigne && hasPvrd && hasBonRetour && hasFichePointage;
            
            // Vérifier les fichiers locaux (en cours de sélection par l'utilisateur)
            const localComplete =
              livraison.bl_signe &&
              livraison.pvrd_signe &&
              livraison.bon_retour_signe &&
              livraison.fiche_pointage_signe;
            
            // Considérer comme complet si clôturé par API ou si tous les documents sont uploadés
            const isComplete = isClosedByApi || apiComplete || localComplete;

            return (
              <div
                key={key}
                className="mb-4"
                style={{
                  backgroundColor: isComplete ? "#f8fff8" : "#fff",
                  border: `1px solid ${isComplete ? "#28a745" : "#dee2e6"}`,
                  borderLeft: `4px solid ${isComplete ? "#28a745" : client.statut_livraison === 99 ? "#dc3545" : client.statut_livraison === 2 ? "#ffc107" : "#6c757d"}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: isComplete ? "0 2px 8px rgba(40, 167, 69, 0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* En-tête du client */}
                <div
                  style={{
                    padding: "16px 20px",
                    backgroundColor: isComplete ? "#f0fff4" : "#fafafa",
                    borderBottom: `1px solid ${isComplete ? "#c3e6cb" : "#e9ecef"}`,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center">
                      {/* Badge numéro/check */}
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: isComplete ? "#28a745" : "#6c757d",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "14px",
                          fontSize: isComplete ? "16px" : "14px",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {isComplete ? "✓" : idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "15px", color: "#212529" }}>
                          {client.designation}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6c757d", marginTop: "2px" }}>
                          <span style={{ fontWeight: 500 }}>{client.tonnage_affecte} T</span>
                          {client.volume_affecte && <span> • {client.volume_affecte} m³</span>}
                          {client.codelivraison && (
                            <span style={{ 
                              marginLeft: "10px", 
                              backgroundColor: "#e9ecef", 
                              padding: "2px 8px", 
                              borderRadius: "4px",
                              fontSize: "11px"
                            }}>
                              {client.codelivraison}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Statut à droite */}
                    <div className="text-end">
                      {client.statut_livraison_text ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: client.statut_livraison === 1 ? "#d4edda" : client.statut_livraison === 2 ? "#fff3cd" : client.statut_livraison === 99 ? "#f8d7da" : "#e9ecef",
                            color: client.statut_livraison === 1 ? "#155724" : client.statut_livraison === 2 ? "#856404" : client.statut_livraison === 99 ? "#721c24" : "#495057",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {client.statut_livraison === 1 && "✓"}
                          {client.statut_livraison === 99 && "✗"}
                          {client.statut_livraison === 2 && "⚠"}
                          {client.statut_livraison_text}
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            backgroundColor: "#e9ecef",
                            color: "#495057",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          En attente
                        </span>
                      )}
                      {client.date_cloture_livraison && (
                        <div style={{ fontSize: "11px", color: "#6c757d", marginTop: "6px" }}>
                          Clôturé le {client.date_cloture_livraison}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Corps du client */}
                <div style={{ padding: "16px 20px" }}>
                  {/* Commentaire si existant */}
                  {client.commentaire_livraison && (
                    <div
                      style={{
                        backgroundColor: isComplete ? "#e8f5e9" : "#fff8e1",
                        border: `1px solid ${isComplete ? "#c8e6c9" : "#ffe082"}`,
                        borderRadius: "8px",
                        padding: "12px 14px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        color: "#495057",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#6c757d" }}>Note:</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "11px", color: "#6c757d", marginBottom: "2px" }}>
                          Commentaire
                        </div>
                        {client.commentaire_livraison}
                      </div>
                    </div>
                  )}

                  {/* Zone formulaire - Visible seulement si non clôturé */}
                  {isClosedByApi ? (
                    <div 
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        backgroundColor: "#f0fff4",
                        borderRadius: "8px",
                        border: "1px dashed #28a745",
                      }}
                    >
                      <div style={{ fontSize: "18px", marginBottom: "8px", color: "#28a745" }}>✓</div>
                      <div style={{ fontWeight: 600, color: "#28a745", fontSize: "14px" }}>
                        Livraison clôturée
                      </div>
                      <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px" }}>
                        Ce client a été livré avec succès
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Zone de formulaire pour upload des documents */}
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label style={{ fontSize: "12px", color: "#6c757d", display: "block", marginBottom: "4px" }}>
                            Bon de livraison signé (PDF)
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".pdf"
                            onChange={(e) => updateLivraison(key, "bl_signe", e.target.files?.[0] || null)}
                            style={{ borderRadius: "8px", fontSize: "14px" }}
                            disabled={isClosedByApi || hasBlSigne}
                          />
                          {hasBlSigne ? (
                            <a 
                              href={`${BASE_URL}${client.url_bl_signe}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ marginTop: "4px", fontSize: "12px", color: "#28a745", display: "block",textDecoration: "underline" }}
                            >
                              ✓ Document uploadé - Voir
                            </a>
                          ) : livraison.bl_signe && (
                            <div style={{ marginTop: "4px", fontSize: "12px", color: "#28a745" }}>{livraison.bl_signe.name}</div>
                          )}
                        </div>

                        <div className="col-md-3">
                          <label style={{ fontSize: "12px", color: "#6c757d", display: "block", marginBottom: "4px" }}>PVRD signé (PDF)</label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".pdf"
                            onChange={(e) => updateLivraison(key, "pvrd_signe", e.target.files?.[0] || null)}
                            style={{ borderRadius: "8px", fontSize: "14px" }}
                            disabled={isClosedByApi || hasPvrd}
                          />
                          {hasPvrd ? (
                            <a 
                              href={`${BASE_URL}${client.url_pvrd}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ marginTop: "4px", fontSize: "12px", color: "#28a745", display: "block" }}
                            >
                              ✓ Document uploadé - Voir
                            </a>
                          ) : livraison.pvrd_signe && (
                            <div style={{ marginTop: "4px", fontSize: "12px", color: "#28a745" }}>{livraison.pvrd_signe.name}</div>
                          )}
                        </div>

                        <div className="col-md-3">
                          <label style={{ fontSize: "12px", color: "#6c757d", display: "block", marginBottom: "4px" }}>Bon de retour signé (PDF)</label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".pdf"
                            onChange={(e) => updateLivraison(key, "bon_retour_signe", e.target.files?.[0] || null)}
                            style={{ borderRadius: "8px", fontSize: "14px" }}
                            disabled={isClosedByApi || hasBonRetour}
                          />
                          {hasBonRetour ? (
                            <a 
                              href={`${BASE_URL}${client.url_bon_retour}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ marginTop: "4px", fontSize: "12px", color: "#28a745", display: "block" }}
                            >
                              ✓ Document uploadé - Voir
                            </a>
                          ) : livraison.bon_retour_signe && (
                            <div style={{ marginTop: "4px", fontSize: "12px", color: "#28a745" }}>
                              {livraison.bon_retour_signe.name}
                            </div>
                          )}
                        </div>

                        <div className="col-md-3">
                          <label style={{ fontSize: "12px", color: "#6c757d", display: "block", marginBottom: "4px" }}>Fiche de pointage signée (PDF)</label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".pdf"
                            onChange={(e) => updateLivraison(key, "fiche_pointage_signe", e.target.files?.[0] || null)}
                            style={{ borderRadius: "8px", fontSize: "14px" }}
                            disabled={isClosedByApi || hasFichePointage}
                          />
                          {hasFichePointage ? (
                            <a 
                              href={`${BASE_URL}${client.url_fiche_pointage}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ marginTop: "4px", fontSize: "12px", color: "#28a745", display: "block" }}
                            >
                              ✓ Document uploadé - Voir
                            </a>
                          ) : livraison.fiche_pointage_signe && (
                            <div style={{ marginTop: "4px", fontSize: "12px", color: "#28a745" }}>
                              {livraison.fiche_pointage_signe.name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="d-flex justify-content-end mt-3">
                        <button
                          className="btn"
                          onClick={() => onSubmit(key)}
                          disabled={!localComplete || submitting || isClosedByApi || !!apiComplete}
                          style={{
                            backgroundColor: (isClosedByApi || apiComplete) ? "#6c757d" : (localComplete ? "#28a745" : "#6c757d"),
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px 24px",
                            fontWeight: 500,
                            fontSize: "14px",
                            opacity: ((isClosedByApi || apiComplete) && !localComplete) ? 0.7 : 1
                          }}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Envoi...
                            </>
                          ) : (
                            (isClosedByApi || apiComplete) ? "Déjà clôturé" : "Clôturer"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* <div className="d-flex justify-content-center mt-4">
        <button
          className="btn"
          onClick={onBackToDetails}
          disabled={submitting}
          style={{
            backgroundColor: "white",
            color: "#495057",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            padding: "12px 32px",
            fontWeight: 500,
          }}
        >
          ← Retour aux détails
        </button>
      </div> */}
    </>
  );
};

export default MissionClosureTab;
