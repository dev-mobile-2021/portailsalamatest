import { getDepotQuery, getModelivraisonQuery } from "../api/graphql/queries";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { ModeLivraison, Depot } from "../types/modelivraison.types";
import { Container, Card, Row, Col } from "react-bootstrap";
import { useDelivery } from "../hooks/useUserDelivery";
import Mapcard from "./Mapcard";

const AdressPage = () => {
    const { data: modelivraisons = [] } = useCrudGraph<ModeLivraison>("modelivraisons").useFetchAll(getModelivraisonQuery);
    const { data: depots = [] } = useCrudGraph<Depot>("depots").useFetchAll(getDepotQuery);
    const {
        currentPosition,
        deliveryMode,
        setDeliveryMode,
        selectedDepot,
        setSelectedDepot,
        setotherPosition,
    } = useDelivery();

    // Définir le mode de livraison par défaut
    // useEffect(() => {
    //     if (modelivraisons.length > 0) {
    //         const defaultMode = modelivraisons.find((mode) => mode.code === "lad");
    //         if (defaultMode) {
    //             setDeliveryMode(defaultMode);
    //         }
    //     }
    // }, [modelivraisons]);

    const handleSelectMode = (mode: ModeLivraison) => {
        setDeliveryMode(mode);
        setSelectedDepot(null);
    };

    const handleSelectDepot = (depot: Depot) => {
        setSelectedDepot(depot);

        // Convertir les valeurs en nombres
        const lat = parseFloat(depot.latitude.toString());
        const lng = parseFloat(depot.longitude.toString());

        // Vérifier que les valeurs sont valides
        if (isNaN(lat) || isNaN(lng)) {
            console.error("Latitude ou longitude invalide :", depot.latitude, depot.longitude);
            return;
        }

        // Mettre à jour la position
        setotherPosition({ lat, lng });
    };

    return (
        <Container className="address-page-container">
            {/* Carte */}
            <div className="map-container">
                {currentPosition && <Mapcard />}
            </div>

            {/* Sélection du mode de livraison */}
            <div className="delivery-mode-section p-5">
                <h4 className="h4">Choisissez un mode de livraison</h4>
                <Row className="radio-button-group">
                    {modelivraisons.map((mode) => (
                        <Col key={mode.id} md={4} className="mb-3">
                            <div className="form-check">
                                <input
                                    className={`form-check-input ${deliveryMode?.id === mode.id ? "is-valid" : ""}`}
                                    type="radio"
                                    name="deliveryMode"
                                    id={`mode-${mode.id}`}
                                    checked={deliveryMode?.id === mode.id}
                                    onChange={() => handleSelectMode(mode)}
                                />
                                <label className="form-check-label" htmlFor={`mode-${mode.id}`}>
                                    {mode.designation}
                                </label>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Sélection du dépôt */}
            {deliveryMode && deliveryMode.code === "pdr" && (
                <>
                    <Row className="depot-card-container px-5">
                        <h4 className="mb-4 text-left h4">Choisissez un dépôt</h4>
                        {depots.map((depot) => (
                            <Col key={depot.id} md={5} className="mb-3">
                                <Card
                                    className={`depot-card text-center p-3 ${selectedDepot?.id === depot.id ? "selected" : ""}`}
                                    onClick={() => handleSelectDepot(depot)}
                                >
                                    <Card.Body className="p-0">
                                        <Card.Title className="card-title">{depot.designation}</Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </Container>
    );
};

export default AdressPage;