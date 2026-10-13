import React, { useState, useEffect } from "react";

interface CommentaireModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (commentaire: string) => void;
  initialCommentaire: string;
  productName?: string;
}

const CommentaireModal: React.FC<CommentaireModalProps> = ({
  show,
  onClose,
  onSave,
  initialCommentaire,
  productName
}) => {
  const [commentaire, setCommentaire] = useState<string>(initialCommentaire);

  // Réinitialiser le commentaire quand le modal est ouvert avec une nouvelle valeur
  useEffect(() => {
    setCommentaire(initialCommentaire);
  }, [initialCommentaire, show]);

  // Handler pour la sauvegarde
  const handleSave = () => {
    onSave(commentaire);
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header" style={{ backgroundColor: '#1FB05B', color: 'white' }}>
            <h5 className="modal-title">Commentaire{productName ? ` - ${productName}` : ''}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="commentaire" className="form-label">Saisir votre commentaire :</label>
              <textarea
                id="commentaire"
                className="form-control"
                rows={5}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Entrez votre commentaire ici..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="button" className="btn btn-success" onClick={handleSave}>Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentaireModal;