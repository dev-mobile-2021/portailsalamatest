import React from "react";
import add_doc_icon from "../assets/images/add_doc_icon.png";

// Types TypeScript
interface Document {
  id: string;
  name: string;
  uploaded: boolean;
  uploadedFiles?: File[];
  file?: File | null;
}

interface DocumentsSpecifierProps {
  documents?: Document[];
  onFileUpload?: (documentId: string, file: File | File[]) => void;
  onFileReset?: (documentId: string) => void;
  title?: string;
  acceptedFileTypes?: string;
}

const DocumentsSpecifier: React.FC<DocumentsSpecifierProps> = ({
  documents = [],
  onFileUpload,
  onFileReset,
  acceptedFileTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
}) => {
  // Documents par défaut si aucun n'est fourni
  const defaultDocuments: Document[] = [
 
  ];

  const documentsToDisplay = documents.length > 0 ? documents : defaultDocuments;

  const handleFileUpload = (
    documentId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      if (onFileUpload) {
        onFileUpload(documentId, files);
      } else {
        console.log(`Fichiers uploadés pour ${documentId}:`, files.map(f => f.name));
      }
    }
    // Réinitialiser la valeur de l'input pour permettre de sélectionner le même fichier
    // après un reset (sinon le navigateur ne déclenche pas onChange)
    event.target.value = "";
  };

  const handleReset = (documentId: string) => {
    if (onFileReset) {  
      onFileReset(documentId);
    }
  };

  return (
    <div className="container-fluid ">
      {/* Grille de documents ou message d'absence */}
      {documentsToDisplay.length === 0 ? (
        <div className="text-center   mt-5">
          <img src={add_doc_icon} alt="Aucun document" style={{ height: "3rem", opacity: 0.5 }} />
          <h5 className="mt-3 text-muted">Aucun document à ajouter</h5>
        </div>
      ) : (
        <div className="row ">
          {documentsToDisplay.map((doc) => (
            <div key={doc.id} 
            

             
            className={`${
      documentsToDisplay.length === 1
        ? "col-md-4 " // Prend toute la largeur si un seul élément
        : "col-12 col-sm-6 col-md-4 col-lg-2"     
        }`}
            
            style={{
              marginBottom: '10vh'
            }}>
              {/* Card avec zone de drop */}
              <div
                className="card h-100 mb-3 position-relative"
                style={{
                  border: "2px dashed #e0e0e0", 
                  borderRadius: "12px",
                  backgroundColor: "#fafafa",
                  minHeight: "10vh"
                }}
              >
                {/* Badge ou icône si déjà uploadé */}
                {doc.uploaded && (
                  <span
                    className="badge bg-success position-absolute"
                    style={{ top: 10, right: 10, fontSize: "0.85rem", padding: "6px 12px", borderRadius: "8px" }}
                  >
                    <i className="fas fa-check-circle me-1"></i> Uploadé
                  </span>
                )}
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-3">
                  {/* Zone de drop */}
                  <div>
                    <p className=" text-muted mb-2">
                      Glissez et déposez les fichiers ici
                    </p>

                    {/* Icône document */}
                    <div className="mx-auto  d-flex align-items-center justify-content-center">
                      {/* Remplacez par votre icône */}
                      <img
                        src={add_doc_icon}
                        alt="ajouter un document"
                        style={{ height: "2rem" }}
                      />

                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bouton upload séparé */}
              <div className="w-100 ">
                <label
                  htmlFor={`file-${doc.id}`}
                  className={`btn w-100 d-flex align-items-center justify-content-center gap-2 ${doc.uploaded ? "btn-outline-success" : "btn-success"}`}
                  style={{
                    borderRadius: "8px",
                    padding: "12px 10px",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  <i className={doc.uploaded ? "fas fa-check" : "fas fa-plus"} style={{ fontSize: "14px" }}></i>
                  {doc.name}
                
                </label>
                <input
                  id={`file-${doc.id}`}
                  type="file"
                  className="d-none"
                  onChange={(e) => handleFileUpload(doc.id, e)}
                  accept={acceptedFileTypes}
                  multiple
                />
              </div>
              
              {/* Section pour les fichiers uploadés */}
              {doc.uploadedFiles && doc.uploadedFiles.length > 0 && (
                <div className="mt-2 text-center">
                   
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm mt-1"
                    onClick={() => handleReset(doc.id)}
                    style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                  >
                      <i className="fas fa-trash me-1"></i>
                    Retirer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsSpecifier;