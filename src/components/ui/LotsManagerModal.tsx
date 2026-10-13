import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { LotData } from "./LotModal";


export interface LotsManagerModalProps {
  show: boolean;
  onClose: () => void;
  productName: string;
  quantiteDisponible: number;
  lots: LotData[];
  fabricants: Array<{ id: number; designation: string }>;
  onAddLot: () => void;
  onEditLot: (index: number) => void;
  onDeleteLot: (index: number) => void;
}

const LotsManagerModal: React.FC<LotsManagerModalProps> = ({
  show, onClose, productName, quantiteDisponible, lots, fabricants, 
  onAddLot, onEditLot, onDeleteLot
}) => {
  
  // 1. Groupement des lots par Fabricant
  const lotsGroupedByFabricant = lots.reduce((acc, lot, originalIndex) => {
    const fabId = lot.fabricant_id || 'inconnu';
    if (!acc[fabId]) acc[fabId] = [];
    acc[fabId].push({ ...lot, originalIndex }); // conservation de l'index
    return acc;
  }, {} as Record<string, (LotData & { originalIndex: number })[]>);

  const fabricantIds = Object.keys(lotsGroupedByFabricant);
  const isMultipleFabricants = fabricantIds.length > 1;

  // 2. Compteurs
  const qteSaisie = lots.reduce((sum, lot) => sum + (lot.quantite || 0), 0);
  const restant = quantiteDisponible - qteSaisie;
  const isOverLimit = qteSaisie > quantiteDisponible;
  const isExact = qteSaisie === quantiteDisponible;

  // 3. Gestion Accordéons
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    if (fabricantIds.length > 0) {
      initialState[fabricantIds[0]] = true; // Toujours ouvrir le 1er par défaut
    }
    return initialState;
  });

  const toggleAccordion = (fabId: string) => {
    setOpenAccordions(prev => ({ ...prev, [fabId]: !prev[fabId] }));
  };


  return (
    <Modal show={show} onHide={onClose} size="lg" centered scrollable>
      {/* ┌─ Header ─────────────────────────────────────────┐ */}
      <Modal.Header style={{ backgroundColor: 'var(--color-background-secondary, #f9fafb)', borderBottom: '0.5px solid var(--color-border-tertiary, #e5e7eb)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, paddingRight: '16px' }}>
          <Modal.Title style={{ color: '#1FB05B', fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
            Gestion des specs 
          </Modal.Title>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', fontWeight: '500' }}>{productName}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><FaTimes size={18} color="#6b7280" /></button>
        </div>
      </Modal.Header>

      {/* ├─ Barre quantité ──────────────────────────────────┤ */}
      <div style={{ backgroundColor: '#ffffff', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid var(--color-border-tertiary, #e5e7eb)', fontSize: '13px', fontWeight: '500' }}>
        <span style={{ color: '#4b5563' }}>Qté disponible : <strong>{quantiteDisponible.toLocaleString()}</strong></span>
        <span style={{ color: isOverLimit ? '#dc2626' : (isExact ? '#1FB05B' : '#4b5563') }}>
          Qté saisie : <strong>{qteSaisie.toLocaleString()}</strong> / {quantiteDisponible.toLocaleString()}
        </span>
        <span style={{ color: restant < 0 ? '#dc2626' : '#4b5563' }}>
          Restant : <strong>{restant.toLocaleString()}</strong>
        </span>
      </div>

      <Modal.Body style={{ padding: '16px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* ├─ Corps (Groupes Fabricant) ──────────────────────┤ */}
          {fabricantIds.length > 0 ? (
            fabricantIds.map((fabId) => {
              const fabLots = lotsGroupedByFabricant[fabId];
              const fabInfo = fabricants.find(f => String(f.id) === fabId);
              const fabName = fabInfo?.designation || 'Fabricant Inconnu';
              
              const isOpen = !isMultipleFabricants || !!openAccordions[fabId];
              const totalFabQuantite = fabLots.reduce((sum, lot) => sum + (lot.quantite || 0), 0);

              return (
                <div key={fabId} style={{ border: '0.5px solid var(--color-border-tertiary, #e5e7eb)', borderRadius: 'var(--border-radius-md, 8px)', overflow: 'hidden' }}>
                  
                  {/* En-tête du groupe (Accordéon) */}
                  <div 
                    onClick={() => isMultipleFabricants && toggleAccordion(fabId)} 
                    style={{ 
                      backgroundColor: 'var(--color-background-secondary, #f9fafb)', 
                      padding: '8px 12px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      borderBottom: isOpen ? '0.5px solid var(--color-border-tertiary, #e5e7eb)' : 'none',
                      cursor: isMultipleFabricants ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {isMultipleFabricants && (isOpen ? <FaChevronUp size={12} color="#6b7280" /> : <FaChevronDown size={12} color="#6b7280" />)}
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{fabName}</span>
                      <span style={{ backgroundColor: '#e8f9f0', color: '#1FB05B', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: '500' }}>
                        {fabLots.length} lot{fabLots.length > 1 ? 's' : ''} · {totalFabQuantite} unités
                      </span>
                    </div>

                  </div>

                  {/* Tableau des lots */}
                  {isOpen && (
                    <div style={{ padding: '0px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ backgroundColor: '#ffffff' }}>
                          <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', textAlign: 'left', height: '28px' }}>
                            <th style={{ padding: '2px 8px', width: '10%' }}>#</th>
                            <th style={{ padding: '2px 8px', width: '30%', textAlign: 'center' }}>Qté</th>
                            <th style={{ padding: '2px 8px', width: '40%', textAlign: 'center' }}>Expiration</th>
                            <th style={{ padding: '2px 8px', width: '20%', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fabLots.map((lot, idx) => {
                            const isExpired = lot.dateperemption && new Date(lot.dateperemption) < new Date();
                            return (
                              <tr key={lot.originalIndex} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#ffffff', height: '28px' }}>
                                <td style={{ padding: '2px 8px', color: '#6b7280' }}>{idx + 1}</td>
                                <td style={{ padding: '2px 8px', color: '#374151', textAlign: 'center' }}>{lot.quantite || 0}</td>
                                <td style={{ padding: '2px 8px', color: isExpired ? '#dc2626' : '#374151', textAlign: 'center' }}>
                                  {lot.dateperemption ? new Date(lot.dateperemption).toLocaleDateString('fr-FR') : '-'}
                                </td>
                                <td style={{ padding: '2px 8px', textAlign: 'right' }}>
                                  <button type="button" onClick={() => onEditLot(lot.originalIndex)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', marginRight: '10px', padding: '0' }} title="Modifier"><FaEdit size={12}/></button>
                                  <button type="button" onClick={() => onDeleteLot(lot.originalIndex)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0' }} title="Supprimer"><FaTrash size={12}/></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
             <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '8px' }}>
               <p style={{ fontSize: '14px', margin: 0 }}>Aucune spec définie. Cliquez sur Ajouter pour commencer.</p>
             </div>
          )}

          {/* Bouton Ajouter */}
          <button type="button" onClick={onAddLot} style={{ alignSelf: 'flex-start', padding: '4px 12px', background: 'none', border: 'none', color: '#1FB05B', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '13px' }}>
            <FaPlus size={12} style={{ marginRight: '6px' }} /> Ajouter une nouvelle spec
          </button>
        </div>
      </Modal.Body>

      {/* ├─ Footer ───────────────────────────────────────────┤ */}
      <Modal.Footer style={{ borderTop: '0.5px solid var(--color-border-tertiary, #e5e7eb)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--color-background-secondary, #f9fafb)' }}>
        <button type="button" onClick={onClose} style={{ padding: '6px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', color: '#374151', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
          Annuler
        </button>
        <button 
          type="button" 
          onClick={onClose} 
          disabled={isOverLimit}
          style={{ 
            padding: '6px 16px', 
            backgroundColor: '#1FB05B', 
            border: 'none', 
            borderRadius: '6px', 
            color: 'white', 
            fontSize: '14px', 
            fontWeight: '500', 
            cursor: isOverLimit ? 'not-allowed' : 'pointer',
            opacity: isOverLimit ? 0.5 : 1
          }}>
          Enregistrer
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default LotsManagerModal;
