import React, { useState } from "react";
import DocumentsSpecifier from "../UploadDocument";
import { FaShippingFast, FaBuilding, FaUniversity, FaFileInvoice } from "react-icons/fa";

// Constantes pour les options
const transitaires = [
  "DHL Express", 
  "FedEx International", 
  "UPS Worldwide", 
  "TNT Express", 
  "Bollore Logistics", 
  "SCAC Madagascar", 
  "Autre"
];

const modesTransport = ["Aérien", "Maritime", "Terrestre + Maritime"];

const portsDestination = ["Port Tamatave", "Aéroport Ivato", "Autre"];

const transitairesSelection = [
  "SCAC Madagascar",
  "Bollore Africa Logistics", 
  "SDV Madagascar",
  "SAGA Madagascar",
  "Autre"
];

const cabinetsExpertise = [
  "Bureau Veritas Madagascar",
  "SGS Madagascar", 
  "Cotecna Madagascar",
  "Apave Madagascar",
  "Autre"
];

const typesExpertise = [
  "Contrôle qualité",
  "Contrôle quantité", 
  "Contrôle conformité",
  "Analyse certificat"
];

const banques = [
  "BOA Madagascar",
  "BNI Madagascar",
  "BFV-SG", 
  "Banque Centrale Madagascar",
  "Autre"
];

const statutsMidac = ["En cours", "Approuvé", "En attente documents"];

interface InternationalData {
  // Ordre de Transit
  transitaireChoisi: string;
  transitairePrecision: string;
  modeTransport: string;
  pointDepart: string;
  portDestination: string;
  portDestinationPrecision: string;
  
  // Sélection Transitaire
  nomTransitaire: string;
  nomTransitairePrecision: string;
  contactTransitaireNom: string;
  contactTransitaireEmail: string;
  contactTransitaireTel: string;
  
  // Cabinet d'Expertise
  cabinetExpertise: string;
  cabinetExpertisePrecision: string;
  typesExpertiseSelectionnes: string[];
  contactExpertNom: string;
  contactExpertEmail: string;
  contactExpertTel: string;
  
  // Domiciliation Facture
  banque: string;
  banquePrecision: string;
  numeroDomiciliation: string;
  
  // MIDAC
  numeroMidac: string;
  statutMidac: string;
  codeSH: string;
  origineMarchandises: string;
}

