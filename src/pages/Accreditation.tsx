
// import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import vague from "../assets/images/wave.png";
import logo from "../assets/images/salaman_logo.png";
import { useState } from "react";

// Schéma de validation complet
const accreditationSchema = yup.object({
    nom: yup.string().required("Le nom est requis"),
    prenom: yup.string().required("Le prénom est requis"),
    email: yup.string().email("Email invalide").required("L'email est requis"),
    organisation: yup.string().required("L'organisation est requise"),
    telephone: yup.string().required("Le téléphone est requis"),
});

type AccreditationFormData = yup.InferType<typeof accreditationSchema>;


// Titres des étapes
const TabPanelContent = [
    { content: "Informations sur l'Entreprise" },
    { content: "Contacts" },
    { content: "Contact Entreprise" },
    { content: "Option de paiement" },
    { content: "QHSE & CG" },
    { content: "Présentation & Référencement" },
];

const Accreditation = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState<number>(1);

    const {
        // register,
        handleSubmit,
        trigger, // Pour valider les champs manuellement
        formState: {  },
    } = useForm<AccreditationFormData>({
        resolver: yupResolver(accreditationSchema),
        mode: "onChange", // Valider au changement pour une meilleure UX
    });

    const onSubmit: SubmitHandler<AccreditationFormData> = (data) => {
        console.log("Données soumises:", data);
        toast.success("Demande d'accréditation envoyée !");
        navigate("/login");
    };

    // --- Fonctions de navigation ---
    const nextPage = async () => {
        let fieldsToValidate: (keyof AccreditationFormData)[] = [];
        if (currentPage === 1) {
            // fieldsToValidate = ['nom', 'prenom', 'email'];
        }
        
        const isValid = await trigger(fieldsToValidate);
        
        if (isValid) {
            setCurrentPage((prev) => Math.min(prev + 1, TabPanelContent.length));
        }
    };

    const previousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
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
            <div className="container position-relative bg-white p-4 rounded-4 shadow-lg" style={{ zIndex: 1, maxWidth: "1000px" }}>
                {/* Logo et titre */}
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" style={{ height: "60px" }} />
                    <h4 className="fw-bold mt-3" style={{ color: '#00377d' }}>Demande d'accréditation</h4>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-12">
                        <div className="card position-relative shadow-sm rounded-4 border-0" style={{ minHeight: "45em", background: "#f8f9fa" }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="card-header bg-white d-flex justify-content-between align-items-center rounded-top-4 border-bottom">
                                    <span className="me-auto fw-bold fs-5" style={{ color: '#00377d' }}>{TabPanelContent[currentPage - 1].content}</span>
                                    <div className="d-flex">
                                        <ul className="list-unstyled d-flex flex-wrap mb-0">
                                            {TabPanelContent.map((_, idx) => (
                                                <li className="me-2" key={idx}>
                                                    <button
                                                        type="button"
                                                        className={`btn px-3 py-2 rounded-circle ${currentPage === idx + 1 ? "btn-primary text-white" : "btn-outline-dark"}`}
                                                        style={{ fontWeight: 'bold', fontSize: '1.1em' }}
                                                        onClick={() => {
                                                            if (idx < currentPage) {
                                                                setCurrentPage(idx + 1);
                                                            }
                                                        }}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    {currentPage === 1 && (
                                        <div className="row g-4">
                                            <div className="col-md-12 py-2">
                                                <input type="checkbox" id="alreadyWorkedWithFree" />
                                                <label htmlFor="alreadyWorkedWithFree" className="ms-2">Avez-vous déjà travaillé avec FREE?</label>
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="nom" className="form-label">Nom *</label>
                                                <input type="text" id="nom" className="form-control" />
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="ninea" className="form-label">NINEA *</label>
                                                <div className="d-flex border border-dark rounded">
                                                    <input type="text" className="form-control" placeholder="9 caractere" />
                                                    <input type="text" className="form-control" placeholder="3 caractere" />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="importNinea" className="form-label">IMPORT NINEA</label>
                                                <input type="file" className="form-control" id="importNinea" />
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="numbrc" className="form-label">Numéro RC</label>
                                                <input type="number" className="form-control" id="numbrc" />
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="importRC" className="form-label">IMPORT RC</label>
                                                <input type="file" className="form-control" id="importRC" />
                                            </div>
                                            <div className="col-md-12">
                                                <label htmlFor="adresse" className="form-label">Adresse *</label>
                                                <div className="d-md-flex border border-dark rounded">
                                                    <input type="text" placeholder="adresse" className="form-control" />
                                                    <input type="tel" placeholder="numero" className="form-control" />
                                                    <input type="text" placeholder="rue" className="form-control" />
                                                    <input type="text" placeholder="code postal" className="form-control" />
                                                    <input type="text" placeholder="ville" className="form-control" />
                                                    <input type="text" placeholder="pays" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="activite" className="form-label">ACTIVITE</label>
                                                <select className="form-select" id="activite">
                                                    <option value="" disabled selected>Choisir...</option>
                                                    <option value="sf">SERVICES FINANCIERS</option>
                                                    <option value="fi">FINTECH INNOVATION</option>
                                                    <option value="i">IMMOBILIER</option>
                                                    <option value="ser">Solutions pour les énergies renouvelables</option>
                                                    <option value="t">Télécommunications</option>
                                                    <option value="c">Commerce</option>
                                                    <option value="g">GENERAL</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {currentPage === 2 && (
                                        <div className="row g-4">
                                            <strong>CONTACT ENTREPRISE</strong>
                                            <div className="col-md-4">
                                                <label htmlFor="emailEn" className="form-label">E-mail ENTREPRISE *</label>
                                                <input type="email" className="form-control" id="emailEn" />
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="teladd" className="form-label">Tel Mobile *</label>
                                                <input type="tel" className="form-control" id="teladd" />
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="telfix" className="form-label">Tel FIX *</label>
                                                <input type="tel" className="form-control" id="telfix" />
                                            </div>
                                            <strong>PERSONNE(s) A CONTACTER</strong>
                                            <div className="col-md-2">
                                                <label htmlFor="nomP" className="form-label">Nom</label>
                                                <input type="text" className="form-control" id="nomP" />
                                            </div>
                                            <div className="col-md-2">
                                                <label htmlFor="prenomP" className="form-label">Prenom</label>
                                                <input type="text" className="form-control" id="prenomP" />
                                            </div>
                                            <div className="col-md-2">
                                                <label htmlFor="emailP" className="form-label">Email</label>
                                                <input type="email" className="form-control" id="emailP" />
                                            </div>
                                            <div className="col-md-2">
                                                <label htmlFor="numeroP" className="form-label">Numero</label>
                                                <input type="tel" className="form-control" id="numeroP" />
                                            </div>
                                            <div className="col-md-3">
                                                <label htmlFor="posteP" className="form-label">Poste</label>
                                                <select className="form-select" id="posteP">
                                                    <option disabled>Choisir...</option>
                                                    <option value="SERVICES FINANCIERS">SERVICES FINANCIERS</option>
                                                    <option value="Compta">Compta</option>
                                                </select>
                                            </div>
                                            <div className="col-md-1 d-flex align-items-end">
                                                <button className="btn btn-outline-secondary rounded" type="button">
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {currentPage === 3 && (
                                        <div className="row g-4">
                                            <div className="col-md-12">
                                                <label htmlFor="optionPaiement_paiement" className="form-label">Option de paiement *</label>
                                                <select multiple className="form-control" id="optionPaiement_paiement">
                                                    <option value="FB">Free Money</option>
                                                    <option value="B">Cheque</option>
                                                    <option value="V">Virement</option>
                                                    <option value="OM">Orange Money</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="documents" className="form-label">DOCUMENTS</label>
                                                <input type="file" multiple className="form-control" id="documents" />
                                            </div>
                                        </div>
                                    )}
                                    {currentPage === 4 && (
                                        <div className="row g-4">
                                            <div className="col-md-12">
                                                <input type="checkbox" id="politique" />
                                                <label htmlFor="politique" className="ms-2">Avez-vous une politique et un programme QHSE écrits?</label>
                                            </div>
                                            <div className="col-md-12">
                                                <input type="checkbox" id="hasqhse" />
                                                <label htmlFor="hasqhse" className="ms-2">Avez-vous du personnel QHSE à temps plein?</label>
                                            </div>
                                            <div className="col-md-7">
                                                <label htmlFor="nomtitreqhse" className="form-label">Nom et titre</label>
                                                <input type="text" className="form-control" id="nomtitreqhse" />
                                            </div>
                                            <div className="col-md-12">
                                                <input type="checkbox" id="hasformationqhse" />
                                                <label htmlFor="hasformationqhse" className="ms-2">Proposez-vous une formation QHSE à votre personnel?</label>
                                            </div>
                                            <div className="col-md-7">
                                                <label htmlFor="detailsformationqhse" className="form-label">Donnez des détails:</label>
                                                <input type="text" className="form-control" id="detailsformationqhse" />
                                            </div>
                                        </div>
                                    )}
                                    {currentPage === 5 && (
                                        <div className="row g-4">
                                            <div className="col-md-12">
                                                <input type="checkbox" id="factureinfo" />
                                                <label htmlFor="factureinfo" className="ms-2">Je comprends les informations que ma facture devrait contenir et le processus à suivre. *</label>
                                            </div>
                                            <div className="col-md-12">
                                                <input type="checkbox" id="cgcommande" />
                                                <label htmlFor="cgcommande" className="ms-2">Je comprends que tout bon de commande passé doit toujours être régi par les conditions générales standard de SENTEL, sauf convention contraire écrite des parties. *</label>
                                            </div>
                                            <div className="col-md-7">
                                                <input type="checkbox" id="codeconduite" />
                                                <label htmlFor="codeconduite" className="ms-2">J'ai lu, compris et confirmé le code de conduite du fournisseur. *</label>
                                            </div>
                                            <div className="col-md-12">
                                                <label htmlFor="commentaires" className="form-label">Commentaires supplémentaires</label>
                                                <textarea className="form-control w-100" rows={5} id="commentaires"></textarea>
                                            </div>
                                        </div>
                                    )}
                                    {currentPage === 6 && (
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <strong>Importer la Presentation de l’entreprise</strong>
                                                <input type="file" className="form-control" id="presentationEntreprise" />
                                            </div>
                                            <div className="col-md-12">
                                                <strong>Liens vers les réseaux sociaux et site web</strong>
                                                <div className="row my-2">
                                                    <div className="col-md-6">
                                                        <label htmlFor="website" className="form-label"><i className="fas fa-globe my-1"></i> Site Web</label>
                                                        <input type="text" id="website" className="form-control" placeholder="Entrez l'URL de votre site web" />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label htmlFor="linkedin" className="form-label"><i className="fa-brands fa-linkedin"></i> Linkedin</label>
                                                        <input type="text" id="linkedin" className="form-control" placeholder="Entrez l'URL de votre Linkedin" />
                                                    </div>
                                                </div>
                                                <div className="row my-2">
                                                    <div className="col-md-6">
                                                        <label htmlFor="whatsapp" className="form-label"><i className="fas fa-whatshapp" aria-hidden="true"></i> WhatsApp</label>
                                                        <input type="text" id="whatsapp" className="form-control" placeholder="Entrez l'URL WhatsApp" />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label htmlFor="facebook" className="form-label"><i className="fab fa-facebook-f my-1"></i> Facebook</label>
                                                        <input type="text" id="facebook" className="form-control" placeholder="Entrez votre compte Facebook" />
                                                    </div>
                                                </div>
                                                <div className="row my-2">
                                                    <strong className="my-2">REFERENCEMENT :</strong>
                                                    <div className="row my-3">
                                                        <div className="col-md-4">
                                                            <input type="text" id="clientRef" className="form-control" placeholder="Nom " />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <input type="text" className="form-control" placeholder="URL site Client" id="clientRefUrl" />
                                                        </div>
                                                        <div className="col-md-2">
                                                            <select className="form-select" id="typeRef">
                                                                <option value="client">Client</option>
                                                                <option value="partenaire">Partenaire</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <button className="btn btn-outline-secondary rounded" type="button">
                                                                <i className="fas fa-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer position-absolute bottom-0 start-0 w-100 bg-white rounded-bottom-4 border-top d-flex justify-content-between py-3">
                                    {currentPage > 1 && (
                                        <button type="button" className="btn btn-outline-secondary px-4 py-2 fw-bold" onClick={previousPage}>
                                            PRÉCÉDENT
                                        </button>
                                    )}
                                    <div className="flex-grow-1"></div>
                                    {currentPage < TabPanelContent.length && (
                                        <button type="button" className="btn btn-primary px-4 py-2 fw-bold" style={{ backgroundColor: '#00377d' }} onClick={nextPage}>
                                            SUIVANT
                                        </button>
                                    )}
                                    {currentPage === TabPanelContent.length && (
                                        <button type="submit" className="btn btn-success px-4 py-2 fw-bold">
                                            SOUMETTRE
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Accreditation;