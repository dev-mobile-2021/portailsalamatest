import { useEffect, useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import { getModepaiementQuery } from "../api/graphql/queries";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { ModePaiement as Mode_Paiement } from "../types/modelivraison.types";
import { BASE_URL } from "../utils/variable";
import { useDelivery } from "../hooks/useUserDelivery";


const ModePaiement = () => {
    const { data: modepaiements = [] } = useCrudGraph<Mode_Paiement>("modepaiements").useFetchAll(getModepaiementQuery);
    const [selected, setSelected] = useState<number | null>(null);
    const { setPaiementMode } = useDelivery();


    useEffect(() => {
        if (selected !== null) {
            const selectedMode = modepaiements.find(mode => mode.id === selected);
            if (selectedMode) {
                setPaiementMode(selectedMode);
            }
        }
    }, [selected, modepaiements]);

 

    return (
        <>
            <Row className="g-3">
                {modepaiements.map((mode) => (
                    <Col key={mode.id} xs={12} sm={6} md={5}>
                        <Card
                            className={`d-flex align-items-center p-2 border rounded-3 shadow-sm ${selected === mode.id ? "border-primary" : ""}`}
                            onClick={() => setSelected(mode.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="d-flex align-items-center w-100">
                                <img
                                    src={BASE_URL + mode.image}
                                    alt={mode.designation}
                                    className="me-3"
                                    style={{ width: "40px", height: "40px" }}
                                />
                                <span className="flex-grow-1 text-center fw-semibold">
                                    {mode.designation}
                                </span>
                                <Form.Check
                                    type="radio"
                                    checked={selected === mode.id}
                                    onChange={() => setSelected(mode.id)}
                                    className="ms-2"
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>


        </>
    );
};

export default ModePaiement;
