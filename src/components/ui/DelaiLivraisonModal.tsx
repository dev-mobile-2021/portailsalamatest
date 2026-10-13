import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaTimes, FaCalculator } from "react-icons/fa";

export interface DelaiLivraisonData {
  production: number;
  acheminement: number;
  dedouanement: number;
  total: number;
}

interface DelaiLivraisonModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: DelaiLivraisonData) => void;
  productName?: string;
  initialData?: DelaiLivraisonData;
}

const DelaiLivraisonModal: React.FC<DelaiLivraisonModalProps> = ({
  show,
  onClose,
  onSave,
  productName,
  initialData,
}) => {
  const [formData, setFormData] = useState<DelaiLivraisonData>({
    production: 0,
    acheminement: 0,
    dedouanement: 0,
    total: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        production: 0,
        acheminement: 0,
        dedouanement: 0,
        total: 0,
      });
    }
  }, [initialData, show]);

  // Calculer automatiquement le total
  useEffect(() => {
    const total = formData.production + formData.acheminement + formData.dedouanement;
    setFormData((prev) => ({ ...prev, total }));
  }, [formData.production, formData.acheminement, formData.dedouanement]);

  const handleChange = (field: keyof Omit<DelaiLivraisonData, 'total'>, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({ ...prev, [field]: numValue >= 0 ? numValue : 0 }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const modalTitle = "Délai de livraison";
  const modalSubtitle = "Ventilation des délais par étape";

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header style={{ 
        backgroundColor: '#f8fdf9', 
        borderBottom: '2px solid #1FB05B',
        padding: '20px 24px'
      }}>
        <div style={{ flex: 1 }}>
          <Modal.Title style={{ 
            color: '#1FB05B', 
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            {modalTitle}
          </Modal.Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ 
              margin: 0, 
              color: '#6b7280', 
              fontSize: '0.813rem',
              fontWeight: '500'
            }}>
              {modalSubtitle}
            </p>
            {productName && (
              <p style={{ 
                margin: 0, 
                color: '#1FB05B', 
                fontSize: '0.875rem',
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

      <Modal.Body style={{ padding: '24px' }}>
        <Form>
          {/* Production */}
          <Form.Group className="mb-4">
            <Form.Label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
               
              Production (jours)
            </Form.Label>
            <Form.Control
              type="number"
              value={formData.production || ""}
              min="0"
              onChange={(e) => handleChange('production', e.target.value)}
              placeholder="Nombre de jours"
              style={{
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                padding: '10px 14px',
                fontSize: '0.875rem',
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
            <Form.Text className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Temps de fabrication et préparation
            </Form.Text>
          </Form.Group>
          
          {/* Acheminement */}
          <Form.Group className="mb-4">
            <Form.Label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
               Acheminement (jours)
            </Form.Label>
            <Form.Control
              type="number"
              value={formData.acheminement || ""}
              min="0"
              onChange={(e) => handleChange('acheminement', e.target.value)}
              placeholder="Nombre de jours"
              style={{
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                padding: '10px 14px',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f57c00';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,124,0,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <Form.Text className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Transport et livraison
            </Form.Text>
          </Form.Group>
          
          {/* Dédouanement */}
          <Form.Group className="mb-4">
            <Form.Label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
               
              Dédouanement (jours)
            </Form.Label>
            <Form.Control
              type="number"
              value={formData.dedouanement || ""}
              min="0"
              onChange={(e) => handleChange('dedouanement', e.target.value)}
              placeholder="Nombre de jours"
              style={{
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                padding: '10px 14px',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1976d2';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <Form.Text className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Procédures douanières et administratives
            </Form.Text>
          </Form.Group>
          
          {/* Total - Affichage récapitulatif */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #1FB05B',
            borderRadius: '12px',
            padding: '16px 20px',
            marginTop: '8px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#1FB05B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaCalculator style={{ color: 'white', fontSize: '1rem' }} />
                </div>
                <div>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '0.875rem'
                  }}>
                    DÉLAI TOTAL
                  </p>
                  <p style={{ 
                    margin: 0, 
                    color: '#6b7280', 
                    fontSize: '0.75rem'
                  }}>
                    Délai estimé de livraison
                  </p>
                </div>
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1FB05B'
              }}>
                {formData.total} <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>jours</span>
              </div>
            </div>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer style={{ 
        backgroundColor: '#f9fafb', 
        borderTop: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <Button
          variant="outline-secondary"
          onClick={onClose}
          style={{
            borderRadius: '8px',
            padding: '10px 24px',
            fontWeight: '500',
            fontSize: '0.875rem',
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
          onClick={handleSubmit}
          style={{
            borderRadius: '8px',
            padding: '10px 24px',
            fontWeight: '500',
            fontSize: '0.875rem',
            backgroundColor: '#1FB05B',
            border: 'none',
            color: 'white',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#18a04b';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(31,176,91,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1FB05B';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Enregistrer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DelaiLivraisonModal;
