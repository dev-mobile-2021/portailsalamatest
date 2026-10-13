import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SmallHeader from "../components/const/SmallHeader";
import Title from "../components/const/Title";
import PaginationComponent from "../components/PaginationComponent";
import { useAuthContext } from "../hooks/useUserhook";
import { useMissions } from "../hooks/useExpeditions";
import { Mission, StatutFiltre } from "../types/Mission.types";

const PortailTransporteur = () => {
  const { user, fournisseur } = useAuthContext();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFiltre, setStatutFiltre] = useState<StatutFiltre>("tous");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const perPage = 9; // 3x3 grid

  // État pour le chronogramme de livraisons
  const [chronogrammeLivraisons, setChronogrammeLivraisons] = useState<{ file: File; name: string } | null>(null);

  const { missions, loading, error, total } = useMissions({
    fournisseur_id: user?.fournisseur_id,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (fournisseur?.TSSCOD_0_0 !== "TRANS") {
      navigate('/');
    }
  }, [user, fournisseur, navigate]);

  // Filtrer les missions
  const filteredMissions = missions.filter(mission => {
    if (statutFiltre !== "tous") {
      const statutMatch = mission.statut === statutFiltre || 
        (statutFiltre === "en_cours" && mission.etat_text?.toLowerCase().includes("cours")) ||
        (statutFiltre === "livre" && mission.etat_text?.toLowerCase().includes("livr")) ||
        (statutFiltre === "attente" && mission.etat_text?.toLowerCase().includes("attent"));
      if (!statutMatch) return false;
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        mission.code?.toLowerCase().includes(search) ||
        mission.axe.designation?.toLowerCase().includes(search) ||
        mission.vehicule.matricule?.toLowerCase().includes(search) ||
        mission.chauffeur.nom?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const paginatedMissions = filteredMissions.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  const totalPages = Math.ceil(filteredMissions.length / perPage);

  const handleViewDetails = (missionId: string) => {
    navigate(`/portailTransporteur/${missionId}`);
  };

  const handleDownloadOM = async (e: React.MouseEvent, mission: Mission) => {
    e.stopPropagation();
    setDownloadingId(mission.id);
    try {
      const response = await fetch(
        `https://backsignup.h-tsoft.com//pdf.generate-pdf-bcfournisseur/${mission.expedition_id}/${user?.fournisseur_id}`,
        {
          method: "GET",
          headers: { Accept: "application/pdf" },
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la génération du PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OM-${mission.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      alert("Impossible de télécharger l'ordre de mission.");
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusConfig = (mission: Mission) => {
    const status = mission.etat_text || mission.statut;
    if (status?.toLowerCase().includes("livr")) {
      return { bg: "#28a745", color: "white", label: "Livré" };
    } else if (status?.toLowerCase().includes("cours") || status?.toLowerCase().includes("transit")) {
      return { bg: "#ffc107", color: "#212529", label: "En cours" };
    } else if (status?.toLowerCase().includes("attent")) {
      return { bg: "#17a2b8", color: "white", label: "En attente" };
    } else if (status?.toLowerCase().includes("nouveau")) {
      return { bg: "#007bff", color: "white", label: "Nouveau" };
    }
    return { bg: "#6c757d", color: "white", label: status || "N/A" };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filtreOptions: { value: StatutFiltre; label: string; count: number }[] = [
    { value: "tous", label: "Toutes", count: missions.length },
    { value: "nouveau", label: "Nouvelles", count: missions.filter(m => m.etat_text?.toLowerCase().includes("nouveau") || m.statut === "nouveau").length },
    { value: "en_cours", label: "En cours", count: missions.filter(m => m.etat_text?.toLowerCase().includes("cours") || m.statut === "en_cours").length },
    { value: "livre", label: "Terminées", count: missions.filter(m => m.etat_text?.toLowerCase().includes("livr") || m.statut === "livre").length },
    { value: "attente", label: "En attente", count: missions.filter(m => m.etat_text?.toLowerCase().includes("attent") || m.statut === "attente").length },
  ];

  // Stats cards
  const statsCards = [
    { label: "Total missions", value: total, color: "#1FB05B" },
    { label: "En cours", value: missions.filter(m => m.etat_text?.toLowerCase().includes("cours")).length, color: "#ffc107" },
    { label: "Terminées", value: missions.filter(m => m.etat_text?.toLowerCase().includes("livr")).length, color: "#28a745" },
  ];

  return (
    <>
      <SmallHeader />
      <div style={{ position: "relative", zIndex: 1, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
        <div className="container py-4">
          {user?.fournisseur_id && (
            <>
              <Title
                spanText="Portail Transporteur"
                titleText="Mes Missions"
                textColorH2="text-theme-claire"
                align="left"
                maxWidth="800px"
              />

              {/* Stats Overview */}
              <div className="row g-3 mb-4">
                {statsCards.map((stat, idx) => (
                  <div key={idx} className="col-md-4">
                    <div
                      className="card h-100"
                      style={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div className="card-body d-flex align-items-center">
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            backgroundColor: `${stat.color}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "16px",
                          }}
                        >
                          <span style={{ fontSize: "1.5rem", color: stat.color, fontWeight: 700 }}>
                            {stat.value}
                          </span>
                        </div>
                        <div>
                          <p style={{ margin: 0, color: "#6c757d", fontSize: "13px" }}>{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chronogramme de Livraisons - Affiché uniquement si au moins une mission a chrono_disponible */}
              {missions.some(m => m.chrono_disponible) && (
              <div
                className="card mb-4"
                style={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div className="card-body d-flex align-items-center justify-content-between py-3 px-4">
                  <div className="d-flex align-items-center" style={{ gap: "16px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: chronogrammeLivraisons ? "#1FB05B15" : "#ff980015",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={chronogrammeLivraisons ? "#1FB05B" : "#ff9800"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <line x1="9" y1="14" x2="15" y2="14" />
                        <line x1="9" y1="18" x2="15" y2="18" />
                      </svg>
                    </div>
                    <div>
                      <h6 style={{ margin: 0, fontWeight: 600, fontSize: "15px" }}>
                        Chronogramme de Livraisons
                      </h6>
                      <p style={{ margin: 0, color: "#6c757d", fontSize: "13px" }}>
                        {chronogrammeLivraisons
                          ? `Fichier installé : ${chronogrammeLivraisons.name}`
                          : "Installez le planning de vos livraisons"}
                      </p>
                    </div>
                  </div>
                  <label
                    title="Installer le chronogramme de livraisons"
                    style={{
                      backgroundColor: chronogrammeLivraisons ? "#1FB05B" : "transparent",
                      border: `1px solid ${chronogrammeLivraisons ? "#1FB05B" : "#ff9800"}`,
                      borderRadius: "8px",
                      padding: "10px 20px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: chronogrammeLivraisons ? "white" : "#ff9800",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!chronogrammeLivraisons) {
                        e.currentTarget.style.backgroundColor = "#ff980015";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!chronogrammeLivraisons) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{chronogrammeLivraisons ? "Changer" : "Installer"}</span>
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setChronogrammeLivraisons({ file, name: file.name });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              )}

              {/* Filtres et Recherche */}
              <div
                className="card mb-4"
                style={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div className="card-body py-3">
                  <div className="row align-items-center g-3">
                    <div className="col-md-8">
                      <div className="d-flex flex-wrap gap-2">
                        {filtreOptions.map((option) => (
                          <button
                            key={option.value}
                            className="btn btn-sm"
                            onClick={() => {
                              setStatutFiltre(option.value);
                              setCurrentPage(1);
                            }}
                            style={{
                              borderRadius: "20px",
                              padding: "6px 16px",
                              backgroundColor: statutFiltre === option.value ? "#1FB05B" : "transparent",
                              color: statutFiltre === option.value ? "white" : "#495057",
                              border: statutFiltre === option.value ? "none" : "1px solid #dee2e6",
                              fontWeight: 500,
                              fontSize: "13px",
                            }}
                          >
                            {option.label}
                            {option.count > 0 && (
                              <span
                                style={{
                                  marginLeft: "6px",
                                  backgroundColor: statutFiltre === option.value ? "rgba(255,255,255,0.2)" : "#e9ecef",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontSize: "11px",
                                }}
                              >
                                {option.count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher une mission..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{
                          borderRadius: "20px",
                          border: "1px solid #dee2e6",
                          padding: "8px 16px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-3" style={{ color: "#6c757d" }}>Chargement des missions...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : filteredMissions.length === 0 ? (
                <div
                  className="card text-center py-5"
                  style={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <p style={{ color: "#6c757d", fontSize: "16px", margin: 0 }}>
                    {searchTerm || statutFiltre !== "tous"
                      ? "Aucune mission trouvée avec ces critères."
                      : "Aucune mission attribuée pour le moment."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Grille de cartes */}
                  <div className="row g-3">
                    {paginatedMissions.map((mission) => {
                      const statusConfig = getStatusConfig(mission);
                      return (
                        <div key={mission.id} className="col-md-6 col-lg-4">
                          <div
                            className="card h-100"
                            onClick={() => handleViewDetails(mission.id)}
                            style={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-4px)";
                              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                            }}
                          >
                            {/* Header avec statut */}
                            <div
                              style={{
                                backgroundColor: statusConfig.bg,
                                color: statusConfig.color,
                                padding: "12px 16px",
                                borderRadius: "12px 12px 0 0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span style={{ fontWeight: 600, fontSize: "15px" }}>{mission.code}</span>
                              <span style={{ fontSize: "12px", opacity: 0.9 }}>{statusConfig.label}</span>
                            </div>

                            <div className="card-body" style={{ padding: "16px" }}>
                              {/* Date et Axe */}
                              <div className="mb-3">
                                <div style={{ fontSize: "13px", color: "#6c757d", marginBottom: "4px" }}>
                                  {formatDate(mission.date_expedition)}
                                </div>
                                <div style={{ fontWeight: 500, fontSize: "14px" }}>
                                  {mission.axe.designation}
                                </div>
                              </div>

                              {/* Véhicule et Chauffeur */}
                              <div
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: "8px",
                                  padding: "12px",
                                  marginBottom: "12px",
                                }}
                              >
                                <div className="d-flex justify-content-between mb-1">
                                  <span style={{ fontSize: "12px", color: "#6c757d" }}>Véhicule</span>
                                  <span style={{ fontSize: "12px", color: "#6c757d" }}>Chauffeur</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <span style={{ fontWeight: 500, fontSize: "13px" }}>
                                    {mission.vehicule.matricule}
                                  </span>
                                  <span style={{ fontWeight: 500, fontSize: "13px" }}>
                                    {mission.chauffeur.nom}
                                  </span>
                                </div>
                              </div>

                              {/* Tonnage avec barre de progression */}
                              <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <span style={{ fontSize: "12px", color: "#6c757d" }}>Chargement</span>
                                  <span style={{ fontSize: "12px", fontWeight: 500 }}>
                                    {mission.tonnage_affecte}T / {mission.vehicule.tonnage}T
                                  </span>
                                </div>
                                <div
                                  className="progress"
                                  style={{ height: "6px", borderRadius: "3px", backgroundColor: "#e9ecef" }}
                                >
                                  <div
                                    className="progress-bar"
                                    style={{
                                      width: `${mission.pourcentage_remplissage_tonnage}%`,
                                      backgroundColor: "#1FB05B",
                                      borderRadius: "3px",
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Clients et Montant */}
                              <div className="d-flex justify-content-between align-items-center">
                                <span style={{ fontSize: "13px", color: "#6c757d" }}>
                                  {mission.clients.length} client{mission.clients.length > 1 ? "s" : ""}
                                </span>
                                <span style={{ fontWeight: 600, color: "#1FB05B", fontSize: "15px" }}>
                                  {mission.cout_transport?.toLocaleString()} MGA
                                </span>
                              </div>
                            </div>

                            {/* Footer avec actions */}
                            <div
                              style={{
                                borderTop: "1px solid #e9ecef",
                                padding: "12px 16px",
                                display: "flex",
                                gap: "8px",
                              }}
                            >
                              <button
                                className="btn btn-sm flex-grow-1"
                                onClick={(e) => handleDownloadOM(e, mission)}
                                disabled={downloadingId === mission.id}
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                }}
                              >
                                {downloadingId === mission.id ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  "Télécharger BC"
                                )}
                              </button>
                              <button
                                className="btn btn-sm flex-grow-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(mission.id);
                                }}
                                style={{
                                  backgroundColor: "#1FB05B",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                }}
                              >
                                Voir détails
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      perPage={perPage}
                      onPerPageChange={() => {}}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PortailTransporteur;
