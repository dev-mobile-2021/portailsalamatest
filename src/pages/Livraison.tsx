import { Container, Row, Col, Card } from "react-bootstrap";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { useDelivery } from "../hooks/useUserDelivery";
import { getPanierQuery } from "../api/graphql/queries";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { Panier, PanierProduit } from "../types/panier.types";
import { useEffect, useState } from "react";
import { getDeliveryFee } from "../utils/outils";

const Livraison = () => {
    const { user } = useOutletContext<{ user: any; isAuthLoading: boolean }>();
    const { useFetchAll } = useCrudGraph<Panier>('paniers');
    const { data: panier } = useFetchAll(getPanierQuery(user?.id), {}, { enabled: !!user?.id });
    const [cartItems, setCartItems] = useState<PanierProduit[]>([]);
    const { deliveryAddress, deliveryMode } = useDelivery();
    
    // Charger les articles du panier
    useEffect(() => {
        if (user?.id) {
            setCartItems(panier?.[0]?.panierproduits || []);
        }
    }, [user?.id, panier]);

    // Calculer les frais de livraison
    const frais = deliveryMode?.code === "pdr" ? 0 : deliveryAddress ? getDeliveryFee(deliveryAddress) : 0;

    // Calculer le sous-total et le total avec frais de livraison
    const sousTotal = cartItems?.reduce((acc, item) => acc + item.prix * item.quantite, 0) || 0;
    const totalPriceWithDelivery = sousTotal + frais;

    return (
        <Container fluid className="py-5">
            <Row className="align-items-start">
                {/* Route enfant */}
                <Col md={8} className="shadow-none border-0 p-0">
                    <Card className="shadow-none mx-5 border-0">
                        <Outlet />
                    </Card>
                </Col>

                {/* Right Column: Summary */}
                <Col md={4}>
                    <Card className="p-4 rounded-3">
                        <h4 className="fw-bold">📦 Récapitulatif</h4>
                        <hr />
                        <div className="d-flex justify-content-between text-muted">
                            <span>Sous-total:</span>
                            <strong>{sousTotal.toFixed(2)} Ar</strong>
                        </div>
                        <div className="d-flex justify-content-between text-muted">
                            <span>Frais de livraison:</span>
                            <strong>
                                {deliveryMode?.code === "pdr" ? "Gratuit" : `${frais.toFixed(2)} Ar`}
                            </strong>
                        </div>
                        {/* Adresse de livraison */}
                        {deliveryAddress && (
                            <div className="d-flex justify-content-between text-muted">
                                <span>Livraison:</span>
                                <strong>{deliveryAddress}</strong>
                            </div>
                        )}
                        <hr />
                        <div className="d-flex justify-content-between">
                            <h5>Total:</h5>
                            <h5 className="text-success fw-bold">{totalPriceWithDelivery.toFixed(2)} Ar</h5>
                        </div>
                        <NavLink to="/livraison/modelivraison" className="w-100 mt-3 btn-button fw-bold">
                            Valider la livraison
                        </NavLink>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Livraison;