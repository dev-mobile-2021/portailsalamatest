import React, { useMemo, useState, useEffect, useRef } from "react";
import { FaLongArrowAltRight, FaTruck, FaChevronDown } from "react-icons/fa";
import doc_info_icon from "../../assets/images/doc_info_icon.png";
import { AO, OffreTransport, DetailOffreTransport } from "../../types/AO.types";
import "../../assets/scss/table.scss";

// Interface pour une offre de tonnage (seul prix_unitaire est envoyé au backend)
export interface OffreTonnageData {
  axeTonnageId: string;       // ID unique (detailoffretransporttonnage_id)
  axe_id: number;             // ID de l'axe
  tonnage_id: number;         // ID du tonnage
  prixPropose: number;
}

interface OffresTransportTabProps {
  tender: AO;
  offres: Record<string, OffreTonnageData>;
  handleOffreChange: (
    axeTonnageId: string,
    field: keyof OffreTonnageData,
    value: string | number | boolean,
    axe_id?: number,
    tonnage_id?: number
  ) => void;
}

// Structure pour une plage de capacité
interface CapacityRange {
  axeTonnageId: string;   // ID unique (detailoffretransporttonnage_id)
  axe_id: number;         // ID de l'axe
  tonnage_id: number;     // ID du tonnage
  tonnageMin: number;
  tonnageMax: number;
  volumeMin: number;
  volumeMax: number;
}

// Structure groupée pour l'affichage par Axe + Province
interface GroupedSection {
  sectionId: string;
  axeId: number;
  axeDesignation: string;
  province: string;
  capacityRanges: CapacityRange[];
}

