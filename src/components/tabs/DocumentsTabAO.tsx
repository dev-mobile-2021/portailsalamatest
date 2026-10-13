import React from "react";
import doc_info_icon from "../../assets/images/doc_info_icon.png";
import DocumentsSpecifier from "../UploadDocument";
import { AO, Attachment } from "../../types/AO.types";
import { OffreTransportDocSpecifi } from "../../types/OffreTransport.types";

interface DocumentsTabProps {
  tender: AO & {
    offretransportdocspecifis?: OffreTransportDocSpecifi[];
  };
  uploadedDocs: Record<string, File[]>; // Changed to store files array per document
  setUploadedDocs: React.Dispatch<React.SetStateAction<Record<string, File[]>>>;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  tender,
  uploadedDocs,
  setUploadedDocs
}) => {

  const documentsFromOffreTransport = Array.isArray(tender.offretransportdocspecifis)
    ? tender.offretransportdocspecifis
        .filter((doc) => {
          const etat = doc?.documentspecification?.etatetexte;
          return !etat || etat === "A la soumission";
        })
        .map((doc, idx) => {
          const id = String(doc.id ?? idx);
          return {
            id,
            name:
              doc.documentspecification?.designation ??
              doc.designation ??
              `Document ${idx + 1}`,
            uploaded: !!(uploadedDocs[id] && uploadedDocs[id].length > 0),
            uploadedFiles: uploadedDocs[id] || [],
          };
        })
    : [];

  const documentsFromAttachments = Array.isArray(tender.attachments)
    ? tender.attachments
        .filter(
          (doc: Attachment) =>
            doc.isannexe === 1 &&
            doc.documentspecification?.etatetexte === "A la soumission"
        )
        .map((doc: Attachment, idx: number) => {
          const id = String(doc.id ?? idx);
          return {
            id,
            name: doc.documentspecification?.designation ?? `Document ${idx + 1}`,
            uploaded: !!(uploadedDocs[id] && uploadedDocs[id].length > 0),
            uploadedFiles: uploadedDocs[id] || [],
          };
        })
    : [];

  const documentsToUpload =
    documentsFromOffreTransport.length > 0
      ? documentsFromOffreTransport
      : documentsFromAttachments;


  return (
    <div className="mb-4">
      {/* section document a specifier  */}
      <div style={{ marginBottom: "0px" }}>
        <h6
          className="mb-4 d-flex align-items-center"
          style={{
            color: "#1FB05B",
            paddingLeft: "8px",
            fontSize: "1.08rem",
            fontWeight: 600,
          }}
        >
          <img
            src={doc_info_icon}
            alt="info"
            style={{ width: "20px", marginRight: "10px" }}
          />
          Documents à spécifier
        </h6>

        {/* Titre */}
        <DocumentsSpecifier
          documents={documentsToUpload}
          onFileUpload={(documentId, files) => {
            const filesArray = Array.isArray(files) ? files : [files];
            setUploadedDocs((prev) => ({
              ...prev,
              [documentId]: filesArray,
            }));
          }}
          onFileReset={(documentId) => {
            setUploadedDocs((prev) => ({
              ...prev,
              [documentId]: [],
            }));
          }}
        />
      </div>
    </div>
  );
};

export default DocumentsTab;