import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import dossier_icon from "../assets/images/dossier.png";
import { useNavigate } from "react-router-dom";
import back_icon from "../assets/images/back.png";
import SmallHeader from "../components/const/SmallHeader";
import useTypeCommandes from "../hooks/useTypeCommandes";
import SkeletonCardList from "../components/SkeletonCardList";

const ListeCommandesSimulees = () => {
  const navigate = useNavigate();
  const { typeCommandes, loading, error } = useTypeCommandes();

  // État pour le délai minimum d'affichage du skeleton (1.5 secondes)
  const [minDelayPassed, setMinDelayPassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayPassed(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // État de chargement global - on attend que les données soient chargées ET que le délai minimum soit passé
  const isLoading = loading || !minDelayPassed;

  // Ajout d'un type explicite pour les redirections
  const redirections: Record<string, string> = {
    "Commande Programme": "/commande/formulaire/0",
    "Commande RC Priv": "/commandeRcSansimpotForm",
    "Commande TEF": "/commandeTEF",
    "Commande FERME": "/commandeCF",
    "Commande BE": "/commandeBE",
    "Commande D'urgence": "/commandeUrgence",
    "Commande Enlèvement": "/commandeEnlevement",
    "Commande RC Public": "/CommandeRCPublic",
  };

  // if (loading) return <p>Chargement des types de commandes...</p>;
  // if (error) return <p>Erreur : {error}</p>;

  return (
    <Container className="py-4" style={{ minWidth: "90vw" }}>
      <SmallHeader />
      <hr />
      <button
        className="btn bg-theme my-2 rounded-2 border-none px-2 py-2 mb-4"
        onClick={() => {
          navigate(`/`);
        }}
      >
        <img src={back_icon} className="icon-size w-75" alt="" />
      </button>

      <h2 className="text-muted mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700 }}>
                      <i className="fas fa-list text-success" style={{ fontSize: '1rem' }}></i>
                      Type de commande (choisir un dossier pour passer une commande)
      </h2>

      {isLoading ? (
        <SkeletonCardList count={6}  />
      ) : error ? (
        <div className="alert alert-danger mt-3">Erreur : {error}</div>
      ) : (
        <Row>
        {typeCommandes.map((typeCommande) => {
          // Trouver la redirection correspondante
          const redirection = Object.keys(redirections).find((key) =>
            typeCommande.designation.includes(key)
          );

          return (
            <Col
              key={typeCommande.id}
              md={4}
              sm={6}
              className="mb-4"
              onClick={() => navigate(redirection ? redirections[redirection] : "/")}
            >
              <div className="folder-icon">
                <div className="folder-image d-flex justify-content-center">
                  <img src={dossier_icon} alt="Folder" style={{ width: "100px" }} />
                </div>
                <div className="folder-label mt-2">
                  <h4
                    style={{
                      color: "#16a34a",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      textAlign: "center",
                    }}
                  >
                    {typeCommande.designation}
                  </h4>
                </div>
              </div>
            </Col>
          );
        })}
        </Row>
      )}
      <style>{`
        .folder-icon {
          cursor: pointer;
          padding: 15px 10px;
          border-radius: 10px;
          transition: all 0.3s ease;
          background-color: #f9fafb;
          border: 1px solid #56c224;
          height: 100%;
          display: block;
        }

        .folder-icon:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
          background-color: #f0fdf4;
          border-color: #16a34a;
        }

        .folder-image {
          transition: transform 0.3s ease;
        }

        .folder-icon:hover .folder-image {
          transform: scale(1.05);
        }

        .folder-label {
          text-align: center;
        }

        .folder-label strong {
          font-size: 1rem;
          display: block;
        }

        .badge {
          font-size: 0.75rem;
          padding: 3px 8px;
          border-radius: 12px;
        }
      `}</style>
    </Container>
  );
};

export default ListeCommandesSimulees;