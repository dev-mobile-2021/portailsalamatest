import { FaShoppingCart, FaTruck, FaCreditCard, FaCheckCircle } from "react-icons/fa";
import { Container, Row, Col } from "react-bootstrap";
interface StepIndicatorProps {
    currentStep: number;
}
const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
    const steps = [
        { id: 1, label: "Panier", icon: <FaShoppingCart /> },
        { id: 2, label: "Livraison", icon: <FaTruck /> },
        { id: 3, label: "Paiement", icon: <FaCreditCard /> },
        { id: 4, label: "Confirmation", icon: <FaCheckCircle /> },
    ];

    return (
        <Container className="my-4">
            <Row className="justify-content-center">
                <Col xs={12} md={10}>
                    <div className="position-relative d-flex justify-content-between align-items-center">
                        {/* Barre de progression animée */}
                        <div className="progress-line position-absolute w-100" style={{ top: "25px", zIndex: 0 }}></div>
                        <div
                            className="progress-line-filled position-absolute"
                            style={{
                                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                                top: "25px",
                                zIndex: 1
                            }}
                        ></div>

                        {/* Étapes */}
                        {steps.map((step) => (
                            <div key={step.id} className="text-center position-relative step">
                                <div
                                    className={`step-icon d-flex align-items-center justify-content-center 
                                        ${currentStep >= step.id ? "active" : ""}`}
                                >
                                    {step.icon}
                                </div>
                                <small className={`d-block mt-2 ${currentStep >= step.id ? "text-dark fw-bold" : "text-muted"}`}>
                                    {step.label}
                                </small>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>

            {/* Styles CSS */}
            <style>
                {`
                    .progress-line {
                        height: 4px;
                        background: #e0e0e0;
                        position: absolute;
                    }
                    
                    .progress-line-filled {
                        height: 4px;
                        background: #28a745;
                        position: absolute;
                        transition: width 0.4s ease-in-out;
                    }

                    .step {
                        flex-grow: 1;
                        z-index: 2;
                    }

                    .step-icon {
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        background: #f8f9fa;
                        border: 3px solid #e0e0e0;
                        font-size: 20px;
                        transition: all 0.3s ease-in-out;
                    }

                    .step-icon.active {
                        background: #28a745;
                        border-color: #28a745;
                        color: white;
                        box-shadow: 0px 0px 8px rgba(40, 167, 69, 0.5);
                    }
                `}
            </style>
        </Container>
    );
};

export default StepIndicator;
