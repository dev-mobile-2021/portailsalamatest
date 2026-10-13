import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Form, Modal, Dropdown } from "react-bootstrap";
import Title from "../components/const/Title";
import { useAuthContext } from "../hooks/useUserhook";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaFilter, FaUserShield, FaClipboardList, FaSearch, FaEye, FaMapMarkerAlt, FaEdit, FaEllipsisV } from "react-icons/fa";
import useFabricants from "../hooks/useFabricants";
import PaginationComponent from "../components/PaginationComponent";
import SmallHeader from "../components/const/SmallHeader";

import { Fabricant } from "../types/fabricant.types";

interface FabricantInput {
  designation: string;
  code: string;
  email: string;
  telephone: string;
  adresse: string;
}


const Fabricants = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const { 
    fabricants, 
    loading, 
    mutationLoading,
    error: hookError,
    saveFabricant,
    updateFabricant,
    deleteFabricant,
    page,
    setPage,
    count,
    setCount,
    setEtat,
    userIdFilter,
    setUserIdFilter,
    paginationMetadata
  } = useFabricants();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentFabricant, setCurrentFabricant] = useState<FabricantInput>({
    designation: "",
    code: "",
    email: "",
    telephone: "",
    adresse: ""
  });
  const [alert, setAlert] = useState<{type: string, message: string} | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<Fabricant | null>(null);

  // Protect the route
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Show errors from hook
  useEffect(() => {
    if (hookError) {
      setAlert({
        type: "danger",
        message: typeof hookError === 'string' ? hookError : 'Une erreur est survenue'
      });
    }
  }, [hookError]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentFabricant((prev: FabricantInput) => ({
      ...prev,
      [name]: value
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setIsEditMode(false);
    setIsReadOnlyMode(false);
    setEditingId(null);
    setCurrentFabricant({
      designation: "",
      code: "",
      email: "",
      telephone: "",
      adresse: ""
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (fabricant: Fabricant) => {
    setIsEditMode(true);
    setIsReadOnlyMode(false);
    setEditingId(fabricant.id);
    setCurrentFabricant({
      designation: fabricant.designation || "",
      code: fabricant.code || "",
      email: fabricant.email || "",
      telephone: fabricant.telephone || "",
      adresse: fabricant.adresse || ""
    });
    setShowModal(true);
  };

  // Open details view in read-only mode
  const openDetailsModal = (fabricant: Fabricant) => {
    setIsEditMode(false);
    setIsReadOnlyMode(true);
    setEditingId(null);
    setCurrentFabricant({
      designation: fabricant.designation || "",
      code: fabricant.code || "",
      email: fabricant.email || "",
      telephone: fabricant.telephone || "",
      adresse: fabricant.adresse || ""
    });
    setSelectedDetails(fabricant);
    setShowModal(true);
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    try {
      if (!currentFabricant.designation.trim()) {
        setAlert({
          type: "danger",
          message: "Le nom du fabricant est requis."
        });
        return;
      }
      
      const payload = {
        ...(isEditMode && editingId ? { id: editingId } : {}),
        designation: currentFabricant.designation.trim(),
        code: currentFabricant.code.trim() || undefined,
        email: currentFabricant.email.trim() || undefined,
        telephone: currentFabricant.telephone.trim() || undefined,
        adresse: currentFabricant.adresse.trim() || undefined,
        ...(isEditMode ? {} : { user_id: user?.id })
      };

      if (isEditMode && editingId) {
        await updateFabricant(editingId, payload);
        setAlert({
          type: "success",
          message: "Le fabricant a été modifié avec succès."
        });
      } else {
        await saveFabricant(payload as any);
        setAlert({
          type: "success",
          message: "Le fabricant a été ajouté avec succès et est en attente de validation."
        });
      }
      
      setShowModal(false);
      setCurrentFabricant({
        designation: "",
        code: "",
        email: "",
        telephone: "",
        adresse: ""
      });
      
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDeleteClick = async (fabricant: Fabricant) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le fabricant "${fabricant.designation}" ?`)) {
      try {
        await deleteFabricant(fabricant.id);
        setAlert({
          type: "success",
          message: "Le fabricant a été supprimé."
        });
        setTimeout(() => setAlert(null), 5000);
      } catch {
        // Error handled by hook
      }
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage: number) => {
    setCount(newPerPage);
    setPage(1); // Reset to first page when changing items per page
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
            titleText="Gestion des Fabricants"
            spanText="Fabricants"
          />
          <div className="d-flex justify-content-end mr-5">
      <Button 
        style={buttonStyle}
        className="d-flex align-items-center" 
        onClick={openCreateModal}
      >
        <FaPlus className="me-2" /> Nouveau Fabricant
      </Button>
    </div>
          <p className="text-muted">Gérez la liste des fabricants et créez-en de nouveaux.</p>
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

      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                <div className="d-flex flex-column flex-md-row align-items-md-center mb-4 mb-lg-0 w-100">
                  <div className="d-flex align-items-center me-4 mb-3 mb-md-0">
                    <div 
                      className="d-flex align-items-center justify-content-center me-3" 
                      style={{ width: '48px', height: '48px', backgroundColor: 'rgba(31, 176, 91, 0.1)', borderRadius: '12px', color: '#1FB05B', flexShrink: 0 }}
                    >
                      <FaFilter size={20} />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold" style={{ color: "#2c3e50" }}>Filtres rapides</h6>
                      <p className="text-muted small mb-0">Recherche et filtres</p>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row align-items-sm-center">
                  <div className="bg-light rounded p-2 px-3 d-flex align-items-center mb-2 mb-sm-0 me-sm-3" style={{ border: '1px solid #e9ecef', whiteSpace: 'nowrap' }}>
                    <FaUserShield className="me-2" style={{ color: "#1FB05B" }} />
                    <Form.Check 
                      type="switch"
                      id="my-fabricants-switch"
                      label={<span className="fw-medium ms-1" style={{color: '#495057', fontSize: '0.9rem'}}>Mes fabricants</span>}
                      checked={userIdFilter === user?.id}
                      onChange={(e) => {
                        setUserIdFilter(e.target.checked ? user?.id : undefined);
                        setPage(1);
                      }}
                      className="mb-0"
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  <div className="bg-light rounded p-2 px-3 d-flex align-items-center" style={{ border: '1px solid #e9ecef', minWidth: '220px' }}>
                    <FaClipboardList className="me-2" style={{ color: "#1FB05B" }} />
                    <Form.Select 
                      size="sm" 
                      className="border-0 bg-transparent fw-medium shadow-none py-0 px-1"
                      onChange={(e) => {
                        const val = e.target.value;
                        setEtat(val === "" ? undefined : parseInt(val, 10));
                        setPage(1);
                      }}
                      style={{ cursor: "pointer", outline: 'none', color: '#495057', fontSize: '0.9rem' }}
                    >
                      <option value="">Tous les statuts</option>
                      <option value="1">Validés uniquement</option>
                      <option value="0">En attente uniquement</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex flex-wrap justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold" style={{ color: "#2c3e50" }}>Liste des Fabricants</h5>
          <span className="badge rounded-pill px-3 py-2 fw-medium mt-2 mt-sm-0" style={{ backgroundColor: "rgba(31, 176, 91, 0.1)", color: "#1FB05B", fontSize: '0.85rem' }}>
            {fabricants.length} fabricant{fabricants.length !== 1 ? 's' : ''} trouvé{fabricants.length !== 1 ? 's' : ''}
          </span>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ color: "#1FB05B" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Chargement des fabricants...</p>
            </div>
          ) : (
            <>
              {fabricants.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <FaSearch size={48} style={{ color: "#1FB05B" }} />
                  </div>
                  <h5>Aucun fabricant trouvé</h5>
                  <p className="text-muted">Cliquez sur "Nouveau Fabricant" pour en ajouter un.</p>
                  <Button 
                    style={buttonStyle}
                    onClick={openCreateModal}
                  >
                    <FaPlus className="me-2" /> Nouveau Fabricant
                  </Button>
                </div>
              ) : (
                <>
                   <Table responsive hover className="align-middle mt-3">
                    <thead className="table-light text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <tr>
                        <th className="text-center py-3 border-0 rounded-start" style={{width: '60px'}}>#</th>
                        <th className="py-3 border-0">Nom</th>
                        <th className="py-3 border-0" style={{width: '200px'}}>Adresse Principale</th>
                        <th className="py-3 border-0">Code</th>
                        <th style={{width: '140px'}} className="py-3 border-0 text-center">État</th>
                        <th style={{width: '120px'}} className="text-center py-3 border-0 rounded-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: 'none' }}>
                      {fabricants.map((fabricant, index) => (
                        <tr key={fabricant.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                          <td className="text-center text-muted fw-bold">{(page - 1) * count + index + 1}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <strong style={{ color: '#2c3e50', fontSize: '1.05rem' }}>{fabricant.designation}</strong>
                            </div>
                          </td>
                          <td className="text-muted">{fabricant.adresse || '-'}</td>
                          <td>
                            {fabricant.code ? (
                              <span className="badge bg-light text-dark border px-2 py-1">{fabricant.code}</span>
                            ) : '-'}
                          </td>
                          <td className="text-center">
                            <span 
                              className={`badge rounded-pill px-3 py-2 fw-medium ${fabricant.etat_badge || (fabricant.etat === 1 ? 'bg-success' : 'bg-warning')}`} 
                            >
                              {fabricant.etat_text || (fabricant.etat === 1 ? "Validé" : "En attente")}
                            </span>
                          </td>
                          <td className="text-center">
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="light" 
                                size="sm" 
                                className="shadow-sm"
                                id={`dropdown-${fabricant.id}`}
                                style={{ borderRadius: '8px', color: '#495057', border: 'none' }}
                              >
                                <FaEllipsisV />
                              </Dropdown.Toggle>

                              <Dropdown.Menu align="end">
                                <Dropdown.Item 
                                  onClick={() => openDetailsModal(fabricant)}
                                  className="text-primary"
                                >
                                  <FaEye className="me-2" /> Voir les détails
                                </Dropdown.Item>
                                
                                {fabricant.user_id === user?.id && fabricant.etat !== 1 && (
                                  <>
                                    <Dropdown.Divider />
                                    <Dropdown.Item 
                                      onClick={() => openEditModal(fabricant)}
                                      className="text-warning"
                                    >
                                      <FaEdit className="me-2" /> Modifier
                                    </Dropdown.Item>
                                    <Dropdown.Item 
                                      onClick={() => handleDeleteClick(fabricant)}
                                      className="text-danger"
                                    >
                                      <FaTrash className="me-2" /> Supprimer
                                    </Dropdown.Item>
                                  </>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  {/* Pagination Component */}
                  <div className="mt-3">
                    <PaginationComponent 
                      currentPage={paginationMetadata.current_page || page}
                      totalPages={paginationMetadata.last_page || 1}
                      onPageChange={handlePageChange}
                      perPage={paginationMetadata.per_page || count}
                      onPerPageChange={handlePerPageChange}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal for Create/Edit/Details Fabricant */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isReadOnlyMode ? "Détails du Fabricant" : isEditMode ? "Modifier le Fabricant" : "Nouveau Fabricant"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du Fabricant <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="designation" 
                    value={currentFabricant.designation} 
                    onChange={handleInputChange}
                    placeholder="Entrez le nom du fabricant" 
                    disabled={isReadOnlyMode}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Code</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="code" 
                    value={currentFabricant.code} 
                    onChange={handleInputChange}
                    placeholder="Code du fabricant"
                    disabled={isReadOnlyMode}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="telephone" 
                    value={currentFabricant.telephone} 
                    onChange={handleInputChange}
                    disabled={isReadOnlyMode}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="email" 
                    value={currentFabricant.email} 
                    onChange={handleInputChange}
                    placeholder="contact@fabricant.com"
                    disabled={isReadOnlyMode}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Adresse physique</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaMapMarkerAlt />
                    </span>
                    <Form.Control 
                      type="text" 
                      name="adresse"
                      value={currentFabricant.adresse} 
                      onChange={handleInputChange}
                      placeholder="Adresse complète"
                      disabled={isReadOnlyMode}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {isReadOnlyMode ? "Fermer" : "Annuler"}
          </Button>
          {isReadOnlyMode ? (
            selectedDetails && selectedDetails.user_id === user?.id && selectedDetails.etat !== 1 && (
              <Button 
                style={buttonStyle}
                onClick={() => {
                  setIsReadOnlyMode(false);
                  setIsEditMode(true);
                  setEditingId(selectedDetails.id);
                }}
              >
                <FaEdit className="me-2" /> Modifier
              </Button>
            )
          ) : (
            <Button style={buttonStyle} onClick={handleSubmit} disabled={mutationLoading}>
              {mutationLoading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier' : 'Créer')}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

    </Container>
    </>
  );
};

export default Fabricants;