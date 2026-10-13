import React from "react";
import { useNavigate } from "react-router-dom";
import pdf_icon from "../assets/images/pdf.png";

interface TenderCardProps {
    id: number;
    titre: string;
    publishedDate: string;
    reference: string;
    deadline: string;
    description: string;
    type?: "appel-d'offres" | "achatDirectNational"| "achatDirectInternational" |"Consultation/cotation";
    status?: "ouvert" | "traitement" | "cloture";
}

const CardT: React.FC<TenderCardProps> = ({
    id, titre, publishedDate, reference, deadline, description, type, status
}) => {
    const navigate = useNavigate();

    return (
        <div className="border-bottom py-3">
            <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex">
                    <div className="me-3 col-2">
                        <small className="text-muted">
                            Publié le {publishedDate}
                        </small>
                    </div>
                    <div>
                        <small className="text-muted">
                            Référence : {reference} &nbsp;
                            <b className="fw-bold text-dark">{titre} </b> / Date limite : {deadline}
                        </small> <br />
                        <small>
                            <b>&nbsp; {type}</b>
                        </small>
                        <p className="mt-2 mb-0 text-dark">{description}</p>
                        <button
                            className="btn btn-sm btn-outline-primary mt-2 rounded-pill px-3"
                            onClick={() => {
                                if (type === "achatDirectNational") {
                                    navigate(`/tender/achat-direct-national/${id}`);
                                } else if (type === "achatDirectInternational") {
                                    navigate(`/tender/achat-direct-internationale/${id}`);
                                } else if (type === "Consultation/cotation") {
                                    if (status === "traitement") {
                                        navigate(`/TenderConsultationTraitement/${id}`);
                                    } else {
                                        navigate(`/tender/consultation-cotation/${id}`);
                                    }
                                } else {
                                    navigate(`/client/tender/${id}`);
                                }
                            }
                        }

                        >
                            Consulter la commande
                        </button>
                    </div>
                </div>

                <div className="text-end">
                    <img
                        src={pdf_icon}
                        alt="PDF Icon"
                        style={{ width: '16px', height: '16px', marginRight: '8px' }}
                    />

                </div>
            </div>
        </div>
    );
};

export default CardT;