interface InternationalTabProps {
  form: {
    produits: Record<number, any>;
    termeCommercial: "DDP" | "Autre" | "";
    commentaireTerme: string;
    transitaire: string;
    cabinetExpertise: string;
    fichier?: File | null;
    international?: InternationalData;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

// Fonction de validation exportée
export const validateInternationalForm = (data: InternationalData, isTransitaireRequired: boolean): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validation Ordre de Transit
  if (!data.transitaireChoisi) errors.transitaireChoisi = "Le transitaire est obligatoire";
  if (data.transitaireChoisi === "Autre" && !data.transitairePrecision) {
    errors.transitairePrecision = "Veuillez préciser le transitaire";
  }
  if (!data.modeTransport) errors.modeTransport = "Le mode de transport est obligatoire";
  if (!data.pointDepart) errors.pointDepart = "Le point de départ est obligatoire";
  if (!data.portDestination) errors.portDestination = "Le port/aéroport de destination est obligatoire";
  if (data.portDestination === "Autre" && !data.portDestinationPrecision) {
    errors.portDestinationPrecision = "Veuillez préciser le port/aéroport";
  }

  // Validation Sélection Transitaire (si requis)
  if (isTransitaireRequired) {
    if (!data.nomTransitaire) errors.nomTransitaire = "Le nom du transitaire est obligatoire";
    if (data.nomTransitaire === "Autre" && !data.nomTransitairePrecision) {
      errors.nomTransitairePrecision = "Veuillez préciser le nom du transitaire";
    }
    if (!data.contactTransitaireNom) errors.contactTransitaireNom = "Le nom du contact est obligatoire";
    if (!data.contactTransitaireEmail) errors.contactTransitaireEmail = "L'email du contact est obligatoire";
    if (!data.contactTransitaireTel) errors.contactTransitaireTel = "Le téléphone du contact est obligatoire";
  }

  // Validation Cabinet d'Expertise
  if (!data.cabinetExpertise) errors.cabinetExpertise = "Le cabinet d'expertise est obligatoire";
  if (data.cabinetExpertise === "Autre" && !data.cabinetExpertisePrecision) {
    errors.cabinetExpertisePrecision = "Veuillez préciser le cabinet d'expertise";
  }
  if (data.typesExpertiseSelectionnes.length === 0) {
    errors.typesExpertiseSelectionnes = "Veuillez sélectionner au moins un type d'expertise";
  }
  if (!data.contactExpertNom) errors.contactExpertNom = "Le nom de l'expert est obligatoire";
  if (!data.contactExpertEmail) errors.contactExpertEmail = "L'email de l'expert est obligatoire";
  if (!data.contactExpertTel) errors.contactExpertTel = "Le téléphone de l'expert est obligatoire";

  // Validation Domiciliation Facture
  if (!data.banque) errors.banque = "La banque est obligatoire";
  if (data.banque === "Autre" && !data.banquePrecision) {
    errors.banquePrecision = "Veuillez préciser la banque";
  }
  if (!data.numeroDomiciliation) errors.numeroDomiciliation = "Le numéro de domiciliation est obligatoire";

  // Validation MIDAC
  if (!data.numeroMidac) errors.numeroMidac = "Le numéro MIDAC est obligatoire";
  if (!data.statutMidac) errors.statutMidac = "Le statut MIDAC est obligatoire";
  if (!data.codeSH) errors.codeSH = "Le code SH est obligatoire";
  if (!data.origineMarchandises) errors.origineMarchandises = "L'origine des marchandises est obligatoire";

  return errors;
};

const InternationalTab: React.FC<InternationalTabProps> = ({
  form,
  setForm
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File[]>>({});

  // Initialiser les données internationales si elles n'existent pas
  const internationalData: InternationalData = form.international || {
    transitaireChoisi: "",
    transitairePrecision: "",
    modeTransport: "",
    pointDepart: "",
    portDestination: "",
    portDestinationPrecision: "",
    nomTransitaire: "",
    nomTransitairePrecision: "",
    contactTransitaireNom: "",
    contactTransitaireEmail: "",
    contactTransitaireTel: "",
    cabinetExpertise: "",
    cabinetExpertisePrecision: "",
    typesExpertiseSelectionnes: [],
    contactExpertNom: "",
    contactExpertEmail: "",
    contactExpertTel: "",
    banque: "",
    banquePrecision: "",
    numeroDomiciliation: "",
    numeroMidac: "",
    statutMidac: "",
    codeSH: "",
    origineMarchandises: ""
  };

  const handleInputChange = (field: keyof InternationalData, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      international: {
        ...internationalData,
        [field]: value
      }
    }));
    
    // Supprimer l'erreur si le champ est maintenant valide
    if (errors[field] && value) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (expertise: string, checked: boolean) => {
    const currentTypes = internationalData.typesExpertiseSelectionnes;
    const newTypes = checked 
      ? [...currentTypes, expertise]
      : currentTypes.filter(t => t !== expertise);
    
    handleInputChange('typesExpertiseSelectionnes', newTypes);
  };

  const handleFileUpload = (documentId: string, files: File | File[]) => {
    const filesArray = Array.isArray(files) ? files : [files];
    setUploadedDocs((prev) => ({
      ...prev,
      [documentId]: [...(prev[documentId] || []), ...filesArray],
    }));
    console.log(`Document ${documentId} uploaded:`, filesArray.map(f => f.name));
  };

