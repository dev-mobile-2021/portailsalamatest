import { Container, Row, Col, ListGroup, Image, Card, Form } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import { NavLink, useOutletContext } from "react-router-dom";
import { BASE_URL } from "../utils/variable";
import { usePanier } from "../hooks/usePanier";
import { User } from "../types/user.types";

const Cart = () => {
    const { user } = useOutletContext<{ user: User }>();
    const { cartItems, totalPrice, handleQuantityChange, handleRemoveProduct } = usePanier(user);

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                {/* Liste des produits */}
                <Col md={8} className="bg-white p-4 rounded">
                    <h3 className="mb-4 fw-bold">🛍️ Votre Panier</h3>
                    <ListGroup variant="flush">
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <ListGroup.Item key={item.produit_id} className="d-flex align-items-center py-3 border-bottom">
                                    <Image
                                        src={`${BASE_URL}${item.produit?.image}`}
                                        alt={item.produit?.designation}
                                        rounded
                                        className="me-3 shadow-sm"
                                        width={80}
                                        height={80}
                                    />
                                    <div className="flex-grow-1">
                                        <h5 className="mb-1">{item.produit?.designation}</h5>
                                        <p className="text-muted">{item.prix} Ar / unité</p>
                                    </div>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={item.quantite}
                                        className="w-25 text-center"
                                        onChange={(e) => handleQuantityChange(item.produit_id, parseInt(e.target.value))}
                                    />
                                    <FaTrashAlt
                                        className="text-danger ms-3"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleRemoveProduct(item)}
                                    />
                                </ListGroup.Item>
                            ))
                        ) : (
                            <p className="text-center text-muted">Votre panier est vide.</p>
                        )}
                    </ListGroup>
                </Col>

                {/* Récapitulatif du panier */}
                <Col md={4}>
                    <Card className="p-4 shadow-lg rounded-3">
                        <h4 className="fw-bold">📦 Récapitulatif</h4>
                        <hr />
                        <div className="d-flex justify-content-between text-muted">
                            <span>Sous-total:</span>
                            <strong>{totalPrice} Ar</strong>
                        </div>
                        <div className="d-flex justify-content-between text-muted">
                            <span>Frais de livraison:</span>
                            <strong>sera calculé</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                            <h5>Total:</h5>
                            <h5 className="text-success fw-bold">{totalPrice} Ar</h5>
                        </div>
                        <NavLink to="/livraison/addresse" className="w-100 btn-button mt-3">
                            Passer la commande
                        </NavLink>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Cart;