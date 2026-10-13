import React, { useMemo } from "react";
import { FaCheck, FaExclamationTriangle, FaTruck } from "react-icons/fa";

// Interface pour une offre de transport dans le suivi
export interface OffreTransportSuiviData {
  id: string;
  axeTonnageId: string;
  prixPropose: number;
  devise: "MGA" | "EUR" | "USD";
  delaiJours: number;
  axeDesignation?: string;
  province?: string;
  tonnageValue?: number;
}

// Structure groupée pour l'affichage
interface GroupedAxe {
  axeId: number;
  axeDesignation: string;
  province: string;
  offres: OffreTransportSuiviData[];
}

interface OffresTransportSuiviTableProps {
  offresTransport: OffreTransportSuiviData[];
  onOffreChange: (
    offreId: string,
    field: keyof OffreTransportSuiviData,
    value: string | number
  ) => void;
  readOnly?: boolean;
}

const OffresTransportSuiviTable: React.FC<OffresTransportSuiviTableProps> = ({
  offresTransport,
  onOffreChange,
  readOnly = false,
}) => {
  // Grouper les offres par axe
  const groupedData = useMemo((): GroupedAxe[] => {
    if (!offresTransport || offresTransport.length === 0) {
      return [];
    }

    const grouped: Record<string, GroupedAxe> = {};

    offresTransport.forEach((offre) => {
      const axeKey = offre.axeDesignation || "Axe inconnu";
      
      if (!grouped[axeKey]) {
        grouped[axeKey] = {
          axeId: parseInt(offre.axeTonnageId) || 0,
          axeDesignation: axeKey,
          province: offre.province || "N/A",
          offres: [],
        };
      }
      
      grouped[axeKey].offres.push(offre);
    });

    return Object.values(grouped).sort((a, b) =>
      a.axeDesignation.localeCompare(b.axeDesignation)
    );
  }, [offresTransport]);

  // Compter les offres valides
  const validOffersCount = useMemo(() => {
    return offresTransport.filter(
      (o) => o.prixPropose > 0 && o.delaiJours > 0
    ).length;
  }, [offresTransport]);

  // Compter les offres avec prix
  const offersWithPriceCount = useMemo(() => {
    return offresTransport.filter((o) => o.prixPropose > 0).length;
  }, [offresTransport]);

  // Compter les offres par axe
  const getOffreCountForAxe = (axeDesignation: string): number => {
    const axeGroup = groupedData.find((g) => g.axeDesignation === axeDesignation);
    if (!axeGroup) return 0;
    return axeGroup.offres.filter((o) => o.prixPropose > 0).length;
  };

  // Vérifier si une offre est complète
  const isOffreComplete = (offre: OffreTransportSuiviData): boolean => {
    return offre.prixPropose > 0 && offre.delaiJours > 0;
  };

  // Vérifier si une offre est incomplète
  const isOffreIncomplete = (offre: OffreTransportSuiviData): boolean => {
    return offre.prixPropose > 0 && offre.delaiJours <= 0;
  };

  if (offresTransport.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>
        <FaTruck size={48} style={{ marginBottom: "10px", opacity: 0.5 }} />
        <p>Aucune offre de transport pour cette soumission.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #1FB05B",
        padding: "0px 10px",
        borderRadius: "5px",
      }}
    >
      {/* En-tête avec compteur */}
      <div
        className="d-flex align-items-center justify-content-between"
        style={{ padding: "10px 5px" }}
      >
        <div className="d-flex align-items-center">
          <FaTruck style={{ color: "#1FB05B", marginRight: "10px" }} />
          <span style={{ fontWeight: 600, color: "#1FB05B" }}>
            Offres de Transport
          </span>
          <span className="ms-2" style={{ color: "#CBCBCB", fontSize: "0.9rem" }}>
            ({offresTransport.length} offres)
          </span>
        </div>

        <div
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            backgroundColor: offersWithPriceCount > 0 ? "#f8fdfb" : "#f8f9fa",
            border: `1px solid ${offersWithPriceCount > 0 ? "#1FB05B" : "#dee2e6"}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaTruck style={{ color: offersWithPriceCount > 0 ? "#1FB05B" : "#6c757d" }} />
          <span style={{ fontWeight: 600, color: offersWithPriceCount > 0 ? "#1FB05B" : "#6c757d", fontSize: "0.85rem" }}>
            {validOffersCount} / {offersWithPriceCount} offres valides
          </span>
        </div>
      </div>

      <div className="form-container">
        <div className="table-container">
          <table className="professional-table" style={{ minWidth: "900px" }}>
            <thead>
              <tr>
                <th>Axe</th>
                <th>Province</th>
                <th>Tonnage</th>
                <th>Prix proposé</th>
                <th>Délai (jours)</th>
                <th style={{ width: "80px" }}>Statut</th>
              </tr>
            </thead>

            <tbody>
              {groupedData.map((axeGroup, groupIndex) => (
                <React.Fragment key={axeGroup.axeDesignation}>
                  {/* Ligne de groupe (header de l'axe) */}
                  <tr
                    style={{
                      backgroundColor: "#f0f9f3",
                      borderTop: groupIndex > 0 ? "2px solid #1FB05B" : undefined,
                    }}
                  >
                    <td
                      colSpan={6}
                      style={{
                        fontWeight: 600,
                        color: "#1FB05B",
                        fontSize: "13px",
                        padding: "12px 20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaTruck />
                        <span>{axeGroup.axeDesignation}</span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "11px",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            backgroundColor: "#1FB05B",
                            color: "white",
                          }}
                        >
                          {getOffreCountForAxe(axeGroup.axeDesignation)} / {axeGroup.offres.length} offres renseignées
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Lignes des offres pour cet axe */}
                  {axeGroup.offres.map((offre) => {
                    const hasPrix = offre.prixPropose > 0;
                    const isComplete = isOffreComplete(offre);
                    const isIncomplete = isOffreIncomplete(offre);

                    return (
                      <tr key={offre.id}>
                        {/* Axe */}
                        <td style={{ fontWeight: 500, color: "#2c3e50" }}>
                          {axeGroup.axeDesignation}
                        </td>

                        {/* Province */}
                        <td>
                          <span className="chip">{axeGroup.province}</span>
                        </td>

                        {/* Tonnage */}
                        <td>
                          <span
                            className="chip"
                            style={{
                              backgroundColor: hasPrix ? "#e8f5e9" : "#f0f2f5",
                              borderColor: hasPrix ? "#1FB05B" : "#e3e6ea",
                              color: hasPrix ? "#1FB05B" : "#495057",
                            }}
                          >
                            {offre.tonnageValue ? `${offre.tonnageValue} T` : "N/A"}
                          </span>
                        </td>

                        {/* Prix proposé avec devise */}
                        <td>
                          <div className="price-input-group">
                            <input
                              type="number"
                              className="input-field"
                              placeholder="0"
                              min="0"
                              value={offre.prixPropose || ""}
                              disabled={readOnly}
                              onChange={(e) =>
                                onOffreChange(
                                  offre.id,
                                  "prixPropose",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                            <select
                              className="devise-inline"
                              value={offre.devise || "MGA"}
                              disabled={readOnly}
                              onChange={(e) =>
                                onOffreChange(
                                  offre.id,
                                  "devise",
                                  e.target.value
                                )
                              }
                            >
                              <option value="MGA">MGA</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                            </select>
                          </div>
                        </td>

                        {/* Délai en jours */}
                        <td>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="0"
                            min="1"
                            value={offre.delaiJours || ""}
                            disabled={readOnly}
                            onChange={(e) =>
                              onOffreChange(
                                offre.id,
                                "delaiJours",
                                parseInt(e.target.value) || 0
                              )
                            }
                            style={{
                              borderColor:
                                hasPrix && offre.delaiJours <= 0
                                  ? "#dc3545"
                                  : undefined,
                            }}
                          />
                        </td>

                        {/* Statut */}
                        <td style={{ textAlign: "center" }}>
                          {isComplete ? (
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "#e8f5e9",
                                color: "#1FB05B",
                              }}
                            >
                              <FaCheck size={14} />
                            </div>
                          ) : isIncomplete ? (
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "#fff3cd",
                                color: "#ffc107",
                              }}
                            >
                              <FaExclamationTriangle size={14} />
                            </div>
                          ) : (
                            <span style={{ color: "#ccc", fontSize: "12px" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>

            {/* Footer avec résumé */}
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: "left", fontWeight: 600 }}>
                  Résumé des offres
                </td>
                <td colSpan={2}></td>
                <td style={{ textAlign: "center" }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: validOffersCount === offersWithPriceCount && offersWithPriceCount > 0
                        ? "#1FB05B"
                        : "#ffc107",
                      fontSize: "13px",
                    }}
                  >
                    {validOffersCount} valides
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OffresTransportSuiviTable;
