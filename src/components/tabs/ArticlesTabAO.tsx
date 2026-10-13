import React, { useState } from "react";
import { FaExclamationCircle, FaLongArrowAltRight, FaChevronRight, FaChevronDown, FaIndustry, FaEdit, FaPlus, FaTrash, FaSearch } from "react-icons/fa";
import doc_info_icon from "../../assets/images/doc_info_icon.png";
import DelaiLivraisonModal, { DelaiLivraisonData } from "../ui/DelaiLivraisonModal";
import LotsManagerModal from "../ui/LotsManagerModal";
import LotModal, { LotData } from "../ui/LotModal";
import PricesModal from "../ui/PricesModal";
import SearchableSelect from "../ui/SearchableSelect";
import { AO, Fabricant } from "../../types/AO.types";
import { Devise } from "../../types/Devise.types";

interface DetailPrixFabricant {
  fabricant_id: number;
  prixunitaire: number;
  devise_id?: number;
}

interface ArticleData {
  id: number;
  quantiteDisponible: number;
  prixUnitaire?: number;
  detailprixfabricants: DetailPrixFabricant[];
  devise_id?: number;
  commentaire: string;
  datelivraison: string;
  delaiLivraison?: DelaiLivraisonData;
  coeff: number | null;
  termeCommercial: "DDP" | "Autre" | "";
  fabricant_id?: number;
  lots?: any[];
  [key: string]: any;
}

interface ArticlesTabProps {
  tender: AO;
  form: {
    produits: Record<number, ArticleData>;
    termeCommercial: "DDP" | "Autre" | "";
    commentaireTerme: string;
    transitaire: string;
    cabinetExpertise: string;
    fichier?: File | null;
    [key: string]: any;
  };
  fabricant: Array<Fabricant>;
  loadingFabricants: boolean;
  errorFabricant: string | null;
  devises: Devise[];
  handleProduitChange: (produitId: number, field: string, value: any) => void;
  handleProduitTermeChange: (produitId: number, terme: "DDP" | "Autre") => void;
  calculerTotal: () => number;
  handlePrixFabricantChange: (produitId: number, fabricantId: number, prixunitaire: number, devise_id?: number) => void;
  handleGlobalDeviseChange?: (newDeviseId: number | null) => void;
  handleDeviseChange?: (produitId: number, devise_id: number) => void;
  handleAddLot?: (produitId: number) => void;
  handleDeleteLot?: (produitId: number, lotIndex: number) => void;
  handleLotChange?: (produitId: number, lotIndex: number, field: string, value: any) => void;
}

