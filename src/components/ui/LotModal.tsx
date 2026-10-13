import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaTimes, FaBox, FaIndustry, FaCalendarAlt, FaClock } from "react-icons/fa";
import { Fabricant } from "../../types/AO.types";
import CreateFabricantModal from "./CreateFabricantModal";
import SearchableSelect from "./SearchableSelect";
import useConditionnements from "../../hooks/useConditionnements";

export interface LotData {
  id?: string; // ID interne pour React
  lot?: string; // Référence du lot (ex: LOT-001)
  quantite: number;
  fabricant_id?: number;
  dateperemption: string;
  conditionnement_id?: string;
  dureedevie?: string;
  devise_id?: number;
}

interface LotModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (lot: LotData) => void;
  fabricant: Array<Fabricant>;
  lot: LotData;
  productName?: string;
  isEdit: boolean;
  loadingFabricants?: boolean;
  errorFabricant?: string | null;
}

const LotModal: React.FC<LotModalProps> = ({
  show,
  onClose,
  onSave,
  fabricant,
  lot: initialLot,
  productName,
  isEdit,
  loadingFabricants = false,
  errorFabricant = null
}) => {
  // Générer un nom unique pour nouveau lot si pas d'edit
  const generateUniqueLotName = () => {
    return `L${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const initializeLot = () => {
    if (isEdit) {
      return initialLot;
    }
    return {
      ...initialLot,
      lot: initialLot.lot || generateUniqueLotName()
    };
  };

  const [lot, setLot] = useState<LotData>(initializeLot());
  
  // Hook pour récupérer les conditionnements
  const { conditionnements, loading: loadingConditionnements, error: errorConditionnements } = useConditionnements();
  
  // État pour le modal de création de fabricant
  const [showFabricantModal, setShowFabricantModal] = useState(false);
  const [newFabricant, setNewFabricant] = useState<{
    nom: string;
    type: string;
    email: string;
    telephone: string;
    siteweb?: string;
    statut: string;
  }>({
    nom: "",
    type: "Local",
    email: "",
    telephone: "",
    siteweb: "",
    statut: "Aucune",
  });

  // Mise à jour du lot local quand le lot initial change
  useEffect(() => {
    setLot(initialLot);
  }, [initialLot, isEdit]);
  
  // Callback pour création fabricant
  const handleCreateFabricant = () => {
    // TODO: Envoyer à l'API et actualiser la liste des fabricants
    setShowFabricantModal(false);
    setNewFabricant({
      nom: "",
      type: "Local",
      email: "",
      telephone: "",
      siteweb: "",
      statut: "Aucune",
    });
  };

  // Handler pour les changements des champs
  const handleChange = (field: keyof LotData, value: any) => {
    setLot({
      ...lot,
      [field]: field === 'quantite' || field === 'fabricant_id' 
        ? (parseInt(value) || 0) 
        : value
    });
  };

  // Handler pour la sauvegarde
  const handleSave = () => {
    onSave(lot);
  };

  const modalTitle = isEdit ? "Modifier une Spec" : "Ajouter une Spec";
  const modalSubtitle = isEdit ? "Modification des informations de la Spec" : "Création d'une nouvelle Spec";

  return (
    <Modal show={show} onHide={onClose} centered>
      {/* Modal pour création fabricant */}
      <CreateFabricantModal
        show={showFabricantModal}
        onClose={() => setShowFabricantModal(false)}
        onCreate={handleCreateFabricant}
        newFabricant={newFabricant}
        setNewFabricant={setNewFabricant}
      />
      
      <Modal.Header style={{ 
        backgroundColor: '#f8fdf9', 
        borderBottom: '2px solid #1FB05B',
        padding: '12px 16px'
      }}>
        <div style={{ flex: 1 }}>
          <Modal.Title style={{ 
            color: '#1FB05B', 
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            {modalTitle}
          </Modal.Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ 
              margin: 0, 
              color: '#6b7280', 
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {modalSubtitle}
            </p>
            {productName && (
              <p style={{ 
                margin: 0, 
                color: '#1FB05B', 
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {productName}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <FaTimes size={20} />
        </button>
      </Modal.Header>

      <Modal.Body style={{ padding: '16px' }}>
        <Form>
          {/* Référence Lot */}
          <Form.Group className="mb-3">
            <Form.Label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaBox style={{ color: '#1FB05B' }} />
              Référence du lot 
            </Form.Label>
            <Form.Control
              type="text"
              value={lot.lot || ""}
              onChange={(e) => handleChange('lot', e.target.value)}
              placeholder="Ex: LOT-001"
              style={{
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                padding: '8px 10px',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease'
              }}
            />
          </Form.Group>

          {/* Quantité */}
          <Form.Group className="mb-3">
            <Form.Label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaBox style={{ color: '#1FB05B' }} />
              Quantité <span style={{ color: '#dc2626' }}>*</span>
            </Form.Label>
            <Form.Control
              type="number"
              value={lot.quantite || ""}
              min="1"
              onChange={(e) => handleChange('quantite', e.target.value)}
              placeholder="Saisir la quantité"
              style={{
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                padding: '8px 10px',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1FB05B';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,176,91,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </Form.Group>
          
          {/* Conditionnement */}
          <Form.Group className="mb-3">
            <Form.Label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaBox style={{ color: '#1FB05B' }} />
              Conditionnement
            </Form.Label>
            {conditionnements.length >= 5 ? (
              <SearchableSelect
                options={conditionnements.map((c) => ({
                  value: c.id,
                  label: c.designation
                }))}
                value={lot.conditionnement_id || ""}
                onChange={(value) => handleChange('conditionnement_id', value)}
                placeholder="Sélectionner un conditionnement"
                disabled={loadingConditionnements}
                style={{
                  borderRadius: '8px'
                }}
              />
            ) : (
              <Form.Select
                value={lot.conditionnement_id || ""}
                onChange={(e) => handleChange('conditionnement_id', e.target.value)}
                disabled={loadingConditionnements}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: loadingConditionnements ? '#f9fafb' : 'white'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1FB05B';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,176,91,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="">
                  {loadingConditionnements ? "Chargement..." : "Sélectionner un conditionnement"}
                </option>
                {errorConditionnements && (
                  <option value="" disabled>
                    {errorConditionnements}
                  </option>
                )}
                {conditionnements.map((conditionnement) => (
                  <option key={conditionnement.id} value={conditionnement.id}>
                    {conditionnement.designation}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
          
          {/* Fabricant */}
          <Form.Group className="mb-3">
            <Form.Label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaIndustry style={{ color: '#1FB05B' }} />
              Fabricant
            </Form.Label>
            {fabricant.length >= 5 ? (
              <SearchableSelect
                options={fabricant.map((f) => ({
                  value: f.id,
                  label: f.designation
                }))}
                value={lot.fabricant_id || ""}
                onChange={(value) => handleChange('fabricant_id', value)}
                placeholder="Sélectionner un fabricant"
                disabled={loadingFabricants}
                style={{
                  borderRadius: '8px'
                }}
              />
            ) : (
              <Form.Select
                value={lot.fabricant_id || ""}
                onChange={(e) => {
                  if (e.target.value === "autre") {
                    setShowFabricantModal(true);
                  } else {
                    handleChange('fabricant_id', e.target.value);
                  }
                }}
                disabled={loadingFabricants}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: loadingFabricants ? '#f9fafb' : 'white'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1FB05B';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,176,91,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="">
                  {loadingFabricants ? "Chargement..." : "Sélectionner un fabricant"}
                </option>
                {errorFabricant && (
                  <option value="" disabled>
                    {errorFabricant}
                  </option>
                )}
                {fabricant.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.designation}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
          
          {/* Durée de vie */}
          <Form.Group className="mb-3">
            <Form.Label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaClock style={{ color: '#1FB05B' }} />
              Durée de vie
            </Form.Label>
            <Form.Control
              type="text"
              value={lot.dureedevie || ""}
              onChange={(e) => handleChange('dureedevie', e.target.value)}
              placeholder="Ex: 12 mois, 2 ans..."
              style={{
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                padding: '8px 10px',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1FB05B';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,176,91,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </Form.Group>
          
          {/* Date de péremption */}
          <Form.Group className="mb-0">
            <Form.Label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaCalendarAlt style={{ color: '#dc2626' }} />
              Date d'expiration
            </Form.Label>
            <Form.Control
              type="date"
              value={lot.dateperemption || ""}
              onChange={(e) => handleChange('dateperemption', e.target.value)}
              style={{
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                padding: '8px 10px',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#dc2626';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer style={{ 
        backgroundColor: '#f9fafb', 
        borderTop: '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <Button
          variant="outline-secondary"
          onClick={onClose}
          style={{
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: '500',
            fontSize: '0.8rem',
            border: '1px solid #d1d5db',
            color: '#6b7280',
            backgroundColor: 'white',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          disabled={!lot.quantite || lot.quantite <= 0}
          style={{
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: '500',
            fontSize: '0.8rem',
            backgroundColor: lot.quantite && lot.quantite > 0 ? '#1FB05B' : '#d1d5db',
            border: 'none',
            color: 'white',
            transition: 'all 0.2s ease',
            cursor: lot.quantite && lot.quantite > 0 ? 'pointer' : 'not-allowed'
          }}
          onMouseEnter={(e) => {
            if (lot.quantite && lot.quantite > 0) {
              e.currentTarget.style.backgroundColor = '#18a04b';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(31,176,91,0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (lot.quantite && lot.quantite > 0) {
              e.currentTarget.style.backgroundColor = '#1FB05B';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {isEdit ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LotModal;