import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import back_btn from "../assets/images/back_btn.png";
import folder_img from "../assets/images/folder_img.png";
import form_icon from "../assets/images/form_icon.png";
import doc_icon from "../assets/images/doc_icon.png";
import doc_info_icon from "../assets/images/doc_info_icon.png";
import SmallHeader from "../components/const/SmallHeader";
import PaginationComponent from "../components/PaginationComponent";
import { useAOContext } from "../context/AOContext";
import { useAuthContext } from "../hooks/useUserhook";
import { BASE_URL } from "../utils/variable";

const Tender = () => {
  const { user } = useAuthContext();
  const { id } = useParams<{ id: string }>();
  const { aos, loading, error } = useAOContext();
  const navigate = useNavigate();
   
  // Trouve l'appel d'offre correspondant dans le context
  const tender = aos.find((t) => t.id === id);

  // Vérifie si une soumission existe pour cet utilisateur et cet AO
  const [hasSoumission, setHasSoumission] = useState<boolean>(false);
  const [isachatDirect, setIsAchatDirect] = useState<boolean>(false);
  const [isClotureAtteinte, setIsClotureAtteinte] = useState<boolean>(false);
  useEffect(() => {
    // Vérifie si la date de clôture est atteinte
    if (tender?.datecloture) {
      const dateClotureObj = new Date(tender.datecloture);
      const maintenant = new Date();
      setIsClotureAtteinte(dateClotureObj < maintenant);
    }
    
    if (user?.id && tender?.id) {
       if(tender?.typemarche?.designation === "Achat Direct") {
      setIsAchatDirect(true);
    }
      fetch(`https://backsignup.h-tsoft.com//graphql?query={soumissions(fournisseur_id:${user.fournisseur_id},ao_id:${tender.id}){id}}`)
        .then(res => res.json())
        .then(data => {
          console.log("Données de soumission :", data);
          if (data.data.soumissions && data.data.soumissions.length > 0) {
            //TODO : REMETTRE setHasSoumission(true);
            setHasSoumission(true);
             
            console.log("ID de soumission :", data.data.soumissions[0].id);
          } else {
            setHasSoumission(false);
          }
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des données de soumission :", error);
          navigate('/error');
        });
    }
  }, [user?.id, tender?.id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-danger">Erreur : {error}</div>;
  if (!tender) {
    return (
      <div className="container mt-5 text-danger">
        Appel d'offre introuvable
      </div>
    );
  }

  return (
    <>
      <SmallHeader />

      <div className="mt-1 mx-auto" style={{ width: "90%", margin: "30px" }}>
        <div
          className="bg-white p-4 rounded-3 shadow-sm"
          style={{ border: "1px solid #1FB05B" }}
        >
          <div className="d-flex align-items-center mb-3">
            <img
              src={back_btn}
              alt="retour"
              onClick={() => navigate(-1)}
              style={{ cursor: "pointer", height: "5vh", padding: "0 10px" }}
            />
            <h3 className="mb-0" style={{ color: "#1FB05B" }}>
              {tender.designation}
            </h3>
            <span
              className={`badge ms-3`}
              style={{ backgroundColor: "#1FB05B" }}
            >
              {tender.typemarche?.designation}
            </span>
          </div>

          <div className="bg-theme p-3 rounded-3 mb-3 border">
            <div className="d-flex">
              <img
                src={folder_img}
                alt="dossier"
                style={{ width: "40px", height: "40px", marginRight: "10px" }}
              />
              <div>
                <p className="mb-1 text-light">
                  <strong>Publié le :</strong> {tender.date}
                  <span className="mx-2 text-light">→</span>
                  <strong>Référence :</strong> {tender.reference}
                  <span className="mx-2 text-light">→</span>
                  <strong>Date limite :</strong> {tender.datecloture ? new Date(tender.datecloture).toLocaleDateString('fr-FR') : tender.datepublication}
                  {isClotureAtteinte && <span className="badge bg-danger ms-2">Clôturé</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Affiche le bouton ou le lien selon l'existence d'une soumission */}
      <div className="mt-1 mx-auto" style={{ width: "90%", margin: "30px" }}>
        {/* Message d'avertissement si la date de clôture est atteinte */}
        {isClotureAtteinte && !hasSoumission && (
          <div className="alert alert-danger mb-3" role="alert">
            <strong>Date de clôture atteinte.</strong> Il n'est plus possible de soumettre une candidature pour cet appel d'offres.
            {tender.datecloture && (
              <div className="mt-2">
                <small>
                  Date de clôture : {new Date(tender.datecloture).toLocaleDateString('fr-FR', {
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}
                </small>
              </div>
            )}
          </div>
        )}

        {isachatDirect && !isClotureAtteinte ?  (
          <div className="d-flex flex-column gap-3">
            <Link
              to={`/formulaireAO/${tender.id}`}
              className="btn-white d-block py-3 px-5 text-center mx-auto"
              style={{
                fontSize: "1.1rem",
                borderRadius: "12px",
                boxShadow: "0 0 5px #1FB05B",
                border: "1px solid #1FB05B",
                color: "#1FB05B",
                textDecoration: "none",
                width: "100%",
                
              }}
            >
              <img
                src={form_icon}
                alt="formulaire"
                style={{ cursor: "pointer", height: "5vh", padding: "0 10px" }}
              />
              Examiner
            </Link>
          </div>
        ) : (
          hasSoumission ? (
            <Link
              to={`/tableauSuivi/${tender.id}`}
              className="btn-white d-block py-3 px-5 text-center mx-auto"
              style={{
                fontSize: "1.1rem",
                borderRadius: "12px",
                boxShadow: "0 0 5px #1FB05B",
                border: "1px solid #1FB05B",
                color: "#1FB05B",
                textDecoration: "none",
                width: "100%",
                
              }}
            >
              <img
                src={form_icon}
                alt="formulaire"
                style={{ cursor: "pointer", height: "5vh", padding: "0 10px" }}
              />
              Voir la soumission
            </Link>
          ) : (
            isClotureAtteinte ? (
              <button
                disabled
                className="btn btn-secondary d-block py-3 px-5 text-center mx-auto"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: "14px",
                  opacity: 0.8,
                  cursor: "not-allowed",
                  width: "100%",
                  backgroundColor: "lightgray",
                  borderColor: "silver",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <img
                  src={form_icon}
                  alt="formulaire"
                  style={{ height: "5vh", padding: "0 10px", opacity: 0.9 }}
                />
                <span>
                  <i className="fas fa-clock me-2"></i> Candidature clôturée
                </span>
              </button>
            ) : (
              <Link
                to={`/formulaireAO/${tender.id}`}
                className="btn-white d-block py-3 px-5 text-center mx-auto"
                style={{
                  fontSize: "1.1rem",
                  borderRadius: "12px",
                  boxShadow: "0 0 5px #1FB05B",
                  border: "1px solid #1FB05B",
                  color: "#1FB05B",
                  textDecoration: "none",
                  width: "100%",
                  
                }}
              >
                <img
                  src={form_icon}
                  alt="formulaire"
                  style={{ cursor: "pointer", height: "5vh", padding: "0 10px" }}
                />
                Remplir le formulaire pour postuler
              </Link>
            )
          )
        )}
      </div>

      {/* Documents à consulter */}
      {tender.attachments?.length > 0 && (
        <div
          className="bg-white mx-auto p-3 rounded-3 mt-4"
          style={{ width: "90%", border: "1px solid #1FB05B" }}
        >
          <h5
            className="mb-3 d-flex align-items-center"
            style={{ color: "#1FB05B", paddingLeft: "15px" }}
          >
            <img
              src={doc_info_icon}
              alt="info"
              style={{ width: "40px", marginRight: "10px" }}
            />
            Documents à consulter
          </h5>
          <div className="d-flex flex-wrap">
            {tender.attachments
              .filter(doc => doc.isannexe === 0)
              .map((doc, index) => (
                <div
                  key={index}
                  className="d-flex flex-column align-items-center p-3 rounded-3"
                  style={{
                  width: "150px",
                  cursor: "pointer",
                  transition: "0.3s",
                  }}
                  onClick={() => window.open(`${BASE_URL}${doc.url}`, "_blank")}
                >
                  <img
                  src={doc_icon}
                  alt="document"
                  style={{
                    cursor: "pointer",
                    height: "10vh",
                    padding: "0 10px",
                  }}
                  />
                  <span
                  className="text-dark text-decoration-none text-center"
                  style={{ fontSize: "0.7rem" }}
                  > 
                  {doc.designation} <br />
                  </span>
                </div>
              ))}
          </div>
          <div className="d-flex justify-content-between">
            <PaginationComponent
              currentPage={1}
              totalPages={1}
              onPageChange={(page) => console.log(`Page changed to: ${page}`)}
              perPage={10}
              onPerPageChange={(perPage) => console.log(`Per page changed to: ${perPage}`)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Tender;