import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Form, Modal } from "react-bootstrap";
import Title from "../components/const/Title";
import { useAuthContext } from "../hooks/useUserhook";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTruck, FaCar } from "react-icons/fa";
import PaginationComponent from "../components/PaginationComponent";
import SmallHeader from "../components/const/SmallHeader";
import { graphQLClient } from "../api/client";

// Define Vehicule interface
interface Vehicule {
  id: string;
  matricule: string;
  marque: string;
  volume: number;
  description: string;
  typeVehicule: string;
  tonnage: string;
  status?: string;
}

// Define form data type
interface VehiculeFormData {
  matricule: string;
  marque: string;
  volume: number;
  description: string;
  typeVehicule: string;
  tonnage: string;
}

// Define pagination metadata type
interface PaginationMetadata {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// Interface pour les tonnages de l'API
interface Tonnage {
  id: string;
  tonnage: number;
  unite_id: string;
  designation: string;
  unite: {
    id: string;
    designation: string;
    code: string;
  };
}

// Interface pour les types de véhicules de l'API
interface TypeVehicule {
  id: string;
  designation: string;
  description: string;
}

const Vehicules = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, _setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentVehicule, setCurrentVehicule] = useState<VehiculeFormData>({
    matricule: "",
    marque: "",
    volume: 0,
    description: "",
    typeVehicule: "",
    tonnage: ""
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

  // États pour les données de l'API
  const [tonnages, setTonnages] = useState<Tonnage[]>([]);
  const [typesVehicule, setTypesVehicule] = useState<TypeVehicule[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);

  // Protect the route
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Récupérer les tonnages et types de véhicules depuis l'API
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        // Requête pour les tonnages
        const tonnagesQuery = `{ tonnages { id, tonnage, unite_id, designation, unite { id, designation, code } } }`;
        const tonnagesResponse = await graphQLClient.post('', { query: tonnagesQuery });
        if (tonnagesResponse?.data?.data?.tonnages) {
          setTonnages(tonnagesResponse.data.data.tonnages);
        }

        // Requête pour les types de véhicules
        const typesQuery = `{ typevehicules { id, designation, description } }`;
        const typesResponse = await graphQLClient.post('', { query: typesQuery });
        if (typesResponse?.data?.data?.typevehicules) {
          setTypesVehicule(typesResponse.data.data.typevehicules);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des options:", err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentVehicule(prev => ({
      ...prev,
      [name]: name === "volume" ? parseFloat(value) || 0 : value
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setCurrentVehicule({
      matricule: "",
      marque: "",
      volume: 0,
      description: "",
      typeVehicule: "",
      tonnage: ""
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      if (!currentVehicule.matricule.trim()) {
        setAlert({
          type: "danger",
          message: "Le matricule est requis."
        });
        return;
      }
      
      if (!currentVehicule.marque.trim()) {
        setAlert({
          type: "danger",
          message: "La marque est requise."
        });
        return;
      }

      if (!currentVehicule.typeVehicule) {
        setAlert({
          type: "danger",
          message: "Le type de véhicule est requis."
        });
        return;
      }

      if (!currentVehicule.tonnage) {
        setAlert({
          type: "danger",
          message: "Le tonnage est requis."
        });
        return;
      }

      // Générer un ID temporaire unique pour le nouveau véhicule
      const tempId = `temp-${Date.now()}`;
      
      // Ajouter directement le véhicule au sommet de la liste
      const newVehicule: Vehicule = {
        id: tempId,
        matricule: currentVehicule.matricule,
        marque: currentVehicule.marque,
        volume: currentVehicule.volume,
        description: currentVehicule.description,
        typeVehicule: currentVehicule.typeVehicule,
        tonnage: currentVehicule.tonnage,
        status: "en_attente"
      };
      
      // Ajouter le véhicule au début de la liste
      setVehicules(prev => [newVehicule, ...prev]);
      
      // Mettre à jour les métadonnées de pagination
      setPaginationMetadata(prev => ({
        ...prev,
        total: prev.total + 1
      }));
      
      setAlert({
        type: "success",
        message: "Le véhicule a été ajouté et est en attente de validation."
      });
      
      // Close modal and reset form
      setShowModal(false);
      setCurrentVehicule({
        matricule: "",
        marque: "",
        volume: 0,
        description: "",
        typeVehicule: "",
        tonnage: ""
      });
      
      // Auto-dismiss alert after 5 seconds
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    } catch (error) {
      console.error("Error saving vehicule:", error);
      setAlert({
        type: "danger",
        message: "Une erreur est survenue lors de l'enregistrement du véhicule."
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
            titleText="Gestion des Véhicules"
            spanText="Véhicules"
          />
          <div className="d-flex justify-content-end mr-5">
            <Button 
              style={buttonStyle}
              className="d-flex align-items-center" 
              onClick={openCreateModal}
            >
              <FaPlus className="me-2" /> Nouveau Véhicule
            </Button>
          </div>
          <p className="text-muted">Gérez la liste des véhicules et créez-en de nouveaux.</p>
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
          <h5 className="mb-0">Liste des Véhicules</h5>
          <span className="badge" style={{ backgroundColor: "#1FB05B" }}>{vehicules.length} véhicule{vehicules.length !== 1 ? 's' : ''}</span>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ color: "#1FB05B" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Chargement des véhicules...</p>
            </div>
          ) : (
            <>
              {vehicules.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FaTruck size={48} style={{ color: "#1FB05B" }} />
                  </div>
                  <h5>Aucun véhicule trouvé</h5>
                  <p className="text-muted">Cliquez sur "Nouveau Véhicule" pour en ajouter un.</p>
                  <Button 
                    style={buttonStyle}
                    onClick={openCreateModal}
                  >
                    <FaPlus className="me-2" /> Nouveau Véhicule
                  </Button>
                </div>
              ) : (
                <>
                  <Table responsive hover>
                    <thead className="table-light">
                      <tr>
                        <th className="text-center" style={{width: '60px'}}>#</th>
                        <th>Matricule</th>
                        <th>Marque</th>
                        <th>Type</th>
                        <th>Tonnage</th>
                        <th>Volume (m³)</th>
                        <th style={{width: '120px'}}>État</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicules.map((vehicule, index) => (
                        <tr key={vehicule.id}>
                          <td className="text-center">{index + 1}</td>
                          <td>
                            <strong>{vehicule.matricule}</strong>
                          </td>
                          <td>{vehicule.marque}</td>
                          <td>
                            <span className="badge bg-info text-dark">{vehicule.typeVehicule}</span>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{vehicule.tonnage}</span>
                          </td>
                          <td>{vehicule.volume || '-'}</td>
                          <td>
                            {vehicule.status === "en_attente" ? (
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

      {/* Modal Vehicule */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCar className="me-2" style={{ color: "#1FB05B" }} />
            Nouveau Véhicule
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Matricule <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="matricule" 
                    value={currentVehicule.matricule} 
                    onChange={handleInputChange}
                    placeholder="Votre matricule" 
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Marque <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="marque" 
                    value={currentVehicule.marque} 
                    onChange={handleInputChange}
                    placeholder="Votre marque" 
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de véhicule <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="typeVehicule" 
                    value={currentVehicule.typeVehicule} 
                    onChange={handleInputChange}
                    required
                    disabled={loadingOptions}
                  >
                    <option value="">
                      {loadingOptions ? "Chargement..." : "Sélectionnez un type"}
                    </option>
                    {typesVehicule.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.designation}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tonnage <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="tonnage" 
                    value={currentVehicule.tonnage} 
                    onChange={handleInputChange}
                    required
                    disabled={loadingOptions}
                  >
                    <option value="">
                      {loadingOptions ? "Chargement..." : "Sélectionnez un tonnage"}
                    </option>
                    {tonnages.map((tonnage) => (
                      <option key={tonnage.id} value={tonnage.id}>
                        {tonnage.designation || `${tonnage.tonnage} ${tonnage.unite?.code || 'T'}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Volume (m³)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="volume" 
                    value={currentVehicule.volume || ""} 
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                name="description" 
                value={currentVehicule.description} 
                onChange={handleInputChange}
                placeholder="Votre description" 
              />
            </Form.Group>
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

export default Vehicules;