const ArticlesTab: React.FC<ArticlesTabProps> = ({
  tender, form, fabricant, devises,
  handleProduitChange, handleProduitTermeChange, calculerTotal,
  handlePrixFabricantChange, handleGlobalDeviseChange,
  handleDeleteLot, handleLotChange,
  loadingFabricants, errorFabricant,
}) => {
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({});
  const [showDelaiModal, setShowDelaiModal] = useState(false);
  const [selectedProduitForDelai, setSelectedProduitForDelai] = useState<number | null>(null);

  // States for lot management modals
  const [showLotsManager, setShowLotsManager] = useState(false);
  const [showLotFormModal, setShowLotFormModal] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [editLotIdx, setEditLotIdx] = useState<number | null>(null);
  const [selectedFabricantToAdd, setSelectedFabricantToAdd] = useState<Record<number, number | "">>({});
  const [showPricesModal, setShowPricesModal] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");

  const toggleAccordion = (articleId: number) => {
    setOpenAccordions(prev => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  const togglePriceTable = () => {
    setShowPricesModal(true);
  };

  const getLots = (produitId: number): any[] => {
    const lots = form.produits[produitId]?.lots;
    if (!lots) return [];
    return typeof lots === 'string' ? JSON.parse(lots) : lots;
  };

  const getSelectedArticleInfo = () => {
    if (!selectedArticleId) return null;
    const prod = tender.aoarticles.find((p: any) => Number(p.article.id) === selectedArticleId);
    const formData = form.produits[selectedArticleId] || {} as any;
    return {
      productName: prod?.article?.designation || "",
      quantiteDisponible: formData.quantiteDisponible || Number(prod?.quantite) || 0,
      lots: getLots(selectedArticleId),
      formData: formData
    };
  };

  const selectedInfo = getSelectedArticleInfo();

  const filteredArticles = tender.aoarticles.filter((produit: any) => {
    const query = articleSearch.trim().toLowerCase();
    if (!query) return true;
    const designation = String(produit?.article?.designation ?? "").toLowerCase();
    const code = String(produit?.article?.code ?? "").toLowerCase();
    const reference = String(produit?.article?.reference ?? "").toLowerCase();
    const articleId = String(produit?.article?.id ?? "").toLowerCase();
    return [designation, code, reference, articleId].some((value) => value.includes(query));
  });

  const handleSaveLot = (savedLot: LotData) => {
    if (!selectedArticleId) return;
    const currentLots = getLots(selectedArticleId);

    if (editLotIdx !== null) {
      if (handleLotChange) {
        Object.entries(savedLot).forEach(([field, value]) => {
          handleLotChange(selectedArticleId, editLotIdx, field, value);
        });
      }
    } else {
      const updatedLots = [...currentLots, savedLot];
      handleProduitChange(selectedArticleId, "lots", updatedLots);
    }
    setShowLotFormModal(false);
  };

  const getDefaultDeviseId = (): number | null => {
    // Si une devise est définie dans le formulaire, l'utiliser; sinon utiliser la première devise
    return devises && devises.length > 0 ? devises[0].id : null;
  };

  const getTaux = (devise_id: number | null | undefined): number => {
    if (!devise_id) {
      // Si aucune devise n'est fournie, utiliser la devise par défaut
      const defaultDeviseId = getDefaultDeviseId();
      if (!defaultDeviseId) return 1;
      const sel = devises.find(d => d.id === defaultDeviseId);
      return sel?.taux || 1;
    }
    const sel = devises.find(d => d.id === devise_id);
    return sel?.taux || 1;
  };

  const convertFromMGA = (valueMGA: number, devise_id: number | null | undefined): number => {
    return valueMGA / getTaux(devise_id);
  };

  const handleDeviseChangeGlobal = (newDeviseId: number | null) => {
    if (handleGlobalDeviseChange) {
      handleGlobalDeviseChange(newDeviseId);
    } else {
      tender.aoarticles.forEach((produit: any) => {
        handleProduitChange(Number(produit.article.id), "devise_id", newDeviseId);
      });
    }
  };

  const openDelaiModal = (produitId: number) => {
    setSelectedProduitForDelai(produitId);
    setShowDelaiModal(true);
  };

  const saveDelaiLivraison = (data: DelaiLivraisonData) => {
    if (!selectedProduitForDelai) return;
    handleProduitChange(selectedProduitForDelai, "delaiLivraison", JSON.stringify(data));
    setShowDelaiModal(false);
    setSelectedProduitForDelai(null);
  };

  const getDelaiData = (produitId: number): DelaiLivraisonData | undefined => {
    const delaiStr = form.produits[produitId]?.delaiLivraison;
    if (!delaiStr) return undefined;
    try { return typeof delaiStr === 'string' ? JSON.parse(delaiStr) : delaiStr; }
    catch { return undefined; }
  };

  const getFabricantName = (fabId: string | number) => {
    const fab = fabricant.find(f => String(f.id) === String(fabId));
    return fab?.designation || `Fabricant #${fabId}`;
  };

  const getDeviseLabel = (deviseId?: number | null) => {
    if (!deviseId) return "—";
    const found = devises.find(d => d.id === deviseId);
    if (found?.designation) {
      return found.designation;
    }
    // Fallback: afficher l'ID de la devise au lieu d'une string vide
    return found ? "?" : `#${deviseId}`;
  };

  const formatPrice = (value?: number | null) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—";
    return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const handleAddFabricant = (articleId: number, fabricantId: number) => {
    if (!fabricantId) return;
    const formData = form.produits[articleId] || {} as any;
    const details = [...(formData.detailprixfabricants || [])];
    const alreadyExists = details.some((d: any) => String(d.fabricant_id) === String(fabricantId));
    if (alreadyExists) return;
    details.push({ fabricant_id: fabricantId, prixunitaire: 0, devise_id: formData.devise_id });
    handleProduitChange(articleId, "detailprixfabricants", details);
    setSelectedFabricantToAdd((prev) => ({ ...prev, [articleId]: "" }));
  };

  const handleRemoveFabricant = (articleId: number, fabricantId: number) => {
    const lots = getLots(articleId);
    const isLinkedToLots = lots.some((lot: any) => String(lot.fabricant_id) === String(fabricantId));
    if (isLinkedToLots) return;
    const formData = form.produits[articleId] || {} as any;
    const details = [...(formData.detailprixfabricants || [])].filter(
      (d: any) => String(d.fabricant_id) !== String(fabricantId)
    );
    handleProduitChange(articleId, "detailprixfabricants", details);
  };


  const renderAccordionRow = (produit: any) => {
    const articleId = Number(produit.article.id);
    const formData = form.produits[articleId] || {} as any;
    const lots = getLots(articleId);
    const colCount = !["AOR", "Consultation", "Cotation", "Achat Direct"].includes(tender.typemarche?.designation) && (tender.TSSCOD_0_0 === "MED" || tender.TSSCOD_0_0 === null) ? 10 : 9;

    const detailFabricantIds = (formData.detailprixfabricants || [])
      .map((d: any) => d.fabricant_id)
      .filter((id: any) => id !== undefined && id !== null);
    const lotFabricantIds = lots
      .map((lot: any) => lot.fabricant_id)
      .filter((id: any) => id !== undefined && id !== null);
    const distinctFabricantIds = Array.from(
      new Set([...detailFabricantIds, ...lotFabricantIds].map((id) => String(id)))
    );
    const noFabricants = distinctFabricantIds.length === 0;
    const existingFabricantIdSet = new Set(distinctFabricantIds.map(String));
    const availableFabricants = fabricant.filter((f) => !existingFabricantIdSet.has(String(f.id)));
    const selectedAddFabricantId = selectedFabricantToAdd[articleId];
    const resolvedAddFabricantId = selectedAddFabricantId !== undefined && selectedAddFabricantId !== ""
      ? selectedAddFabricantId
      : availableFabricants[0]?.id;

    return (
      <tr key={`acc-${produit.id}`} style={{ background: '#f8fafc', borderBottom: '2px solid #1FB05B' }}>
        <td colSpan={colCount} style={{ padding: 0 }}>
          <div style={{ padding: '8px 16px 8px 40px' }}>
            {/* Fabricant pricing table */}
            <div style={{
              background: '#f1f5f9',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              padding: '10px 12px',
              marginTop: 4,
              marginBottom: 4
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <FaIndustry color="#1FB05B" size={13} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>Prix par fabricant</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {availableFabricants.length > 3 ? (
                    <SearchableSelect
                      options={availableFabricants.map((f) => ({
                        value: f.id,
                        label: f.designation
                      }))}
                      value={resolvedAddFabricantId ?? ""}
                      onChange={(value) => setSelectedFabricantToAdd((prev) => ({
                        ...prev,
                        [articleId]: value ? Number(value) : ""
                      }))}
                      placeholder={availableFabricants.length === 0 ? "Aucun fabricant dispo" : "Sélectionner un fabricant"}
                      disabled={availableFabricants.length === 0 || loadingFabricants}
                      style={{
                        borderRadius: '4px'
                      }}
                    />
                  ) : (
                    <select
                      value={resolvedAddFabricantId ?? ""}
                      onChange={(e) => setSelectedFabricantToAdd((prev) => ({
                        ...prev,
                        [articleId]: e.target.value ? Number(e.target.value) : ""
                      }))}
                      disabled={availableFabricants.length === 0 || loadingFabricants}
                      style={{
                        fontSize: 11,
                        padding: '3px 6px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        color: '#1e293b',
                        fontWeight: 600,
                        cursor: availableFabricants.length === 0 ? 'not-allowed' : 'pointer',
                        outline: 'none',
                        minWidth: 160
                      }}
                    >
                      {availableFabricants.length === 0 ? (
                        <option value="">Aucun fabricant dispo</option>
                      ) : (
                        availableFabricants.map((f) => (
                          <option key={f.id} value={f.id}>{f.designation}</option>
                        ))
                      )}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (resolvedAddFabricantId !== undefined) {
                        handleAddFabricant(articleId, Number(resolvedAddFabricantId));
                      }
                    }}
                    disabled={availableFabricants.length === 0 || loadingFabricants || resolvedAddFabricantId === undefined}
                    style={{
                      background: '#1FB05B',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: availableFabricants.length === 0 ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  >
                    <FaPlus size={10} /> Ajouter
                  </button>
                </div>
              </div>

              {noFabricants ? (
                <div style={{
                  textAlign: 'center',
                  padding: '16px',
                  color: '#6b7280',
                  background: '#ffffff',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 8,
                  fontSize: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  margin: '4px 0'
                }}>
                  <FaIndustry size={20} color="#94a3b8" />
                  <div style={{ fontWeight: 600, color: '#334155' }}>Aucun fabricant ajoute pour cet article.</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Ajoutez un fabricant pour renseigner les prix.</div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedArticleId(articleId);
                      setShowLotsManager(true);
                    }}
                    style={{
                      marginTop: 6,
                      background: '#e8f9f0',
                      color: '#1FB05B',
                      border: '1px solid #cfe9da',
                      borderRadius: 6,
                      padding: '4px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#d2f3e0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#e8f9f0'}
                  >
                    Gerer les specs
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {distinctFabricantIds.map((fabId) => {
                    const detail = (formData.detailprixfabricants || []).find((d: any) => String(d.fabricant_id) === String(fabId));
                    const currentPrixVal = detail?.prixunitaire;
                    const currentPrix = currentPrixVal !== undefined && currentPrixVal !== null ? String(currentPrixVal) : '';
                    const deviseForRow = detail?.devise_id ?? formData.devise_id ?? devises[0]?.id;
                    const deviseLabel = devises.find(d => d.id === deviseForRow)?.designation || '';

                    const lotsFabricant = lots.filter(
                      (lot: any) => String(lot.fabricant_id) === String(fabId)
                    );
                    const isLinkedToLots = lotsFabricant.length > 0;

                    return (
                      <div key={fabId} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '8px 12px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
                        transition: 'all 0.2s ease',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '240px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: '#e8f9f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#1FB05B',
                              flexShrink: 0
                            }}>
                              <FaIndustry size={11} />
                            </div>
                            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1, minWidth: 0 }}>
                              {getFabricantName(fabId)}
                            </span>
                          </div>

                          <div style={{ width: '120px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                            <select
                              value={deviseForRow || ''}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : null;
                                if (!value) return;
                                const prix = currentPrixVal !== undefined && currentPrixVal !== null ? currentPrixVal : 0;
                                handlePrixFabricantChange(articleId, Number(fabId), prix, value);
                              }}
                              style={{
                                fontSize: 11,
                                padding: '3px 6px',
                                borderRadius: 4,
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                color: '#1e293b',
                                fontWeight: 600,
                                cursor: 'pointer',
                                outline: 'none',
                                minWidth: 90
                              }}
                            >
                              {devises.map((d) => (
                                <option key={d.id} value={d.id}>{d.designation}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ width: '170px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                              <input
                                type="number"
                                min={0}
                                placeholder="0.00"
                                value={currentPrix}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const prix = val === '' ? 0 : parseFloat(val);
                                  handlePrixFabricantChange(articleId, Number(fabId), prix, deviseForRow);
                                }}
                                style={{
                                  width: '120px',
                                  textAlign: 'right',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  padding: '5px 8px',
                                  paddingRight: '40px',
                                  borderRadius: '6px',
                                  border: '1.5px solid',
                                  outline: 'none',
                                  color: '#1e293b',
                                  background: '#fff',
                                  transition: 'all 0.2s ease',
                                  borderColor: currentPrix !== '' ? '#1FB05B' : '#cbd5e1',
                                  boxShadow: currentPrix !== '' ? '0 0 0 2px rgba(31,176,91,0.04)' : 'none'
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#1FB05B';
                                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(31,176,91,0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = currentPrix !== '' ? '#1FB05B' : '#cbd5e1';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <span style={{
                                position: 'absolute',
                                right: '8px',
                                fontSize: '10px',
                                fontWeight: '700',
                                color: currentPrix !== '' ? '#1FB05B' : '#94a3b8',
                                textTransform: 'uppercase',
                                pointerEvents: 'none',
                                userSelect: 'none',
                              }}>
                                {deviseLabel}
                              </span>
                            </div>
                          </div>

                          <div style={{ width: '90px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveFabricant(articleId, Number(fabId))}
                              disabled={isLinkedToLots}
                              title={isLinkedToLots ? "Lie a des lots" : "Retirer"}
                              style={{
                                background: isLinkedToLots ? '#f8fafc' : '#fff5f5',
                                color: isLinkedToLots ? '#94a3b8' : '#e11d48',
                                border: `1px solid ${isLinkedToLots ? '#e2e8f0' : '#fecaca'}`,
                                borderRadius: 6,
                                padding: '4px 8px',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: isLinkedToLots ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                outline: 'none'
                              }}
                            >
                              <FaTrash size={10} /> Retirer
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      {selectedProduitForDelai && (
        <DelaiLivraisonModal
          show={showDelaiModal}
          onClose={() => { setShowDelaiModal(false); setSelectedProduitForDelai(null); }}
          onSave={saveDelaiLivraison}
          productName={tender.aoarticles.find((p: any) => Number(p.article.id) === selectedProduitForDelai)?.article.designation || ""}
          initialData={getDelaiData(selectedProduitForDelai)}
        />
      )}

      {showPricesModal && selectedArticleId !== null && selectedInfo && (
        <PricesModal
          show={showPricesModal}
          onClose={() => setShowPricesModal(false)}
          productName={selectedInfo.productName}
          prices={
            (selectedInfo.formData.detailprixfabricants || []).map((d: any) => {
              const deviseId = d.devise_id ?? selectedInfo.formData.devise_id ?? getDefaultDeviseId();
              return {
                fabricant_id: d.fabricant_id,
                fabricantName: d.fabricant_id ? getFabricantName(d.fabricant_id) : "—",
                prixunitaire: d.prixunitaire,
                devise: getDeviseLabel(deviseId)
              };
            })
          }
        />
      )}

      {showLotsManager && selectedArticleId !== null && selectedInfo && (
        <LotsManagerModal
          show={showLotsManager}
          onClose={() => { setShowLotsManager(false); setSelectedArticleId(null); }}
          productName={selectedInfo.productName}
          quantiteDisponible={selectedInfo.quantiteDisponible}
          lots={selectedInfo.lots}
          fabricants={fabricant}
          onAddLot={() => {
            setEditLotIdx(null);
            setShowLotFormModal(true);
          }}
          onEditLot={(index) => {
            setEditLotIdx(index);
            setShowLotFormModal(true);
          }}
          onDeleteLot={(index) => {
            if (handleDeleteLot) {
              handleDeleteLot(selectedArticleId, index);
            }
          }}
        />
      )}

      {showLotFormModal && selectedArticleId !== null && selectedInfo && (
        <LotModal
          show={showLotFormModal}
          onClose={() => setShowLotFormModal(false)}
          onSave={handleSaveLot}
          fabricant={fabricant}
          lot={editLotIdx !== null ? selectedInfo.lots[editLotIdx] : {
            lot: "",
            quantite: 0,
            fabricant_id: undefined,
            dateperemption: "",
            conditionnement_id: "",
            dureedevie: "",
            devise_id: selectedInfo.formData.devise_id
          }}
          productName={selectedInfo.productName}
          isEdit={editLotIdx !== null}
          loadingFabricants={loadingFabricants}
          errorFabricant={errorFabricant}
        />
      )}

      <div className="d-flex align-items-center" style={{ paddingBottom: "10px" }}>
        <h5 className="mb-0 d-flex align-items-center" style={{ color: "#1FB05B", paddingLeft: "15px", fontSize: "1.2rem" }}>
          <img src={doc_info_icon} alt="info" style={{ width: "20px", marginRight: "10px" }} />
          Détails de l'offre
          <FaLongArrowAltRight style={{ marginLeft: "5px" }} />
        </h5>
        <span className="ms-2" style={{ color: "#CBCBCB" }}>({filteredArticles.length}/{tender.aoarticles.length}) Articles</span>
        <div className="ms-auto" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1.5px solid #e2e8f0",
            padding: "0 12px",
            height: "36px",
            transition: "all 0.2s ease",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#1FB05B";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(31, 176, 91, 0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.02)";
          }}>
            <FaSearch size={14} color="#94a3b8" style={{ marginRight: 8, flexShrink: 0 }} />
            <input
              type="text"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              placeholder="Rechercher un article..."
              style={{
                border: "none",
                background: "transparent",
                fontSize: 13,
                color: "#1e293b",
                outline: "none",
                flex: 1,
                fontWeight: 500
              }}
            />
          </div>
        </div>
      </div>
      <div style={{ border: "1px solid #1FB05B", padding: "0px 10px", borderRadius: "5px" }}>
        <div className="form-container">
          <div className="table-container">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>Article</th>
                  {!["AOR", "Consultation", "Cotation", "Achat Direct"].includes(tender.typemarche?.designation) && (tender.TSSCOD_0_0 === "MED" || tender.TSSCOD_0_0 === null) && (
                    <th>Target Price{tender.targetpricestatus === 1 && <FaExclamationCircle style={{ marginLeft: "5px", animation: "colorChange 1s infinite" }} />}</th>
                  )}
                  <th>Qté demandée</th>
                  <th>Qté dispo</th>
                  <th>Prix proposé</th>
                  <th>Date livraison</th>
                  <th>Délai livraison</th>
                  <th>Incoterm</th>
                  {(tender.TSSCOD_0_0 === "MED" || tender.TSSCOD_0_0 === null) ? <th>Détails produit</th> : <th>Commentaire</th>}
                  <th>Sous-total</th>
                </tr>
              </thead>
              <style>{`@keyframes colorChange { 0% { color: white; } 50% { color: red; } 100% { color: white; } }`}</style>
              <tbody>
                {filteredArticles.map((produit: any) => {
                  const articleId = Number(produit.article.id);
                  const formData = form.produits[articleId] || {} as any;
                  const lots = getLots(articleId);
                  const lotsCount = lots.length;
                  const isOpen = !!openAccordions[articleId];
                  const sousTotal = (() => {
                    const details = formData.detailprixfabricants || [];
                    if (lots.length > 0 && details.length > 0) {
                      return lots.reduce((sum: number, lot: any) => {
                        const detail = details.find((d: any) => d.fabricant_id === lot.fabricant_id);
                        return sum + ((Number(lot.quantite) || 0) * (detail?.prixunitaire || 0));
                      }, 0);
                    }
                    if (details.length === 1) {
                      return (details[0].prixunitaire || 0) * (formData.quantiteDisponible || 0);
                    }
                    return 0;
                  })();

                  return (
                    <React.Fragment key={produit.id}>
                      <tr>
                        <td style={{ fontWeight: 500, color: '#2c3e50', cursor: 'pointer' }} onClick={() => toggleAccordion(articleId)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: isOpen ? '#1FB05B' : '#e8f9f0', transition: 'all 0.2s ease', flexShrink: 0,
                            }}>
                              {isOpen
                                ? <FaChevronDown size={10} color="white" />
                                : <FaChevronRight size={10} color="#1FB05B" />}
                            </div>
                            {produit.article.designation}
                          </div>
                        </td>
                        {!["AOR", "Consultation", "Cotation", "Achat Direct"].includes(tender.typemarche?.designation) && (tender.TSSCOD_0_0 === "MED" || tender.TSSCOD_0_0 === null) && (
                          <td>
                            <div className="target-price-cell">
                              <span>{convertFromMGA(produit.targetprice ?? 0, formData.devise_id).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                              <select className="devise-inline" value={formData.devise_id || ""} onChange={(e) => handleDeviseChangeGlobal(e.target.value ? Number(e.target.value) : null)}>
                                {devises.map((d) => <option key={d.id} value={d.id}>{d.designation}</option>)}
                              </select>
                              {produit.targetpricestatus === 1 && <FaExclamationCircle style={{ color: '#ff6b35', animation: "colorChange 1s infinite" }} />}
                            </div>
                          </td>
                        )}
                        <td><span className="chip">{(produit.quantite ?? 0).toLocaleString()}</span></td>
                        <td>
                          <input type="number" className="input-field" placeholder="0" min="0" max={produit.quantite}
                            value={formData.quantiteDisponible || ''}
                            onChange={(e) => handleProduitChange(articleId, "quantiteDisponible", parseInt(e.target.value) || 0)} />
                        </td>
                        <td>
                          <div style={{ fontWeight: "bold" }}>
                            {(() => {
                              const details = formData.detailprixfabricants || [];
                              if (details.length === 0) return <span>{"\u2014"}</span>;
                              if (details.length === 1) {
                                const d = details[0];
                                const deviseId = formData.devise_id ?? getDefaultDeviseId();
                                const deviseLabel = getDeviseLabel(deviseId);
                                const prixConverti = convertFromMGA(d.prixunitaire, deviseId);
                                return <span>{formatPrice(prixConverti)} <small>{deviseLabel}</small></span>;
                              }

                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedArticleId(articleId);
                                    togglePriceTable();
                                  }}
                                  style={{
                                    border: "1px solid #cbd5e1",
                                    background: "#ffffff",
                                    color: "#1e293b",
                                    borderRadius: 6,
                                    padding: "2px 6px",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    cursor: "pointer"
                                  }}
                                >
                                  Voir
                                </button>
                              );
                            })()}
                          </div>
                        </td>
                        <td>
                          <input type="date" className="input-field" onChange={(e) => handleProduitChange(articleId, "datelivraison", e.target.value)} />
                        </td>
                        <td>
                          {(() => {
                            const delaiData = getDelaiData(articleId);
                            return (
                              <button type="button" className={`btn-delai ${delaiData ? 'has-value' : ''}`} onClick={() => openDelaiModal(articleId)}>
                                {delaiData ? <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1FB05B' }}>Total: {delaiData.total} jours</div> : <span>Définir délai</span>}
                              </button>
                            );
                          })()}
                        </td>
                        <td>
                          <div className="button-container">
                            <div className="button-row">
                              <button type="button" className={`button ${formData.termeCommercial === "DDP" ? "button-active" : ""}`}
                                onClick={() => handleProduitTermeChange(articleId, "DDP")}>DDP</button>
                              <button type="button" className={`button ${formData.termeCommercial === "Autre" ? "button-warning" : ""}`}
                                onClick={() => handleProduitTermeChange(articleId, "Autre")}>commentaire</button>
                            </div>
                            {formData.termeCommercial === "Autre" && (
                              <input type="text" className="input-field" style={{ width: "7vw" }} placeholder="Saisir commentaire"
                                value={formData.commentaire || ""} onChange={(e) => handleProduitChange(articleId, "commentaire", e.target.value)} />
                            )}
                          </div>
                        </td>
                        {(tender.TSSCOD_0_0 === "MED" || tender.TSSCOD_0_0 === null) ? (
                          <td>
                            {lotsCount > 0 ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedArticleId(articleId);
                                  setShowLotsManager(true);
                                }}
                                style={{
                                  background: '#e8f9f0',
                                  color: '#1FB05B',
                                  border: 'none',
                                  borderRadius: 20,
                                  padding: '4px 12px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#d2f3e0';
                                  e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#e8f9f0';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                {lotsCount} spec{lotsCount > 1 ? 's' : ''} <FaEdit size={11} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedArticleId(articleId);
                                  setShowLotsManager(true);
                                }}
                                style={{
                                  background: 'transparent',
                                  color: '#1FB05B',
                                  border: '1.5px dashed #1FB05B',
                                  borderRadius: 6,
                                  padding: '3px 10px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#e8f9f0';
                                  e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <FaPlus size={9} /> Configurer
                              </button>
                            )}
                          </td>
                        ) : (
                          <td>
                            <input type="text" className="input-field" style={{ width: "7vw" }} placeholder="Saisir commentaire"
                              value={formData.commentaire || ""} onChange={(e) => handleProduitChange(articleId, "commentaire", e.target.value)} />
                          </td>
                        )}
                        <td className="sous-total" style={{
                          color: !["AOR", "Consultation", "Cotation", "Achat Direct"].includes(tender.typemarche?.designation) && formData.devise_id === null &&
                            sousTotal > (produit.targetprice || 0) * Math.min(formData.quantiteDisponible || 0, produit.quantite || 0)
                            ? "#ff6b35" : "#1FB05B",
                        }}>
                          {(() => {
                            const sousTotalFinal = formData.termeCommercial === "Autre" ? sousTotal * (produit.coeff || 1) : sousTotal;
                            const deviseLabel = devises.find(d => d.id === formData.devise_id)?.designation || "";
                            return <div><span style={{ fontWeight: 600 }}>{sousTotalFinal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <small style={{ fontSize: '0.75rem' }}>{deviseLabel}</small></span></div>;
                          })()}
                        </td>
                      </tr>
                      {isOpen && renderAccordionRow(produit)}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={1} style={{ textAlign: 'left', fontWeight: 600 }}>Total de l'offre</td>
                  {!["AOR", "Consultation", "Cotation", "Achat Direct"].includes(tender.typemarche?.designation) && (tender.TSSCOD_0_0 === "MED" || tender.TSSCOD_0_0 === null) && <td></td>}
                  <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  <td className="total-value" style={{ textAlign: 'center' }}>
                    {(() => {
                      const total = calculerTotal();
                      const firstProduitId = tender.aoarticles[0]?.article?.id;
                      const globalDeviseId = firstProduitId ? form.produits[Number(firstProduitId)]?.devise_id : null;
                      const deviseLabel = devises.find(d => d.id === globalDeviseId)?.designation || "";
                      return <div><span style={{ fontWeight: 700, fontSize: '1rem' }}>{total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <small style={{ fontSize: '0.75rem', fontWeight: 500 }}>{deviseLabel}</small></span></div>;
                    })()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesTab;
