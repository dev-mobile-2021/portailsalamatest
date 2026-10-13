/**
 * Composant de test pour VueGlobaleAO avec les données mock
 * Utilisez ce composant pour tester le délai de livraison ventilé
 */
import React, { useState } from "react";
import VueGlobale from "./VueGlobaleAO";
import { 
  mockVueGlobaleData, 
  mockDashboardData, 
  mockFournisseurs, 
  mockDocumentsFournis 
} from "../../mocks/vueGlobaleMocks";
import useDevises from "../../hooks/useDevises";

const VueGlobaleTest: React.FC = () => {
  // État local pour les données mock (permet les modifications)
  const [data, setData] = useState(mockVueGlobaleData);
  const { devises } = useDevises();
  // Handler de soumission mock
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📤 Soumission mock - Données:", data);
    alert("Soumission simulée ! Vérifiez la console pour les données.");
  };

  // Handler d'upload de document mock
  const handleDocumentUpload = (documentId: string, files: File | File[]) => {
    console.log("📎 Upload mock - Document ID:", documentId, "Files:", files);
  };

  // Handler de reset de document mock
  const handleDocumentReset = (documentId: string) => {
    console.log("🗑️ Reset mock - Document ID:", documentId);
  };

  return (
    <div className="container-fluid mt-4">
      {/* Bandeau de test */}
      <div 
        className="alert alert-info d-flex align-items-center justify-content-between mb-4" 
        role="alert"
        style={{ 
          backgroundColor: '#e7f3ff', 
          border: '2px solid #0d6efd',
          borderRadius: '12px'
        }}
      >
        <div>
          <strong>🧪 Mode Test</strong> - Données mock actives
          <br />
          <small className="text-muted">
            Les modifications sont locales et ne sont pas envoyées au serveur.
          </small>
        </div>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => {
            console.log("📊 État actuel des données:", data);
            console.log("📊 Articles avec délais:", data.articles.map((a: any) => ({
              nom: a.nom,
              delaiLivraisonData: a.delaiLivraisonData
            })));
          }}
        >
          Voir les données (console)
        </button>
      </div>

      {/* Composant VueGlobale avec les mocks */}
      <VueGlobale
        Data={data}
        setData={setData}
        dashboardData={mockDashboardData}
        fournisseurs={mockFournisseurs}
        loadingFabricants={false}
        errorFabricants={null}
        handleSubmit={handleSubmit}
        documentsFournis={mockDocumentsFournis}
        devises={devises}
        onDocumentUpload={handleDocumentUpload}
        onDocumentReset={handleDocumentReset}
      />

      {/* Bouton de soumission pour tester */}
      <div className="mt-4 mb-5">
        <button 
          className="btn btn-success btn-lg w-100"
          onClick={handleSubmit as any}
          style={{ borderRadius: '12px' }}
        >
          Simuler la soumission
        </button>
      </div>
    </div>
  );
};

export default VueGlobaleTest;