const OffresTransportTab: React.FC<OffresTransportTabProps> = ({
  tender,
  offres,
  handleOffreChange,
}) => {
  // Grouper les données par Axe + Province
  const groupedData = useMemo((): GroupedSection[] => {
    if (!tender.offretransports || tender.offretransports.length === 0) {
      return [];
    }

    const grouped: Record<string, GroupedSection> = {};

    tender.offretransports.forEach((offre: OffreTransport) => {
      offre.detailoffretransports.forEach((detail: DetailOffreTransport) => {
        const axe = detail.axe;
        if (!axe) return;

        const sectionKey = `${axe.id}-${axe.province?.id || 0}`;
        const provinceName = axe.province?.id ? `Province ${axe.province.id}` : "N/A";

        if (!grouped[sectionKey]) {
          grouped[sectionKey] = {
            sectionId: sectionKey,
            axeId: axe.id,
            axeDesignation: axe.designation,
            province: provinceName,
            capacityRanges: [],
          };
        }

        // Utiliser les detailoffretransporttonnages pour récupérer les vraies données
        if ((detail as any).detailoffretransporttonnages) {
          (detail as any).detailoffretransporttonnages.forEach((dt: any) => {
            const tonnageData = dt.tonnage;
            const exists = grouped[sectionKey].capacityRanges.some(
              (r) => r.axeTonnageId === String(dt.id)
            );
            if (!exists && tonnageData) {
              grouped[sectionKey].capacityRanges.push({
                axeTonnageId: String(dt.id),
                axe_id: axe.id,
                tonnage_id: parseInt(tonnageData.id, 10), // ID du tonnage
                tonnageMin: tonnageData.min ?? 0,
                tonnageMax: tonnageData.max ?? tonnageData.tonnage ?? 0,
                volumeMin: tonnageData.volume_min ?? 0,
                volumeMax: tonnageData.volume_max ?? 0,
              });
            }
          });
        }
        // Fallback: utiliser axe.axetonnages si detailoffretransporttonnages n'existe pas
        else if (axe.axetonnages) {
          axe.axetonnages.forEach((at: any) => {
            const exists = grouped[sectionKey].capacityRanges.some(
              (r) => r.axeTonnageId === at.id
            );
            if (!exists) {
              const tonnageValue = at.tonnage?.tonnage || 0;
              grouped[sectionKey].capacityRanges.push({
                axeTonnageId: at.id,
                axe_id: axe.id,
                tonnage_id: parseInt(at.tonnage?.id || '0', 10),
                tonnageMin: at.tonnage?.min ?? Math.max(0, tonnageValue - 2),
                tonnageMax: at.tonnage?.max ?? tonnageValue,
                volumeMin: at.tonnage?.volume_min ?? Math.max(0, Math.round((tonnageValue - 2) * 1.5)),
                volumeMax: at.tonnage?.volume_max ?? Math.round(tonnageValue * 1.5),
              });
            }
          });
        }
      });
    });

    return Object.values(grouped).sort((a, b) => {
      const axeCompare = a.axeDesignation.localeCompare(b.axeDesignation);
      if (axeCompare !== 0) return axeCompare;
      return a.province.localeCompare(b.province);
    });
  }, [tender.offretransports]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const didInitExpanded = useRef(false);

  useEffect(() => {
    if (didInitExpanded.current) return;
    if (groupedData.length === 0) return;

    didInitExpanded.current = true;
    setExpandedSections(new Set(groupedData.map((g) => g.sectionId)));
  }, [groupedData]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const validOffersCount = useMemo(() => {
    return Object.values(offres).filter((o) => o.prixPropose > 0).length;
  }, [offres]);

  const totalCapacityRanges = useMemo(() => {
    return groupedData.reduce((acc, g) => acc + g.capacityRanges.length, 0);
  }, [groupedData]);

  const getSelectedCountForSection = (sectionId: string): number => {
    const section = groupedData.find((g) => g.sectionId === sectionId);
    if (!section) return 0;
    return section.capacityRanges.filter(
      (r) => offres[r.axeTonnageId]?.prixPropose > 0
    ).length;
  };

  if (groupedData.length === 0) {
    return (
      <div className="text-center py-4" style={{ color: "#6c757d" }}>
        <FaTruck size={48} style={{ marginBottom: "10px", opacity: 0.5 }} />
        <p>Aucune offre de transport disponible pour cet appel d'offre.</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      {/* Header principal */}
      <div className="d-flex align-items-center justify-content-between" style={{ paddingBottom: "15px" }}>
        <div className="d-flex align-items-center">
          <h5
            className="mb-0 d-flex align-items-center"
            style={{ color: "#1FB05B", paddingLeft: "15px", fontSize: "1.2rem" }}
          >
            <img src={doc_info_icon} alt="info" style={{ width: "20px", marginRight: "10px" }} />
            Offres de Transport
            <FaLongArrowAltRight style={{ marginLeft: "5px" }} />
          </h5>
          <span className="ms-2" style={{ color: "#CBCBCB" }}>
            ({totalCapacityRanges}) Plages de capacité disponibles
          </span>
        </div>

        {/* Compteur d'offres valides */}
        <div className="chip" style={{ 
          backgroundColor: validOffersCount > 0 ? "#f8fdfb" : "#f8f9fa",
          border: `1px solid ${validOffersCount > 0 ? "#1FB05B" : "#dee2e6"}`,
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          padding: "8px 16px"
        }}>
          <FaTruck style={{ color: validOffersCount > 0 ? "#1FB05B" : "#6c757d" }} />
          <span style={{ fontWeight: 600, color: validOffersCount > 0 ? "#1FB05B" : "#6c757d" }}>
            {validOffersCount} / {totalCapacityRanges} offres valides
          </span>
        </div>
      </div>

      {/* Sections par Axe + Province */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {groupedData.map((section) => {
          const isExpanded = expandedSections.has(section.sectionId);
          const selectedCount = getSelectedCountForSection(section.sectionId);

          return (
            <div
              key={section.sectionId}
              style={{
                border: "1px solid #1FB05B",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {/* Header de section : AXE : nom — Province : nom */}
              <div
                onClick={() => toggleSection(section.sectionId)}
                className="section-header"
                style={{
                  backgroundColor: "#f0f9f3",
                  borderBottom: isExpanded ? "1px solid #1FB05B" : "none",
                  padding: "12px 20px",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3f5ea")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f9f3")}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        transition: "transform 0.3s ease",
                        transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                        color: "#1FB05B",
                      }}
                    >
                      <FaChevronDown size={14} />
                    </span>
                    <FaTruck style={{ color: "#1FB05B" }} />
                    <span style={{ fontWeight: 600, color: "#2c3e50", fontSize: "14px" }}>
                      AXE : {section.axeDesignation}
                    </span>
                  </div>

                  <span
                    className={`button ${selectedCount > 0 ? "button-active" : ""}`}
                    style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "12px" }}
                  >
                    {selectedCount} / {section.capacityRanges.length} renseignés
                  </span>
                </div>
              </div>

              {/* Tableau des plages de capacité */}
              <div
                style={{
                  maxHeight: isExpanded ? "1000px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="professional-table" style={{ minWidth: "auto", width: "100%" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "center" }}>Tonnage min (T)</th>
                        <th>Tonnage max (T)</th>
                        <th>Volume min (m³)</th>
                        <th>Volume max (m³)</th>
                        <th>Prix proposé</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.capacityRanges.map((range) => {
                        const offre = offres[range.axeTonnageId] || {
                          axeTonnageId: range.axeTonnageId,
                          prixPropose: 0,
                        };
                        const hasPrix = offre.prixPropose > 0;

                        return (
                          <tr
                            key={range.axeTonnageId}
                            style={{
                              borderLeft: hasPrix ? "3px solid #1FB05B" : "3px solid transparent",
                            }}
                          >
                            <td style={{ textAlign: "center" }}>
                              <span className="chip">{range.tonnageMin}</span>
                            </td>
                            <td>
                              <span className="chip">{range.tonnageMax}</span>
                            </td>
                            <td>
                              <span className="chip">{range.volumeMin}</span>
                            </td>
                            <td>
                              <span className="chip">{range.volumeMax}</span>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="input-field"
                                placeholder="0"
                                min="0"
                                value={offre.prixPropose || ""}
                                onChange={(e) =>
                                  handleOffreChange(
                                    range.axeTonnageId,
                                    "prixPropose",
                                    parseFloat(e.target.value) || 0,
                                    range.axe_id,
                                    range.tonnage_id
                                  )
                                }
                                style={{
                                  textAlign: "right",
                                  borderColor: hasPrix ? "#1FB05B" : undefined,
                                  backgroundColor: hasPrix ? "#f8fdfb" : undefined,
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4}>Résumé de la section</td>
                        <td className="sous-total">
                          {selectedCount} / {section.capacityRanges.length} renseignés
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé global */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px 20px",
          background: "linear-gradient(180deg, #f8fdf9 0%, #f0f9f3 100%)",
          borderRadius: "8px",
          border: "1px solid #1FB05B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600, color: "#2c3e50", textTransform: "uppercase", letterSpacing: "0.3px" }}>
          Résumé des offres
        </span>
        <span
          style={{
            fontWeight: 600,
            color: validOffersCount > 0 ? "#1FB05B" : "#6c757d",
            fontSize: "14px",
          }}
        >
          {validOffersCount} offre{validOffersCount > 1 ? "s" : ""} valide{validOffersCount > 1 ? "s" : ""} sur {totalCapacityRanges}
        </span>
      </div>
    </div>
  );
};

export default OffresTransportTab;
