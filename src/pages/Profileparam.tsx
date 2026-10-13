import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { User } from "../types/user.types";
import Select from "react-select";
import { useCrud } from "../hooks/useCrud";
import { toast } from "react-toastify";
import { civiliteOptions, paysOptions } from "../utils/variable";

const ProfileParam = () => {
    const { user } = useOutletContext<{ user: User }>();
    const { useCreateItem } = useCrud<User>("/api/updateinfouser", "user");
    const { mutate: updateUserInfo } = useCreateItem();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<User>();



    // Mettre à jour les valeurs du formulaire lorsque l'utilisateur est chargé
    useEffect(() => {
        if (user) {
            setValue("id", user?.id ?? 0);
            setValue("civilite", user?.civilite);
            setValue("nom", user?.nom || "");
            setValue("prenom", user?.prenom || "");
            setValue("telephone1", user?.telephone1 || "");
            setValue("pays", user?.pays || "");
            setValue("email", user?.email || "");
        }
    }, [user, setValue]);



    const onSubmit = async (data: any) => {
        setLoading(true);
        updateUserInfo(data, {
            onSuccess() {
                toast.success("Informations mises à jour avec succès !");
                setLoading(false);
            },
            onError() {
                toast.error("Erreur lors de la mise à jour. Veuillez réessayer.");
                setLoading(false);
            },
        });
    };


    if (!user) {
        return <div>Chargement...</div>;
    }

    return (
        <Container className="m-0 p-0">
            <button
                onClick={() => window.history.back()}
                className="mb-5 py-2 d-flex btn-wishlist align-items-center gap-2"
            >
                <FaArrowLeft />
            </button>
            <div className="d-flex justify-content-center align-items-center">
                <Card className="p-4 shadow-sm w-100">
                    {/* <Title>Informations personnelles</Title> */}
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        {/* Civilité */}
                        <Form.Group className="mb-3">
                            <Form.Label>Civilité</Form.Label>
                            <Select
                                options={civiliteOptions}
                                value={civiliteOptions.find(c => String(c.value) === watch("civilite"))}
                                onChange={(selected) => setValue("civilite", String(selected?.value) ?? 0)}
                            />
                            {/* {errors.civilite && <p className="text-danger">{errors.civilite.message}</p>} */}
                        </Form.Group>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Nom</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...register("nom", { required: "Le nom est obligatoire" })}
                                        placeholder="Votre nom"
                                    />
                                    {/* {errors.nom && <p className="text-danger">{errors.nom.message}</p>} */}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Prénom</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...register("prenom", { required: "Le prénom est obligatoire" })}
                                        placeholder="Votre prénom"
                                    />
                                    {/* {errors.prenom && <p className="text-danger">{errors.prenom.message}</p>} */}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Téléphone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...register("telephone1", { required: "Le téléphone est obligatoire" })}
                                        placeholder="Numéro de téléphone"
                                    />
                                    {/* {errors.telephone1 && <p className="text-danger">{errors.telephone1.message}</p>} */}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Pays</Form.Label>
                                    <Select
                                        options={paysOptions}
                                        value={paysOptions.find(p => p.value === watch("pays")) || null}
                                        onChange={(selected) => setValue("pays", selected?.value || "")}
                                    />
                                    {/* {errors.pays && <p className="text-danger">{errors.pays.message}</p>} */}
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Email */}
                        <Form.Group className="mb-3">
                            <Form.Label>E-mail</Form.Label>
                            <Form.Control
                                type="email"
                                {...register("email", {
                                    required: "L'e-mail est obligatoire",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Adresse e-mail invalide",
                                    },
                                })}
                                placeholder="Votre adresse e-mail"
                            />
                            {errors.email && <p className="text-danger">{errors.email.message}</p>}
                        </Form.Group>


                        <button type="submit" className="py-2 btn-button" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Enregistrer"}
                        </button>
                    </Form>
                </Card>
            </div>
        </Container>
    );
};

export default ProfileParam;