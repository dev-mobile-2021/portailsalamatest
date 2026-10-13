import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Form, Modal } from "react-bootstrap";
import Title from "../components/const/Title";
import { useAuthContext } from "../hooks/useUserhook";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import PaginationComponent from "../components/PaginationComponent";
import SmallHeader from "../components/const/SmallHeader";

// Define Chauffeur interface
interface Chauffeur {
  id: string;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  status?: string;
}

// Define form data type
interface ChauffeurFormData {
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
}

// Define pagination metadata type
interface PaginationMetadata {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

const Chauffeurs = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, _setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentChauffeur, setCurrentChauffeur] = useState<ChauffeurFormData>({
    nom: "",
    adresse: "",
    email: "",
    telephone: ""
  });
  const [alert, setAlert] = useState<{type: string, message: string} | null>(null);
  const [_currentPage, setCurrentPage] = useState<number>(1);
  const [_perPage, setPerPage] = useState<number>(10);
  const [paginationMetadata, setPaginationMetadata] = useState<PaginationMetadata>({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1
  });

  // Protect the route
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentChauffeur(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setCurrentChauffeur({
      nom: "",
      adresse: "",
      email: "",
      telephone: ""
    });
    setShowModal(true);
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      if (!currentChauffeur.nom.trim()) {
        setAlert({
          type: "danger",
          message: "Le nom est requis."
        });
        return;
      }
      
      if (!currentChauffeur.telephone.trim()) {
        setAlert({
          type: "danger",
          message: "Le téléphone est requis."
        });
        return;
      }

      if (currentChauffeur.email && !isValidEmail(currentChauffeur.email)) {
        setAlert({
          type: "danger",
          message: "L'adresse email n'est pas valide."
        });
        return;
      }

      // Générer un ID temporaire unique pour le nouveau chauffeur
      const tempId = `temp-${Date.now()}`;
      
      // Ajouter directement le chauffeur au sommet de la liste
      const newChauffeur: Chauffeur = {
        id: tempId,
        nom: currentChauffeur.nom,
        adresse: currentChauffeur.adresse,
        email: currentChauffeur.email,
        telephone: currentChauffeur.telephone,
        status: "en_attente"
      };
      
      // Ajouter le chauffeur au début de la liste
      setChauffeurs(prev => [newChauffeur, ...prev]);
      
      // Mettre à jour les métadonnées de pagination
      setPaginationMetadata(prev => ({
        ...prev,
        total: prev.total + 1
      }));
      
      setAlert({
        type: "success",
        message: "Le chauffeur a été ajouté et est en attente de validation."
      });
      
      // Close modal and reset form
      setShowModal(false);
      setCurrentChauffeur({
        nom: "",
        adresse: "",
        email: "",
        telephone: ""
      });
      
      // Auto-dismiss alert after 5 seconds
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    } catch (error) {
      console.error("Error saving chauffeur:", error);
      setAlert({
        type: "danger",
        message: "Une erreur est survenue lors de l'enregistrement du chauffeur."
      });
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  // Custom button style with the requested color
  const buttonStyle = {
    backgroundColor: "#1FB05B",
    borderColor: "#1FB05B"
  };

  return (
    <>
    <SmallHeader />
    <Container fluid className="p-4">

      <Row className="mb-4">
        <Col>
          <Title
            titleText="Gestion des Chauffeurs"
            spanText="Chauffeurs"
          />
          <div className="d-flex justify-content-end mr-5">
            <Button 
              style={buttonStyle}
              className="d-flex align-items-center" 
              onClick={openCreateModal}
            >
              <FaPlus className="me-2" /> Nouveau Chauffeur
            </Button>
          </div>
          <p className="text-muted">Gérez la liste des chauffeurs et créez-en de nouveaux.</p>
        </Col>
      </Row>
    
      {alert && (
        <Row className="mb-4">
          <Col>
            <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
              {alert.message}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setAlert(null)} 
                aria-label="Close"
              ></button>
            </div>
          </Col>
        </Row>
      )}

      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Liste des Chauffeurs</h5>
          <span className="badge" style={{ backgroundColor: "#1FB05B" }}>{chauffeurs.length} chauffeur{chauffeurs.length !== 1 ? 's' : ''}</span>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ color: "#1FB05B" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Chargement des chauffeurs...</p>
            </div>
          ) : (
            <>
              {chauffeurs.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FaUser size={48} style={{ color: "#1FB05B" }} />
                  </div>
                  <h5>Aucun chauffeur trouvé</h5>
                  <p className="text-muted">Cliquez sur "Nouveau Chauffeur" pour en ajouter un.</p>
                  <Button 
                    style={buttonStyle}
                    onClick={openCreateModal}
                  >
                    <FaPlus className="me-2" /> Nouveau Chauffeur
                  </Button>
                </div>
              ) : (
                <>
                  <Table responsive hover>
                    <thead className="table-light">
                      <tr>
                        <th className="text-center" style={{width: '60px'}}>#</th>
                        <th>Nom</th>
                        <th>Téléphone</th>
                        <th>Email</th>
                        <th>Adresse</th>
                        <th style={{width: '120px'}}>État</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chauffeurs.map((chauffeur, index) => (
                        <tr key={chauffeur.id}>
                          <td className="text-center">{index + 1}</td>
                          <td>
                            <strong>{chauffeur.nom}</strong>
                          </td>
                          <td>
                            <FaPhone className="me-2 text-muted" size={12} />
                            {chauffeur.telephone}
                          </td>
                          <td>
                            {chauffeur.email ? (
                              <>
                                <FaEnvelope className="me-2 text-muted" size={12} />
                                {chauffeur.email}
                              </>
                            ) : '-'}
                          </td>
                          <td>{chauffeur.adresse || '-'}</td>
                          <td>
                            {chauffeur.status === "en_attente" ? (
                              <span className="badge bg-warning text-dark">En attente</span>
                            ) : (
                              <span className="badge bg-success text-light">Validé</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  {/* Pagination Component */}
                  <div className="mt-3">
                    <PaginationComponent 
                      currentPage={paginationMetadata.current_page}
                      totalPages={paginationMetadata.last_page}
                      onPageChange={handlePageChange}
                      perPage={paginationMetadata.per_page}
                      onPerPageChange={handlePerPageChange}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal Chauffeur */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" style={{ color: "#1FB05B" }} />
            Nouveau Chauffeur
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaUser />
                    </span>
                    <Form.Control 
                      type="text" 
                      name="nom" 
                      value={currentChauffeur.nom} 
                      onChange={handleInputChange}
                      placeholder="Votre nom" 
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone <span className="text-danger">*</span></Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaPhone />
                    </span>
                    <Form.Control 
                      type="tel" 
                      name="telephone" 
                      value={currentChauffeur.telephone} 
                      onChange={handleInputChange}
                      placeholder="Votre téléphone" 
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaEnvelope />
                    </span>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      value={currentChauffeur.email} 
                      onChange={handleInputChange}
                      placeholder="Votre email" 
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Adresse</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaMapMarkerAlt />
                    </span>
                    <Form.Control 
                      type="text" 
                      name="adresse" 
                      value={currentChauffeur.adresse} 
                      onChange={handleInputChange}
                      placeholder="Votre adresse" 
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button style={buttonStyle} onClick={handleSubmit}>
            Créer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </>
  );
};

export default Chauffeurs;
