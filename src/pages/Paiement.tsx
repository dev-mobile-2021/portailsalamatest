import { useState, useEffect } from "react";

declare global {
    interface Window {
        paypal: any;
    }
}
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { FaCreditCard, FaPaypal } from "react-icons/fa";

const Paiement = () => {
    const [paymentMethod, setPaymentMethod] = useState<"creditCard" | "paypal" | null>(null);
    const [cardInfo, setCardInfo] = useState({ cardNumber: "", expiry: "", cvv: "" });
    const [paypalEmail, setPaypalEmail] = useState("");
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

    useEffect(() => {
        if (paymentMethod === "paypal") {
            // Charger le script PayPal si nécessaire
            const script = document.createElement("script");
            script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID"; // Remplacez par votre propre client ID
            script.async = true;
            script.onload = () => {
                if (window.paypal) {
                    window.paypal.Buttons({
                        createOrder: (actions: any) => {
                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        value: '35.47' // Montant de la commande
                                    }
                                }]
                            });
                        },
                        onApprove: (actions: any) => {
                            return actions.order.capture().then(function (details: any) {
                                alert("Paiement effectué avec succès. Bonjour " + details.payer.name.given_name);
                                setIsPaymentConfirmed(true);
                            });
                        }
                    }).render("#paypal-button-container");
                }
            };
            document.body.appendChild(script);
        }
    }, [paymentMethod]);

    const handleSubmit = () => {
        if (paymentMethod === "creditCard" && cardInfo.cardNumber && cardInfo.expiry && cardInfo.cvv) {
            setIsPaymentConfirmed(true);
        } else if (paymentMethod === "paypal" && paypalEmail) {
            setIsPaymentConfirmed(true);
        } else {
            alert("Veuillez remplir toutes les informations nécessaires.");
        }
    };

    return (
        <Container className="py-5">
            <Row>
                <Col md={8}>
                    <h3 className="mb-4 fw-bold">💳 Choisissez votre mode de paiement</h3>

                    {/* Sélection du mode de paiement */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card className="p-3 shadow-sm" onClick={() => setPaymentMethod("creditCard")}>
                                <div className="d-flex align-items-center">
                                    <FaCreditCard size={40} color="#007bff" />
                                    <span className="ms-3">Carte Bancaire</span>
                                </div>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="p-3 shadow-sm" onClick={() => setPaymentMethod("paypal")}>
                                <div className="d-flex align-items-center">
                                    <FaPaypal size={40} color="#007bff" />
                                    <span className="ms-3">PayPal</span>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Formulaire de paiement pour la carte bancaire */}
                    {paymentMethod === "creditCard" && (
                        <Card className="p-4 shadow-sm">
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Numéro de carte</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="1234 5678 9876 5432"
                                        value={cardInfo.cardNumber}
                                        onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
                                    />
                                </Form.Group>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Date d'expiration</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="MM/AA"
                                                value={cardInfo.expiry}
                                                onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>CVV</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="123"
                                                value={cardInfo.cvv}
                                                onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                    )}

                    {/* Formulaire de paiement PayPal */}
                    {paymentMethod === "paypal" && (
                        <Card className="p-4 shadow-sm">
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Adresse e-mail PayPal</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="votre.email@paypal.com"
                                        value={paypalEmail}
                                        onChange={(e) => setPaypalEmail(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                            <div id="paypal-button-container"></div>
                        </Card>
                    )}

                    {/* Bouton de confirmation */}
                    <Button
                        variant="success"
                        className="mt-3 w-100 btn-button"
                        onClick={handleSubmit}
                    >
                        Confirmer le paiement
                    </Button>


                    {/* Confirmation de paiement */}
                    {isPaymentConfirmed && (
                        <div className="mt-4 text-center">
                            <h5 className="text-success">Paiement confirmé ! 🎉</h5>
                            <p>Votre commande a été enregistrée et sera expédiée sous peu.</p>
                        </div>
                    )}
                </Col>

                {/* Colonne Droite - Récapitulatif de commande */}
                <Col md={4}>
                    <Card className="p-4 shadow-lg rounded-3">
                        <h4 className="fw-bold">📦 Récapitulatif</h4>
                        <hr />
                        <div className="d-flex justify-content-between text-muted">
                            <span>Sous-total:</span>
                            <strong>35.47 €</strong>
                        </div>
                        <div className="d-flex justify-content-between text-muted">
                            <span>Frais de livraison:</span>
                            <strong>Gratuite</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                            <h5>Total:</h5>
                            <h5 className="text-success fw-bold">35.47 €</h5>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Paiement;
