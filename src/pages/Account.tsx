

import { Row, Col, Card } from 'react-bootstrap';
import { FaUser, FaMapPin, FaHistory } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Account = () => {
    const sections = [
        {
            icon: <FaUser size={40} className="text-primary" />,
            title: "Informations",
            link: "/profile/profileparam",
            color: "primary",
        },
        {
            icon: <FaMapPin size={40} className="text-success" />,
            title: "Ajouter une première adresse",
            link: "/profile/delivery_address",
            color: "success",
        },
        {
            icon: <FaHistory size={40} className="text-warning" />,
            title: "Historique et détails de mes commandes",
            link: "/profile/orders",
            color: "warning",
        },
        {
            icon: <FaHistory size={40} className="text-warning" />,
            title: "vos recompenses",
            link: "/profile/recompenses",
            color: "warning",
        },
    ];

    return (
        <>
            <h6 className="text-uppercase text-muted mb-4">Numéro Client - 23333</h6>
            <Row className="g-4">
                {sections.map((section, index) => (
                    <Col md={4} key={index}>
                        <Card className="text-center shadow-lg border-0 rounded-5 p-3 bg-light" style={{ height: "100%" }}>
                            <Card.Body>
                                <div className="mb-3">{section.icon}</div>
                                <p >{section.title}</p>
                                <NavLink to={section.link} className="btn-button " >
                                    Voir plus
                                </NavLink>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    )
}

export default Account