  const handleFileReset = (documentId: string) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [documentId]: [],
    }));
  };

  // Vérifie si le transitaire est nécessaire (incoterm différent de DDP)
  const isTransitaireRequired = form.termeCommercial !== "DDP";

  const sectionStyle = {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "30px",
    marginBottom: "20px",
    border: "1px solid #e9ecef"
  };

  const titleStyle = {
    color: "#1FB05B",
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* 1. Ordre de Transit */}
      <div style={sectionStyle}>
        <h6 style={titleStyle}>
          <FaShippingFast /> Ordre de Transit
        </h6>
        <div className="row align-items-start">
          <div className="col-md-8">
            <div className="row">
              <div className="col-md-6">
          <label className="form-label">
              Transitaire choisi
          </label>
          <select
            className="form-select"
            value={internationalData.transitaireChoisi}
            onChange={(e) => handleInputChange('transitaireChoisi', e.target.value)}
          >
            <option value="">-- Sélectionnez --</option>
            {transitaires.map((t, index) => (
              <option key={index} value={t}>{t}</option>
            ))}
          </select>
              </div>
              {internationalData.transitaireChoisi === "Autre" && (
          <div className="col-md-6">
            <label className="form-label">
                Préciser le transitaire
            </label>
            <input
              type="text"
              className="form-control"
              value={internationalData.transitairePrecision}
              onChange={(e) => handleInputChange('transitairePrecision', e.target.value)}
              placeholder="Nom du transitaire"
            />
          </div>
              )}
            </div>
            <div className="row mt-3">
              <div className="col-md-4">
          <label className="form-label">
              Mode de transport
          </label>
          <select
            className="form-select"
            value={internationalData.modeTransport}
            onChange={(e) => handleInputChange('modeTransport', e.target.value)}
          >
            <option value="">-- Sélectionnez --</option>
            {modesTransport.map((mode, index) => (
              <option key={index} value={mode}>{mode}</option>
            ))}
          </select>
              </div>
              <div className="col-md-4">
          <label className="form-label">
              Point de départ
          </label>
          <input
            type="text"
            className="form-control"
            value={internationalData.pointDepart}
            onChange={(e) => handleInputChange('pointDepart', e.target.value)}
            placeholder="Ville/Port de départ"
          />
              </div>
              <div className="col-md-4">
          <label className="form-label">
              Port/Aéroport destination
          </label>
          <select
            className="form-select"
            value={internationalData.portDestination}
            onChange={(e) => handleInputChange('portDestination', e.target.value)}
          >
            <option value="">-- Sélectionnez --</option>
            {portsDestination.map((port, index) => (
              <option key={index} value={port}>{port}</option>
            ))}
          </select>
              </div>
            </div>
            {internationalData.portDestination === "Autre" && (
              <div className="row mt-3">
          <div className="col-md-6">
            <label className="form-label">
                Préciser le port/aéroport
            </label>
            <input
              type="text"
              className="form-control"
              value={internationalData.portDestinationPrecision}
              onChange={(e) => handleInputChange('portDestinationPrecision', e.target.value)}
              placeholder="Nom du port/aéroport"
            />
          </div>
          </div>
            )}
          </div>
          <div className="col-md-4 d-flex justify-content-center align-items-top">
          <div >
            <small className=" text-muted d-block mt-2 text-center mb-2">Ajoutez ici tout justificatif ou document utile pour l'ordre de transit.</small>
            <DocumentsSpecifier
              documents={[{ 
                id: ' ', 
                name: "Ordre de Transit", 
                uploaded: !!(uploadedDocs[1] && uploadedDocs[1].length > 0),
                uploadedFiles: uploadedDocs[1] || []
              }]}
              title="Joindre un document (Ordre de Transit)"
              onFileUpload={(id, files) => handleFileUpload(id, files)}
              onFileReset={(id) => handleFileReset(id)}
            />
            
          </div>
          </div>
        </div>
      </div>
      {/* 2. Sélection Transitaire (visible seulement si incoterm différent de DDP) */}
      {isTransitaireRequired && (
        <div style={sectionStyle}>
          <h6 style={titleStyle}>
            <FaBuilding /> Sélection Transitaire
          </h6>
          <div className="row align-items-start">
            <div className="col-md-8">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">
                      Nom transitaire
                  </label>
                  <select
                    className="form-select"
                    value={internationalData.nomTransitaire}
                    onChange={(e) => handleInputChange('nomTransitaire', e.target.value)}
                  >
                    <option value="">-- Sélectionnez --</option>
                    {transitairesSelection.map((t, index) => (
                      <option key={index} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                {internationalData.nomTransitaire === "Autre" && (
                  <div className="col-md-6">
                    <label className="form-label">
                        Préciser le nom
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={internationalData.nomTransitairePrecision}
                      onChange={(e) => handleInputChange('nomTransitairePrecision', e.target.value)}
                      placeholder="Nom du transitaire"
                    />
                  </div>
                )}
              </div>
              <div className="row mt-3">
                <div className="col-md-4">
                  <label className="form-label">
                      Contact - Nom
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={internationalData.contactTransitaireNom}
                    onChange={(e) => handleInputChange('contactTransitaireNom', e.target.value)}
                    placeholder="Nom du contact"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                      Contact - Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={internationalData.contactTransitaireEmail}
                    onChange={(e) => handleInputChange('contactTransitaireEmail', e.target.value)}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                      Contact - Téléphone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={internationalData.contactTransitaireTel}
                    onChange={(e) => handleInputChange('contactTransitaireTel', e.target.value)}
                    placeholder="+261 XX XX XXX XX"
                  />
                </div>
              </div>
            </div>
            <div className="col-md-4 d-flex justify-content-center align-items-center">
              <div>
                <small className=" text-muted d-block mt-2 text-center mb-2">Ajoutez ici tout justificatif ou document utile pour le transitaire.</small>
              <DocumentsSpecifier
                documents={[{ 
                  id: '2', 
                  name: "Transitaire", 
                  uploaded: !!(uploadedDocs[2] && uploadedDocs[2].length > 0),
                  uploadedFiles: uploadedDocs[2] || []
                }]}
                title="Joindre un document (Transitaire)"
                onFileUpload={(id, files) => handleFileUpload(id, files)}
                onFileReset={(id) => handleFileReset(id)}
              />
              
            </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cabinet d'Expertise */}
      <div style={sectionStyle}>
        <h6 style={titleStyle}>
          <FaBuilding /> Cabinet d'Expertise
        </h6>
        <div className="row align-items-start">
          <div className="col-md-8">
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">
                    Cabinet
                </label>
                <select
                  className="form-select"
                  value={internationalData.cabinetExpertise}
                  onChange={(e) => handleInputChange('cabinetExpertise', e.target.value)}
                >
                  <option value="">-- Sélectionnez --</option>
                  {cabinetsExpertise.map((cabinet, index) => (
                    <option key={index} value={cabinet}>{cabinet}</option>
                  ))}
                </select>
              </div>
              {internationalData.cabinetExpertise === "Autre" && (
                <div className="col-md-6">
                  <label className="form-label">
                      Préciser le cabinet
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={internationalData.cabinetExpertisePrecision}
                    onChange={(e) => handleInputChange('cabinetExpertisePrecision', e.target.value)}
                    placeholder="Nom du cabinet"
                  />
                </div>
              )}
            </div>
            <div className="row mt-3">
              <div className="col-12">
                <label className="form-label">
                    Type d'expertise (sélectionner au moins un)
                </label>
                <div className="d-flex flex-wrap gap-3">
                  {typesExpertise.map((type, index) => (
                    <div key={index} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={internationalData.typesExpertiseSelectionnes.includes(type)}
                        onChange={(e) => handleCheckboxChange(type, e.target.checked)}
                        id={`expertise-${index}`}
                      />
                      <label className="form-check-label" htmlFor={`expertise-${index}`}>
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-4">
                <label className="form-label">
                    Contact expert - Nom
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={internationalData.contactExpertNom}
                  onChange={(e) => handleInputChange('contactExpertNom', e.target.value)}
                  placeholder="Nom de l'expert"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                    Contact expert - Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={internationalData.contactExpertEmail}
                  onChange={(e) => handleInputChange('contactExpertEmail', e.target.value)}
                  placeholder="expert@exemple.com"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                    Contact expert - Téléphone
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={internationalData.contactExpertTel}
                  onChange={(e) => handleInputChange('contactExpertTel', e.target.value)}
                  placeholder="+261 XX XX XXX XX"
                />
              </div>
            </div>
          </div>
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <div>
              <small className=" text-muted d-block mt-2 text-center mb-2">Ajoutez ici tout justificatif ou document utile pour le cabinet d'expertise.</small>
            <DocumentsSpecifier
              documents={[{ 
                id: '3', 
                name: "Cabinet d'Expertise", 
                uploaded: !!(uploadedDocs[3] && uploadedDocs[3].length > 0),
                uploadedFiles: uploadedDocs[3] || []
              }]}
              title="Joindre un document (Cabinet d'Expertise)"
              onFileUpload={(id, files) => handleFileUpload(id, files)}
              onFileReset={(id) => handleFileReset(id)}
            />
          </div>
          </div>
        </div>
      </div>

      {/* 4. Domiciliation Facture */}
      <div style={sectionStyle}>
        <h6 style={titleStyle}>
          <FaUniversity /> Domiciliation Facture
        </h6>
        <div className="row align-items-start">
          <div className="col-md-8">
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">
                    Banque
                </label>
                <select
                  className="form-select"
                  value={internationalData.banque}
                  onChange={(e) => handleInputChange('banque', e.target.value)}
                >
                  <option value="">-- Sélectionnez --</option>
                  {banques.map((banque, index) => (
                    <option key={index} value={banque}>{banque}</option>
                  ))}
                </select>
              </div>
              {internationalData.banque === "Autre" && (
                <div className="col-md-6">
                  <label className="form-label">
                      Préciser la banque
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={internationalData.banquePrecision}
                    onChange={(e) => handleInputChange('banquePrecision', e.target.value)}
                    placeholder="Nom de la banque"
                  />
                </div>
              )}
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <label className="form-label">
                    Numéro de domiciliation
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={internationalData.numeroDomiciliation}
                  onChange={(e) => handleInputChange('numeroDomiciliation', e.target.value)}
                  placeholder="Numéro de domiciliation"
                />
              </div>
            </div>
          </div>
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <div>
                  <small className=" text-muted d-block mt-2 text-center mb-2">
              Ajoutez ici tout justificatif ou document utile pour la domiciliation de facture.
              </small>
              <DocumentsSpecifier
              documents={[
                {
                id: "4",
                name: "Domiciliation Facture",
                uploaded: !!(uploadedDocs["4"] && uploadedDocs["4"].length > 0),
                uploadedFiles: uploadedDocs["4"] || []
                },
              ]}
              title="Joindre un document (Domiciliation Facture)"
              onFileUpload={(id, files) => handleFileUpload(id, files)}
              onFileReset={(id) => handleFileReset(id)}
              />
          
            </div>
          </div>
        </div>
      </div>

      {/* 5. MIDAC */}
      <div style={sectionStyle}>
        <h6 style={titleStyle}>
          <FaFileInvoice /> MIDAC
        </h6>
        <div className="row align-items-start">
          <div className="col-md-8">
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">
                    Numéro MIDAC
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={internationalData.numeroMidac}
                  onChange={(e) => handleInputChange('numeroMidac', e.target.value)}
                  placeholder="Numéro MIDAC"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                    Statut MIDAC
                </label>
                <select
                  className="form-select"
                  value={internationalData.statutMidac}
                  onChange={(e) => handleInputChange('statutMidac', e.target.value)}
                >
                  <option value="">-- Sélectionnez --</option>
                  {statutsMidac.map((statut, index) => (
                    <option key={index} value={statut}>{statut}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <label className="form-label">
                    Code SH
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={internationalData.codeSH}
                  onChange={(e) => handleInputChange('codeSH', e.target.value)}
                  placeholder="ex: 3004.90.00"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                    Origine des marchandises
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={internationalData.origineMarchandises}
                  onChange={(e) => handleInputChange('origineMarchandises', e.target.value)}
                  placeholder="Pays d'origine"
                />
              </div>
            </div>
          </div>
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <div>
              <small className=" text-muted d-block mt-2 text-center mb-2">Ajoutez ici tout justificatif ou document utile pour le MIDAC.</small>
            <DocumentsSpecifier
              documents={[{ 
                id: "5", 
                name: "MIDAC", 
                uploaded: !!(uploadedDocs['5'] && uploadedDocs['5'].length > 0),
                uploadedFiles: uploadedDocs['5'] || []
              }]}
              title="Joindre un document (MIDAC)"
              onFileUpload={(id, files) => handleFileUpload(id, files)}
              onFileReset={(id) => handleFileReset(id)}
            />
            
                  </div> 
          </div>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {Object.keys(errors).length > 0 && (
        <div className="alert alert-danger">
          <h6>Veuillez corriger les erreurs suivantes :</h6>
          <ul className="mb-0">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InternationalTab;