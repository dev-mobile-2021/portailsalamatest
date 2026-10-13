import { getprivilegeQuery } from "../api/graphql/queries";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { Privilege } from "../types/preference.types";
import { BASE_URL } from "../utils/variable";
import Spiner from "../components/const/Spiner";
import { Alert } from "react-bootstrap";

const Recompense = () => {
    const { data: privileges, isLoading: isPrivilegeLoading, isError: isPrivilegeError } = useCrudGraph<Privilege>("privileges").useFetchAll(getprivilegeQuery);

    if (isPrivilegeLoading) <Spiner />;
    if (isPrivilegeError) <Alert variant="danger">Erreur lors de la récupération des privilèges</Alert>;

    return (
        <div className="container">
            {/* <Title  >
                Privileges
            </Title> */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {privileges?.map((privilege) => (
                    <div key={privilege.id} className="col">
                        <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden position-relative transition-transform" style={{ transition: "transform 0.3s ease" }}>
                            <img src={BASE_URL + privilege.image} alt={privilege.designation} className="card-img-top" style={{ height: "220px", objectFit: "contain" }} />
                            <div className="card-body">
                                <h2 className="card-title fw-bold fs-5 text-dark">{privilege.designation}</h2>
                                <p className="card-text text-muted">
                                    <strong>Points :</strong> <span className="badge bg-theme fs-6">{privilege.point}</span>
                                </p>
                                <div className="mt-3">
                                    {privilege.privilegerecompenses.map((recompense) => (
                                        <span key={recompense.id} className="badge bg-theme-blur me-1 mb-1">
                                            {recompense.designation} <span >  - {recompense.typerecompense.designation}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recompense;
