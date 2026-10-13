import { FC } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { PAYS } from "../assets/json/All countries";
import Select from "react-select";

interface AddressFormProps {
    addressInfo: {
        firstName: string;
        lastName: string;
        country: string;
        city: string;
        address: string;
        phone: string;
        email: string;
    };
    setAddressInfo: (info: any) => void;
    title: string;
}

const AddressForm: FC<AddressFormProps> = ({ addressInfo, setAddressInfo, title }) => {
    
    const paysOptions = PAYS.map((pays) => ({
        value: pays.alpha3Code,
        label: pays.name,
    }));

    return (
        <>
            <h4>{title}</h4>
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Prénom *</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            value={addressInfo.firstName}
                            onChange={(e) => setAddressInfo({ ...addressInfo, firstName: e.target.value })}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Nom *</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            value={addressInfo.lastName}
                            onChange={(e) => setAddressInfo({ ...addressInfo, lastName: e.target.value })}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Pays <span className="text-danger"> *</span></Form.Label>
                            <Select options={paysOptions} onChange={
                                (e) =>
                                    setAddressInfo({
                                        ...addressInfo,
                                        country: e?.label,
                                    })
                            } />
                        </Form.Group>
                    </Form.Group>
                </Col>

            </Row>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Adresse *</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            value={addressInfo.address}
                            onChange={(e) => setAddressInfo({ ...addressInfo, address: e.target.value })}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Ville *</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            value={addressInfo.city}
                            onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Téléphone *</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            value={addressInfo.phone}
                            onChange={(e) => setAddressInfo({ ...addressInfo, phone: e.target.value })}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>E-mail *</Form.Label>
                        <Form.Control
                            type="email"
                            required
                            value={addressInfo.email}
                            onChange={(e) => setAddressInfo({ ...addressInfo, email: e.target.value })}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
};

export default AddressForm;
