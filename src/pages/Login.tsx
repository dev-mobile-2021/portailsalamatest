import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import vague from "../assets/images/wave.png";
import logo from "../assets/images/salaman_logo.png";
import user from "../assets/images/user.png";
import password from "../assets/images/password.png";
import { useAuthContext } from "../hooks/useUserhook";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Schéma de validation avec Yup
const loginSchema = yup.object({
    login: yup
        .string()
        .required("L'identifiant est requis"),
    password: yup
        .string()
        .min(2, "Le mot de passe doit contenir au moins 2 caractères")
        .required("Le mot de passe est requis"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

const Login = () => {
    const { login, isLoading } = useAuthContext();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
            toast.success("Connexion réussie !");
            navigate("/");
        } catch (error) {
            toast.error("Échec de la connexion. Vérifiez vos identifiants.");
        }
    };

    return (
        <div className="position-relative bg-light min-vh-100 d-flex align-items-center justify-content-center">
            {/* Wave en fond */}
            <img
                src={vague}
                alt="Vague décorative"
                className="position-absolute bottom-0 start-0 w-100"
                style={{ zIndex: 0, blockSize: "70%" }}
            />

            <div
                className="container position-relative bg-white p-4 rounded-4 shadow"
                style={{ zIndex: 1, maxWidth: "400px" }}
            >
                {/* Logo */}
                <div className="text-center mb-5">
                    <img src={logo} alt="Logo" style={{ height: "60px" }} />
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group mb-3">
                        <span className="input-group-text bg-white border-end-0">
                            <img src={user} alt="user-icon" style={{ height: "20px" }} />
                        </span>
                        <input
                            type="text" // Changer de email à text
                            className={`form-control py-3 border-start-0 ${errors.login ? "is-invalid" : ""}`}
                            placeholder="Identifiant"
                            {...register("login")}
                        />
                        {errors.login && (
                            <div className="invalid-feedback">{errors.login.message}</div>
                        )}
                    </div>

                    {/* Mot de passe */}
                    <div className="input-group mb-4">
                        <span className="input-group-text bg-white border-end-0">
                            <img src={password} alt="password-icon" style={{ height: "20px" }} />
                        </span>
                        <input
                            type="password"
                            className={`form-control py-3 border-start-0 ${errors.password ? "is-invalid" : ""
                                }`}
                            placeholder="Mot de passe"
                            {...register("password")}
                        />
                        {errors.password && (
                            <div className="invalid-feedback">{errors.password.message}</div>
                        )}
                    </div>

                    {/* Bouton Login */}
                    <button
                        type="submit"
                        className="btn bg-gradiant-btn py-2 btn-success w-100 mb-4 fw-bold"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                            ></span>
                        ) : (
                            "Se connecter"
                        )}
                    </button>

                    {/* Lien mot de passe oublié */}
                    <div className="text-center mb-4">
                        <a href="#" className="text-decoration-none text-muted small">
                            Mot de passe oublié ?
                        </a>
                    </div>

                    {/* Créer un compte / Accréditation */}
                    <div className="d-flex ">
                        {/* <button
                            type="button"
                            className="btn bg-theme text-white w-50 fw-bold"
                            onClick={() => navigate("/register")}
                        >
                            Créer un compte
                        </button> */}
                        <button
                            type="button"
                            className="btn bg-theme-claire text-white w-100 fw-bold"
                            onClick={() => navigate("/accreditation")}>
                            Demande d'accréditation ?
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;