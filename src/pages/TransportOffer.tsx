import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import back_btn from "../assets/images/back_btn.png";
import folder_img from "../assets/images/folder_img.png";
import form_icon from "../assets/images/form_icon.png";
import doc_icon from "../assets/images/doc_icon.png";
import doc_info_icon from "../assets/images/doc_info_icon.png";
import SmallHeader from "../components/const/SmallHeader";
import { useAuthContext } from "../hooks/useUserhook";
import { useOffreTransport } from "../hooks/useOffresTransport";
import { FaTruck, FaRoute, FaCalendarAlt, FaClock, FaWeightHanging } from "react-icons/fa";
import PaginationComponent from "../components/PaginationComponent";
import { BASE_URL } from "../utils/variable";

const TransportOffer = () => {
  const { user } = useAuthContext();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Récupérer l'offre de transport par ID
  const { offreTransport: offre, loading, error } = useOffreTransport(Number(id));

  // Vérifie si une soumission existe pour cet utilisateur et cette offre
  const [hasSoumission, setHasSoumission] = useState<boolean>(false);
  const [isClotureAtteinte, setIsClotureAtteinte] = useState<boolean>(false);

  useEffect(() => {
    // Vérifie si la date limite est atteinte
    if (offre?.datelimite) {
      const dateLimiteObj = new Date(offre.datelimite);
      const maintenant = new Date();
      setIsClotureAtteinte(dateLimiteObj < maintenant);
    }
    
    // Vérifier si une soumission existe pour cette offre de transport
    if (user?.fournisseur_id && id) {
      fetch(
        `https://backsignup.h-tsoft.com//graphql?query={soumissiontrans(offretransport_id:"${id}",fournisseur_id:"${user.fournisseur_id}"){id,fournisseur{id}}}`
      )
        .then(res => res.json())
        .then(data => {
          const soumissions = data?.data?.soumissiontrans;
          if (soumissions && soumissions.length > 0) {
            // Vérifier que le fournisseur_id de la soumission correspond à celui de l'utilisateur
            const soumissionValide = soumissions.some(
              (s: { fournisseur?: { id?: string | number } }) => 
                String(s.fournisseur?.id) === String(user?.fournisseur_id)
            );
            setHasSoumission(soumissionValide);
          } else {
            setHasSoumission(false);
          }
        })
        .catch(err => {
          console.error("Erreur lors de la vérification de soumission:", err);
          setHasSoumission(false);
        });
    }
  }, [user?.fournisseur_id, id, offre?.datelimite]);

  // Formatage des dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Calcul du nombre total de tonnages
  const totalTonnages = offre?.detailoffretransports?.reduce(
    (acc, detail) => acc + (detail.detailoffretransporttonnages?.length || 0),
    0
  ) || 0;

  if (loading) {
    return (
      <>
        <SmallHeader />
        <div className="container mt-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement de l'offre de transport...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SmallHeader />
        <div className="container mt-5 text-danger">Erreur : {error}</div>
      </>
    );
  }

  if (!offre) {
    return (
      <>
        <SmallHeader />
        <div className="container mt-5 text-danger">
          Offre de transport introuvable
        </div>
      </>
    );
  }

  return (
    <>
      <SmallHeader />

      {/* En-tête de l'offre */}
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
              {offre.designation}
            </h3>
            <span
              className="badge ms-3 d-flex align-items-center gap-1"
              style={{ backgroundColor: "#1FB05B" }}
            >
              <FaTruck size={14} /> Transport
            </span>
          </div>

          {/* Informations principales */}
          <div className="bg-theme p-3 rounded-3 mb-3 border">
            <div className="d-flex align-items-center">
              <img
                src={folder_img}
                alt="dossier"
                style={{ width: "40px", height: "40px", marginRight: "10px" }}
              />
              <div>
                <p className="mb-1 text-light">
                  <strong>Référence :</strong> {offre.reference}
                  <span className="mx-2 text-light">→</span>
                  <strong>Année :</strong> {offre.annee}
                  <span className="mx-2 text-light">→</span>
                  <strong>Date limite :</strong> {formatDate(offre.datelimite)}
                  {isClotureAtteinte && <span className="badge bg-danger ms-2">Clôturé</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Stats de l'offre */}
          <div className="row g-3 mt-2">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-3">
                <FaRoute size={24} className="text-success" />
                <div>
                  <small className="text-muted">Axes de transport</small>
                  <h5 className="mb-0">{offre.detailoffretransports?.length || 0}</h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-3">
                <FaWeightHanging size={24} className="text-success" />
                <div>
                  <small className="text-muted">Tonnages disponibles</small>
                  <h5 className="mb-0">{totalTonnages}</h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-3">
                <FaCalendarAlt size={24} className="text-success" />
                <div>
                  <small className="text-muted">Date d'ouverture</small>
                  <h5 className="mb-0" style={{ fontSize: "0.9rem" }}>{formatDate(offre.dateouverture)}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton d'action */}
      <div className="mt-1 mx-auto" style={{ width: "90%", margin: "30px" }}>
        {/* Message d'avertissement si la date limite est atteinte */}
        {isClotureAtteinte && !hasSoumission && (
          <div className="alert alert-danger mb-3" role="alert">
            <strong>Date limite atteinte.</strong> Il n'est plus possible de soumettre une candidature pour cette offre de transport.
            {offre.datelimite && (
              <div className="mt-2">
                <small>
                  Date limite : {formatDate(offre.datelimite)}
                </small>
              </div>
            )}
          </div>
        )}

        {hasSoumission ? (
          <Link
            to={`/tableauSuiviTransport/${offre.id}`}
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
        ) : isClotureAtteinte ? (
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
              <FaClock className="me-2" /> Candidature clôturée
            </span>
          </button>
        ) : (
          <Link
            to={`/formulaireTransport/${offre.id}`}
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
        )}
      </div>


      {/* Documents à consulter (si applicable) */}
      
      {/* Documents à consulter */}
      {(offre.attachments?.length ?? 0) > 0 && (
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
            {(offre.attachments ?? [])
              .filter((doc: any) => doc.isannexe === 0)
              .map((doc: any, index: number) => (
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

export default TransportOffer;
