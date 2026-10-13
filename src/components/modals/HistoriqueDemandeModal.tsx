import React from "react";
import { Modal, Button, Badge, Table, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaHistory } from "react-icons/fa";
import { HistoriqueDemandeClient } from "../../types/HistoriqueDemandeClient.types";

interface HistoriqueDemandeModalProps {
  show: boolean;
  onHide: () => void;
  articleDesignation?: string;
  historique: HistoriqueDemandeClient[];
}

const HistoriqueDemandeModal: React.FC<HistoriqueDemandeModalProps> = ({
  show,
  onHide,
  articleDesignation,
  historique,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header
        closeButton
        style={{ border: "none", backgroundColor: "#f8f9fa" }}
        className="px-4 pt-4"
      >
        <Modal.Title className="d-flex align-items-center">
       
          <div>
            <h5 className="m-0 fw-bold" style={{ color: "#212529" }}>
              Historique des demandes
            </h5>
            <span className="text-muted" style={{ fontSize: "0.9rem" }}>
              {articleDesignation || "Article"}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-4">
        {historique.length === 0 ? (
          <Alert variant="info" className="text-center">
            <FaHistory className="me-2" />
            Aucune demande enregistrée pour cet article.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th className="text-center">#</th>
                  <th className="text-center">Date</th>
                  <th className="text-center">Qté actuelle</th>
                  <th className="text-center">Qté demandée</th>
                  <th>Motif</th>
                  <th className="text-center">Statut</th>
                  <th>Traitement</th>
                </tr>
              </thead>
              <tbody>
                {historique
                  .sort(
                    (a, b) =>
                      new Date(b.date_demande).getTime() -
                      new Date(a.date_demande).getTime()
                  )
                  .map((demande, index) => {
                    const isEnAttente =
                      demande.statut === 0 ||
                      demande.statut === "0" ||
                      demande.statut === "en_attente" ||
                      demande.statut === "pending";
                    const isAcceptee =
                      demande.statut === 1 ||
                      demande.statut === "1" ||
                      demande.statut === "acceptee" ||
                      demande.statut === "accepted";
                    const isRefusee =
                      demande.statut === -1 ||
                      demande.statut === "-1" ||
                      demande.statut === "refusee" ||
                      demande.statut === "refused";

                    return (
                      <tr key={demande.id}>
                        <td className="text-center">{index + 1}</td>
                        <td
                          className="text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {new Date(demande.date_demande).toLocaleDateString(
                            "fr-FR"
                          )}
                          <br />
                          <small className="text-muted">
                            {new Date(demande.date_demande).toLocaleTimeString(
                              "fr-FR",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </small>
                        </td>
                        <td className="text-center fw-semibold">
                          {demande.quantite_actuelle}
                        </td>
                        <td className="text-center">
                          <Badge bg="primary" className="px-2 py-1">
                            {demande.quantite_demandee}
                          </Badge>
                        </td>
                        <td style={{ maxWidth: "200px" }}>
                          <span
                            className="text-truncate d-inline-block"
                            style={{ maxWidth: "180px" }}
                            title={demande.motif_demande}
                          >
                            {demande.motif_demande || (
                              <em className="text-muted">Non spécifié</em>
                            )}
                          </span>
                        </td>
                        <td className="text-center">
                          <Badge
                            bg={
                              isEnAttente
                                ? "warning"
                                : isAcceptee
                                ? "success"
                                : isRefusee
                                ? "danger"
                                : "secondary"
                            }
                            className="px-2 py-1"
                          >
                            {isEnAttente
                              ? "En attente"
                              : isAcceptee
                              ? "Acceptée"
                              : isRefusee
                              ? "Refusée"
                              : "Inconnue"}
                          </Badge>
                        </td>
                        <td>
                          {demande.date_traitement ? (
                            <>
                              {new Date(
                                demande.date_traitement
                              ).toLocaleDateString("fr-FR")}
                              {demande.motif_refus && (
                                <OverlayTrigger
                                  placement="left"
                                  overlay={
                                    <Tooltip id={`motif-refus-${demande.id}`}>
                                      {demande.motif_refus}
                                    </Tooltip>
                                  }
                                >
                                  <Badge
                                    bg="light"
                                    text="danger"
                                    className="ms-1"
                                    style={{ cursor: "pointer" }}
                                  >
                                    ?
                                  </Badge>
                                </OverlayTrigger>
                              )}
                            </>
                          ) : (
                            <em className="text-muted">-</em>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer
        style={{ border: "none" }}
        className="px-4 pb-4 justify-content-center"
      >
        <Button variant="primary" onClick={onHide} className="px-4">
          <i className="fas fa-times me-1"></i>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HistoriqueDemandeModal;
