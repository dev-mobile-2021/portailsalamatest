import React, { useState } from "react";
import { Modal, Button, Nav, Tab } from "react-bootstrap";
import { FaComment, FaFile, FaCheck, FaTimes } from "react-icons/fa";
import DocumentsSpecifier from "../UploadDocument";

interface ActionModalProps {
  show: boolean;
  onClose: () => void;
  onSaveComment: (comment: string) => void;
  onFileUpload: (documentId: string, files: File | File[]) => void;
  onFileReset: (documentId: string) => void;
  initialComment: string;
  productName: string;
  productId: string;
  uploadedDocs: Record<string, File[]>;
  hasUploadedFiles: boolean;
}

const ActionModal: React.FC<ActionModalProps> = ({
  show,
  onClose,
  onSaveComment,
  onFileUpload,
  onFileReset,
  initialComment,
  productName,
  productId,
  uploadedDocs,
  hasUploadedFiles
}) => {
  const [activeTab, setActiveTab] = useState<string>("comment");
  const [comment, setComment] = useState(initialComment);

  const handleSave = () => {
    if (activeTab === "comment") {
      onSaveComment(comment);
    }
    onClose();
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose}
      centered
      size="lg"
      backdrop="static"
    >
      <Modal.Header className="bg-light">
        <Modal.Title className="fs-5">
          Actions pour {productName}
        </Modal.Title>
        <Button variant="light" onClick={onClose} className="btn-sm ms-auto">
          <FaTimes />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-0">
        <Tab.Container id="action-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || "comment")}>
          <Nav variant="tabs" className="border-bottom">
            <Nav.Item>
              <Nav.Link eventKey="comment" className="d-flex align-items-center gap-2">
                <FaComment /> Commentaire
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="file" className="d-flex align-items-center gap-2">
                <FaFile /> Spécifications Techniques
                {hasUploadedFiles && (
                  <FaCheck size={12} className="text-success" />
                )}
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="comment" className="p-3">
              <div className="mb-3">
                <label htmlFor="comment" className="form-label">Commentaire sur {productName}</label>
                <textarea
                  id="comment"
                  className="form-control"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder="Saisir votre commentaire..."
                ></textarea>
              </div>
            </Tab.Pane>
            <Tab.Pane eventKey="file" className="p-3">
              <div className="mb-3">
                <h6 className="mb-3">Spécifications techniques pour {productName}</h6>
                <DocumentsSpecifier
                  documents={[{ 
                    id: productId, 
                    name: "Spécifications techniques", 
                    uploaded: hasUploadedFiles,
                    uploadedFiles: uploadedDocs[productId] || []
                  }]}
                  title="Joindre les spécifications techniques"
                  onFileUpload={(id, files) => onFileUpload(id, files)}
                  onFileReset={(id) => onFileReset(id)}
                />
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="success" onClick={handleSave}>
          {activeTab === "comment" ? "Enregistrer" : "Fermer"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActionModal;