import { useParams, useNavigate } from "react-router-dom";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { getCampagneQuery } from "../api/graphql/queries";
import type { Campagne } from "../types/Campagne.types";
import { BASE_URL } from "../utils/variable";
import { useAuthContext } from "../hooks/useUserhook";
import campagneIcon from "../assets/images/campagne.png";
import detailIcon from "../assets/images/details.png";
import { FaList, FaCalendarAlt, FaShoppingCart } from "react-icons/fa";
import { BiDetail } from "react-icons/bi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import Spiner from "../components/const/Spiner";
import back_icon from "../assets/images/back.png";
const Campagne = () => {
    const { user } = useAuthContext();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: campagne, isLoading, isError } = useCrudGraph<Campagne>("campagnes").useFetchAll(
        getCampagneQuery(Number(id)),
        {},
        { enabled: !!id }
    );

    if (isLoading) return <Spiner />;

    if (isError || !campagne?.length) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-50">
                <div className="text-center" style={{ maxWidth: '400px' }}>
                    <i className="bi bi-exclamation-triangle-fill fs-1 text-danger mb-3"></i>
                    <h4 className="mb-2">Campagne introuvable</h4>
                    <p className="text-muted mb-4">La campagne que vous recherchez n'existe pas ou a été supprimée</p>
                    <button
                        className="btn btn-outline-primary px-4 py-2"
                        onClick={() => navigate("/")}
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    const campagneData = campagne[0];

    const handleCommander = () => {
        if (!user) {
            navigate("/login", { state: { from: `/campagne/${id}` } });
            return;
        }
        navigate(`/commande/formulaire/${campagneData.id}`, {
            state: { campagne: campagneData }
        });
    };

    return (
        <div className="container-fluid px-lg-4 py-3" style={{ maxWidth: '1400px' }}>
            <button className="btn bg-theme my-2 rounded-2 border-none px-2 py-2">
                <img src={back_icon} className="icon-size w-75" alt="" />
            </button>
            {/* Header Section */}
            <div className="mb-4">
                {/* <div className="d-flex align-items-center text-secondary mb-2">
                    <img src={campagneIcon} alt="Campagne" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                    <span>{campagneData.programme?.designation} / {campagneData?.designation}</span>
                </div> */}
                <hr className="my-2 bg-light" />
                <div className="d-flex align-items-center text-white mb-3">
                    <img src={campagneIcon} alt="Campagne" style={{ width: '40px', height: '40px', marginRight: '16px' }} />
                    <div className="bg-theme w-100 rounded-2">
                        <h4 className="m-0 p-2 text-white">{campagneData.designation}</h4>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="row">
                {/* Left Column */}
                <div className="col-lg-8 pe-lg-3">
                    {/* General Info Card */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header bg-gray text-white d-flex align-items-center">
                            <img src={detailIcon} alt="Details" style={{ width: '18px', height: '18px', marginRight: '12px' }} />
                            <h3 className="m-0 fs-5 fw-medium">Informations générales</h3>
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-6 mb-2 mb-md-0">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-medium">Programme :</span>
                                        <span className="text-muted">{campagneData.programme.designation}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-medium">Date de création :</span>
                                        <span className="text-muted">
                                            {new Date(campagneData.date).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-medium">Statut :</span>
                                        <span className={`badge ${campagneData.statut === "ACTIVE" ? "bg-success" : "bg-warning"}`}>
                                            {campagneData.statut}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-medium">Équipe gestion :</span>
                                        <span className="text-muted">
                                            {campagneData.programme?.equipegestion?.designation || "Non spécifiée"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="btn bg-theme text-white w-100 d-flex align-items-center justify-content-center py-2"
                                onClick={handleCommander}
                            >
                                <FaShoppingCart className="me-2" />
                                Passer commande
                            </button>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-gray text-white d-flex align-items-center">
                            <FaList className="me-2" />
                            <h3 className="m-0 fs-5 fw-medium">Liste des produits</h3>
                        </div>
                        <div className="card-body p-0">
                            {campagneData.lignecommandes.length === 0 ? (
                                <div className="text-center py-5">
                                    <IoMdInformationCircleOutline className="fs-1 text-muted opacity-50 mb-3" />
                                    <p className="text-muted">Aucun produit disponible pour cette campagne</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Produit</th>
                                                <th>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {campagneData.lignecommandes.map((ligne) => (
                                                <tr key={ligne.article.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={BASE_URL + ligne.article.image || "/default-article.png"}
                                                                alt={ligne.article.designation}
                                                                className="rounded me-2"
                                                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                                            />
                                                            <span>{ligne.article.designation}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-muted">{ligne.article.description || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-lg-4 mt-4 mt-lg-0">
                    {/* Phases Card */}
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-gray text-white d-flex align-items-center">
                            <FaCalendarAlt className="me-2" />
                            <h3 className="m-0 fs-5 fw-medium">Phases de dépôt</h3>
                        </div>
                        <div className="card-body">
                            {campagneData.phasedepots.length === 0 ? (
                                <div className="text-center py-4">
                                    <BiDetail className="fs-1 text-muted opacity-50 mb-3" />
                                    <p className="text-muted">Aucune phase de dépôt définie</p>
                                </div>
                            ) : (
                                <div className="d-grid gap-3">
                                    {campagneData.phasedepots.map((phase) => (
                                        <div
                                            key={phase.id}
                                            className={`p-3 rounded ${new Date(phase.datefin) > new Date() ? "border-start border-3 border-success bg-success bg-opacity-10" : "border-start border-3 border-secondary bg-light"}`}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h4 className="m-0 fs-6 fw-medium">Phase #{phase.id}</h4>
                                                <span className={`badge ${new Date(phase.datefin) > new Date() ? "bg-success" : "bg-secondary"}`}>
                                                    {new Date(phase.datefin) > new Date() ? "Active" : "Clôturée"}
                                                </span>
                                            </div>
                                            <div className="d-grid gap-1">
                                                <div className="d-flex align-items-center text-muted">
                                                    <FaCalendarAlt className="me-2 fs-6" />
                                                    <small>Début: {new Date(phase.datedeb).toLocaleDateString('fr-FR')}</small>
                                                </div>
                                                <div className="d-flex align-items-center text-muted">
                                                    <FaCalendarAlt className="me-2 fs-6" />
                                                    <small>Fin: {new Date(phase.datefin).toLocaleDateString('fr-FR')}</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Campagne;