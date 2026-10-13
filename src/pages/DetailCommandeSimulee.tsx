import { useParams, useNavigate } from "react-router-dom";
import { Container, Badge, Button } from "react-bootstrap";
import dossier_icon from "../assets/images/dossier.png";
import { commandes } from "./ListeCommandesClient";

const badgeColors: { [key: string]: string } = {
  Rc_IMP: 'info',
  Rp_IMP: 'secondary',
  Rp_sans_IMP: 'warning',
  TEF: 'danger',
};
const collisageDetails = {
  nombreCartons: 12,
  poidsTotalKg: 34.5,
  volumeM3: 0.75,
};

const livraisonDetails = {
  delai: "7 jours ouvrables",
  mode: "Express",
  dateExpedition: new Date().toLocaleDateString("fr-FR"),
};


const DetailCommandeSimulee = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const commande = commandes.find(cmd => cmd.id === Number(id));

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR");
    };

    if (!commande) {
        return (
            <Container className="py-5 text-center">
                <h3>Commande introuvable</h3>
                <Button variant="secondary" onClick={() => navigate(-1)}>Retour</Button>
            </Container>
        );
    }

    return (
        <>

        <Container className="py-4">
            
      <div className="bg-white p-4 rounded-3 shadow-sm border">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Détail de la commande #{commande.id}</h4>
                <Button variant="outline-primary" onClick={() => navigate(-1)}>
                    Retour
                </Button>
            </div>
            <hr />
            <div className="my-4">
                <a
                    href="/files/facture.docx"
                    download
                    className="text-decoration-underline text-primary"
                >
                    📄 Télécharger la facture proforma
                </a>
            </div>


            <div className="d-flex gap-4 align-items-center mb-4">
                <img src={dossier_icon} alt="Commande" style={{ width: '120px' }} />
                <div>
                    <p><b>Date :</b> {formatDate(commande.date)}</p>
                    <p>
                        <b>Type :</b>{' '}
                        <Badge bg={badgeColors[commande.type] || 'dark'} style={{padding: '0.2rem', margin:"0.4rem"}}>
                            {commande.type}
                        </Badge>
                    </p>
                    <p><b>Nombre d’articles :</b> {commande.articles.length}</p>
                </div>
            </div>
              <div className="d-flex align-items-center justify-content-between mb-3">


          <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ width: "45%" }}>
            <h5>Collisage</h5>
            <div>
                <p><strong>Nombre de cartons :</strong> {collisageDetails.nombreCartons}</p>
                <p><strong>Poids total :</strong> {collisageDetails.poidsTotalKg} kg</p>
                <p><strong>Volume :</strong> {collisageDetails.volumeM3} m³</p>
            </div>
            </div>

            <div className="bg-white p-4  rounded-4 shadow-sm border" style={{ width: "50%" }}>
            <h5 className="mb-3">Détails de la livraison</h5>
            <div>
                <p><strong>Délai :</strong> {livraisonDetails.delai}</p>
                <p><strong>Mode de livraison :</strong> {livraisonDetails.mode}</p>
                <p><strong>Date d'expédition :</strong> {livraisonDetails.dateExpedition}</p>
            </div>
         </div>


        </div>
            <h5>Articles commandés</h5>
            <ul className="list-group">
                {commande.articles.map((article, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            {article.designation} — <b>Quantité :</b> {article.quantite}
                        </div>
                        {'codePromo' in article && article.codePromo && (
                            <Badge bg="success">Code Promo : {article.codePromo}</Badge>
                        )}
                    </li>
                ))}
            </ul>
            </div>
        </Container>

        </>
    );
};

export default DetailCommandeSimulee;
