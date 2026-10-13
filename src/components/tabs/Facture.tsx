import React from "react";
import { FaClipboardCheck, FaFileInvoice, FaCalendarAlt, FaUser, FaTruck, FaDownload, FaFileAlt } from "react-icons/fa";
import { Badge, Card, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

interface PaiementHistorique {
  id: string;
  date: string;
  montant: number;
  mode: string;
  reference: string;
}

interface FactureProps {
  data?: any;
  orderType?:  'programme' | 'rc_public' | 'rc_prive' | 'tef' | 'be' | 'ferme' | 'urgence' | 'enlevement' | null;
}

const Facture: React.FC<FactureProps> = ({ data: inputData, orderType }) => {
  // Données mockées de la facture
  const mockFacture = {
    numero: "FAC-2025-0789",
    date_emission: "15 Octobre 2025",
    date_echeance: "14 Novembre 2025",
    statut_paiement: "Payée partiellement",
    client: {
      nom: "Jean Dupont",
      adresse: "Lot II A 45, Antananarivo, Madagascar",
      contact: "+261 34 12 345 67",
      email: "jean.dupont@email.com",
    },
    articles: [
      {
        id: "ART-001",
        code: "ART-001",
        designation: "CODV complexe homeopathique - flacon de 25 ml PQT6",
        quantite_commandee: 100,
        quantite_livree: 90,
        prix_unitaire: 5000,
        montant_ht: 450000,
        imp: 90000,
        montant_ttc: 540000,
        lot: "LOT-123",
        date_peremption: "01/01/2026",
      },
      {
        id: "ART-002",
        code: "ART-002",
        designation: "BAUME FOSA - Pot /30G - PAQUET /6",
        quantite_commandee: 50,
        quantite_livree: 50,
        prix_unitaire: 10000,
        montant_ht: 500000,
        imp: 100000,
        montant_ttc: 600000,
        lot: "LOT-456",
        date_peremption: "31/12/2025",
      },
    ],
    finances: {
      total_ht: 950000,
      total_imp: 190000,
      total_ttc: 1140000,
      montant_paye: 500000,
      solde_restant: 640000,
    },
    livraison: {
      date_effective: "14 Octobre 2025",
      numero_bl: "BL-2025-0456",
      transporteur: "SOTRAMAD",
      observations: "Livraison effectuée dans les délais sans anomalies",
    },
    documents: [
      { id: "doc1", type: "Facture", label: "Facture PDF", url: "/docs/facture.pdf" },
      { id: "doc2", type: "BL", label: "Bon de Livraison", url: "/docs/bon-livraison.pdf" },
      { id: "doc3", type: "BC", label: "Bon de Commande", url: "/docs/bon-commande.pdf" },
      { id: "doc4", type: "Proforma", label: "Facture Proforma initiale", url: "/docs/facture-proforma.pdf" },
    ],
    historique_paiements: [
      {
        id: "pay1",
        date: "20 Octobre 2025",
        montant: 200000,
        mode: "Virement bancaire",
        reference: "VIR-2025-001",
      },
      {
        id: "pay2",
        date: "25 Octobre 2025",
        montant: 300000,
        mode: "Chèque",
        reference: "CHQ-2025-002",
      },
    ],
  };

  // Données à afficher - utiliser les données d'entrée si disponibles, sinon utiliser les mocks
  // Vérifier aussi si inputData a au moins les propriétés minimales nécessaires
  const data = (inputData && typeof inputData === 'object') ? {
    ...mockFacture,  // Utiliser les mocks comme base
    ...inputData     // Remplacer par les vraies données si disponibles
  } : mockFacture;

  // Fonction pour déterminer la couleur du badge de statut
  const getStatusBadge = (status: string) => {
    let bgColor = "secondary";
    
    // Vérifier si status est défini avant d'appeler toLowerCase()
    if (!status) return <Badge bg="secondary">Non défini</Badge>;
    
    const statusLower = status.toLowerCase();
    
    switch(statusLower) {
      case "payée":
      case "payee":
        bgColor = "success";
        break;
      case "payée partiellement":
      case "payee partiellement":
        bgColor = "warning";
        break;
      case "en attente":
        bgColor = "info";
        break;
      case "en retard":
        bgColor = "danger";
        break;
      default:
        bgColor = "secondary";
    }
    
    return <Badge bg={bgColor}>{status}</Badge>;
  };

  return (
    <div
      className="bg-white p-3 rounded-3 shadow-sm"
      style={{ border: "1.5px solid #1FB05B", borderRadius: "16px" }}
    >
      <h5
        className="mb-4 d-flex align-items-center gap-2"
        style={{ color: "#1FB05B", fontWeight: 700 }}
      >
        <FaFileInvoice />
        Facture
      </h5>
      
      {/* En-tête de la facture */}
      <Card className="mb-4">
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaFileInvoice className="text-success me-2" />
                <strong className="me-2">N° Facture:</strong>
                <span>{data?.numero || 'Non défini'}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="text-success me-2" />
                <strong className="me-2">Date d'émission:</strong>
                <span>{data?.date_emission || 'Non définie'}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="text-success me-2" />
                <strong className="me-2">Date d'échéance:</strong>
                <span>{data?.date_echeance || 'Non définie'}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaClipboardCheck className="text-success me-2" />
                <strong className="me-2">Statut paiement:</strong>
                {data?.statut_paiement ? getStatusBadge(data.statut_paiement) : <Badge bg="secondary">Non défini</Badge>}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Informations client */}
      <Card className="mb-4">
        <Card.Body>
          <h6 className="mb-3 text-success">Informations client</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaUser className="text-success me-2" />
                <strong className="me-2">Nom client:</strong>
                <span>{data?.client?.nom || 'Non défini'}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaUser className="text-success me-2" />
                <strong className="me-2">Adresse:</strong>
                <span>{data?.client?.adresse || 'Non définie'}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaUser className="text-success me-2" />
                <strong className="me-2">Contact:</strong>
                <span>{data?.client?.contact || 'Non défini'}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaUser className="text-success me-2" />
                <strong className="me-2">Email:</strong>
                <span>{data?.client?.email || 'Non défini'}</span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Détails des articles livrés */}
      <Card className="mb-4">
        <Card.Body>
          <h6 className="mb-3 text-success">Détails des articles livrés</h6>
          <div className="table-responsive">
            <Table striped bordered hover size="sm">
              <thead>
                <tr className="bg-light">
                  <th>Code</th>
                  <th>Désignation</th>
                  
                  {/* Colonnes spécifiques selon le type de commande */}
                  {orderType === 'programme' && (
                    <>
                      <th>Unité</th>
                      <th>Qté commandée</th>
                      <th>Qté livrée</th>
                      <th>Prix unitaire</th>
                      <th>Montant HT</th>
                      <th>IMP</th>
                      <th>Montant TTC</th>
                      <th>Lot/Péremption</th>
                    </>
                  )}
                  
                  {orderType === 'rc_prive' && (
                    <>
                      <th>Qté commandée</th>
                      <th>Qté livrée</th>
                      <th>Prix unitaire</th>
                      <th>Montant HT</th>
                      <th>Type</th>
                      {/* Si la commande RC a des impôts */}
                      <th>IMP</th>
                      <th>Montant TTC</th>
                    </>
                  )}
                  
                  {orderType === 'tef' && (
                    <>
                      <th>Qté commandée</th>
                      <th>Qté livrée</th>
                      <th>Conditionnement</th>
                      <th>Prix unitaire HT</th>
                      <th>Montant HT</th>
                      <th>IMP</th>
                      <th>Montant TTC</th>
                    </>
                  )}
                  
                  {orderType === 'be' && (
                    <>
                      <th>Qté commandée</th>
                      <th>Qté livrée</th>
                      <th>Prix unitaire HT</th>
                      <th>Montant HT</th>
                      <th>IMP</th>
                      <th>Montant TTC</th>
                      <th>Qté allouée</th>
                    </>
                  )}
                  
                  {orderType === 'ferme' && (
                    <>
                      <th>Qté commandée</th>
                      <th>Qté livrée</th>
                      <th>Prix unitaire</th>
                      <th>Montant HT</th>
                      <th>IMP</th>
                      <th>Montant TTC</th>
                      <th>Lot</th>
                      <th>Date péremption</th>
                    </>
                  )}
                  
                  {/* Colonnes par défaut si pas de type spécifié */}
                  {!orderType && (
                    <>
                      <th>Qté commandée</th>
                      <th>Qté livrée</th>
                      <th>Prix unitaire</th>
                      <th>Montant HT</th>
                      <th>IMP</th>
                      <th>Montant TTC</th>
                      <th>Lot/Péremption</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.articles?.map((article: any) => (
                  <tr key={article.id}>
                    <td>{article.code}</td>
                    <td>{article.designation}</td>
                    
                    {/* Cellules spécifiques selon le type de commande */}
                    {orderType === 'programme' && (
                      <>
                        <td>{article.unite || "-"}</td>
                        <td className="text-center">{article.quantite_commandee || article.quantite || 0}</td>
                        <td className="text-center">{article.quantite_livree || 0}</td>
                        <td className="text-end">{(article.prix_unitaire || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ht || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.imp || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ttc || 0).toLocaleString()} Ar</td>
                        <td>{article.lot} ({article.date_peremption || "-"})</td>
                      </>
                    )}
                    
                    {orderType === 'rc_prive' && (
                      <>
                        <td className="text-center">{article.quantite_commandee || article.quantite || 0}</td>
                        <td className="text-center">{article.quantite_livree || 0}</td>
                        <td className="text-end">{(article.prix_unitaire || article.prixvente || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ht || (article.quantite * article.prix_unitaire) || 0).toLocaleString()} Ar</td>
                        <td>{article.type || "-"}</td>
                        <td className="text-end">{(article.imp || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ttc || 0).toLocaleString()} Ar</td>
                      </>
                    )}
                    
                    {orderType === 'tef' && (
                      <>
                        <td className="text-center">{article.quantite_commandee || article.quantite || 0}</td>
                        <td className="text-center">{article.quantite_livree || 0}</td>
                        <td className="text-center">{article.conditionnement || 0}</td>
                        <td className="text-end">{(article.prix_unitaire || article.pvht || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ht || (article.quantite * article.prix_unitaire) || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.imp || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ttc || 0).toLocaleString()} Ar</td>
                      </>
                    )}  
                    
                    {orderType === 'be' && (
                      <>
                        <td className="text-center">{article.quantite_commandee || article.quantite || 0}</td>
                        <td className="text-center">{article.quantite_livree || 0}</td>
                        <td className="text-end">{(article.prix_unitaire || article.pvht || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ht || (article.quantite * article.prix_unitaire) || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.imp || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ttc || 0).toLocaleString()} Ar</td>
                        <td className="text-center">{article.quantite_allouee || 0}</td>
                      </>
                    )}
                    
                    {orderType === 'ferme' && (
                      <>
                        <td className="text-center">{article.quantite_commandee || article.quantite || 0}</td>
                        <td className="text-center">{article.quantite_livree || 0}</td>
                        <td className="text-end">{(article.prix_unitaire || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ht || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.imp || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ttc || 0).toLocaleString()} Ar</td>
                        <td>{article.lot || "-"}</td>
                        <td>{article.date_peremption || "-"}</td>
                      </>
                    )}
                    
                    {/* Cellules par défaut si pas de type spécifié */}
                    {!orderType && (
                      <>
                        <td className="text-center">{article.quantite_commandee || article.quantite || 0}</td>
                        <td className="text-center">{article.quantite_livree || 0}</td>
                        <td className="text-end">{(article.prix_unitaire || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ht || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.imp || 0).toLocaleString()} Ar</td>
                        <td className="text-end">{(article.montant_ttc || 0).toLocaleString()} Ar</td>
                        <td>{article.lot} ({article.date_peremption || "-"})</td>
                      </>
                    )}
                  </tr>
                ))}
                
                {/* Ligne de totaux */}
                <tr className="table-light fw-bold">
                  {orderType === 'programme' && (
                    <>
                      <td colSpan={6} className="text-end">Total</td>
                      <td className="text-end">{(data.finances?.total_ht || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_imp || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_ttc || 0).toLocaleString()} Ar</td>
                      <td></td>
                    </>
                  )}
                  
                  {orderType === 'rc_prive' && (
                    <>
                      <td colSpan={5} className="text-end">Total</td>
                      <td className="text-end">{(data.finances?.total_ht || 0).toLocaleString()} Ar</td>
                      <td></td>
                      <td className="text-end">{(data.finances?.total_imp || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_ttc || 0).toLocaleString()} Ar</td>
                    </>
                  )}
                  
                  {orderType === 'tef' && (
                    <>
                      <td colSpan={5} className="text-end">Total</td>
                      <td className="text-end">{(data.finances?.total_ht || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_imp || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_ttc || 0).toLocaleString()} Ar</td>
                    </>
                  )}
                  
                  {orderType === 'be' && (
                    <>
                      <td colSpan={5} className="text-end">Total</td>
                      <td className="text-end">{(data.finances?.total_ht || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_imp || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_ttc || 0).toLocaleString()} Ar</td>
                      <td></td>
                    </>
                  )}
                  
                  {orderType === 'ferme' && (
                    <>
                      <td colSpan={5} className="text-end">Total</td>
                      <td className="text-end">{(data.finances?.total_ht || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_imp || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_ttc || 0).toLocaleString()} Ar</td>
                      <td colSpan={2}></td>
                    </>
                  )}
                  
                  {/* Totaux par défaut si pas de type spécifié */}
                  {!orderType && (
                    <>
                      <td colSpan={5} className="text-end">Total</td>
                      <td className="text-end">{(data.finances?.total_ht || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_imp || 0).toLocaleString()} Ar</td>
                      <td className="text-end">{(data.finances?.total_ttc || 0).toLocaleString()} Ar</td>
                      <td></td>
                    </>
                  )}
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      
      {/* Calculs financiers */}
      <Card className="mb-4">
        <Card.Body>
          <h6 className="mb-3 text-success">Résumé financier</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <Table bordered className="mb-0">
                <tbody>
                  <tr>
                    <td className="fw-bold bg-light" style={{width: "40%"}}>Total HT</td>
                    <td className="text-end">{data.finances?.total_ht ? data.finances.total_ht.toLocaleString() : '0'} Ar</td>
                  </tr>
                  <tr>
                    <td className="fw-bold bg-light">Total IMP</td>
                    <td className="text-end">{data.finances?.total_imp ? data.finances.total_imp.toLocaleString() : '0'} Ar</td>
                  </tr>
                  <tr>
                    <td className="fw-bold bg-light">Total TTC</td>
                    <td className="text-end">{data.finances?.total_ttc ? data.finances.total_ttc.toLocaleString() : '0'} Ar</td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <div className="col-md-6">
              <Table bordered className="mb-0">
                <tbody>
                  <tr>
                    <td className="fw-bold bg-light" style={{width: "40%"}}>Montant déjà payé</td>
                    <td className="text-end">{data.finances?.montant_paye ? data.finances.montant_paye.toLocaleString() : '0'} Ar</td>
                  </tr>
                  <tr>
                    <td className="fw-bold bg-light">Solde restant</td>
                    <td className="text-end fw-bold" style={{color: data.finances?.solde_restant > 0 ? '#dc3545' : '#28a745'}}>
                      {data.finances?.solde_restant ? data.finances.solde_restant.toLocaleString() : '0'} Ar
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold bg-light">Pourcentage payé</td>
                    <td className="text-end">
                      {data.finances?.montant_paye && data.finances?.total_ttc && data.finances.total_ttc > 0 
                        ? Math.round((data.finances.montant_paye / data.finances.total_ttc) * 100) 
                        : 0}%
                      <div className="progress mt-1" style={{height: "6px"}}>
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{width: `${data.finances?.montant_paye && data.finances?.total_ttc && data.finances.total_ttc > 0 
                            ? (data.finances.montant_paye / data.finances.total_ttc) * 100
                            : 0}%`}} 
                          aria-valuenow={data.finances?.montant_paye && data.finances?.total_ttc && data.finances.total_ttc > 0
                            ? (data.finances.montant_paye / data.finances.total_ttc) * 100
                            : 0}
                          aria-valuemin={0} 
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Informations de livraison */}
      <Card className="mb-4">
        <Card.Body>
          <h6 className="mb-3 text-success">Informations de livraison</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="text-success me-2" />
                <strong className="me-2">Date de livraison:</strong>
                <span>{data.livraison?.date_effective || 'Non disponible'}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaFileAlt className="text-success me-2" />
                <strong className="me-2">N° BL:</strong>
                <span>{data.livraison?.numero_bl || 'Non disponible'}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <FaTruck className="text-success me-2" />
                <strong className="me-2">Transporteur:</strong>
                <span>{data.livraison?.transporteur || 'Non disponible'}</span>
              </div>
            </div>
            <div className="col-md-12">
              <div className="d-flex align-items-start">
                <FaFileAlt className="text-success me-2 mt-1" />
                <strong className="me-2">Observations:</strong>
                <span>{data.livraison?.observations || 'Aucune observation'}</span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Documents joints */}
      <Card className="mb-4">
        <Card.Body>
          <h6 className="mb-3 text-success">Documents joints</h6>
          <div className="d-flex flex-wrap gap-3">
            {data.documents?.map((doc: any) => (
              <div key={doc.id} className="p-2 border rounded bg-light">
                <div className="d-flex align-items-center gap-2">
                  {doc.type === "Facture" && <FaFileInvoice className="text-danger" />}
                  {doc.type === "BL" && <FaFileAlt className="text-primary" />}
                  {doc.type === "BC" && <FaFileAlt className="text-success" />}
                  {doc.type === "Proforma" && <FaFileAlt className="text-warning" />}
                  <span>{doc.label}</span>
                  <Link to={doc.url} className="btn btn-sm btn-outline-success" target="_blank" rel="noopener noreferrer">
                    <FaDownload /> Télécharger
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
      
      {/* Historique des paiements */}
      <Card className="mb-4">
        <Card.Body>
          <h6 className="mb-3 text-success">Historique des paiements</h6>
          <div className="table-responsive">
            <Table striped bordered hover size="sm">
              <thead>
                <tr className="bg-light">
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Mode de paiement</th>
                  <th>Référence</th>
                </tr>
              </thead>
              <tbody>
                {data.historique_paiements?.map((paiement: PaiementHistorique) => (
                  <tr key={paiement.id}>
                    <td>{paiement.date}</td>
                    <td className="text-end">{paiement.montant ? paiement.montant.toLocaleString() : '0'} Ar</td>
                    <td>{paiement.mode}</td>
                    <td>{paiement.reference}</td>
                  </tr>
                ))}
                {(!data.historique_paiements || data.historique_paiements.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center">Aucun paiement enregistré</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Facture;