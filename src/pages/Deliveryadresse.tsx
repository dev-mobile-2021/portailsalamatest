import { Form, Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { User } from "../types/user.types";
import { useForm } from "react-hook-form";
import { useCrud } from "../hooks/useCrud";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const DeliveryAdresse = () => {
    const { user } = useOutletContext<{ user: User }>();
    const { useCreateItem } = useCrud<User>("/api/updateinfouser", "user");
    const { mutate: updateUserInfo } = useCreateItem();
    const [loading, setLoading] = useState(false);



    const { register, handleSubmit, setValue } = useForm<User>();

    const onSubmit = (data: any) => {
        setLoading(true);
        updateUserInfo(data, {
            onSuccess() {
                toast.success("Informations mises à jour avec succès !");
                setLoading(false);
            },
            onError() {
                toast.error("Erreur lors de la mise à jour. Veuillez réessayer.");
                setLoading(false);
            }
        });
    };

    useEffect(() => {
        if (user) {
            setValue("id", user.id);
            setValue("ville", user?.ville || "");
            setValue("numbrue", user?.numbrue || "");
            setValue("societe", user?.societe || "");
            setValue("adresse", user.adresse || "");
            setValue("complement_adresse", user.complement_adresse || "");
        }
    }, [user, setValue]);


    return (
        <Container>
            <button
                onClick={() => window.history.back()}
                className="mb-5 py-2 d-flex btn-wishlist align-items-center gap-2"
            >
                <FaArrowLeft />
            </button>
            <div className="d-flex justify-content-center align-items-center">
                <Card className="p-4 m-0 shadow-sm w-100">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Rue*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...register("numbrue", { required: "La rue est requise" })}
                                        placeholder="Ex: 12 rue Lafayette"
                                    />
                                    {/* {errors.numbrue && <p className="text-danger">{errors.numbrue.message}</p>} */}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Ville*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...register("ville", { required: "La ville est requise" })}
                                        placeholder="Ex: Paris"
                                    />
                                    {/* {errors.ville && <p className="text-danger">{errors.ville.message}</p>} */}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Société</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...register("societe")}
                                        placeholder="Nom de l'entreprise"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Adresse*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...register("adresse", { required: "L'adresse est requise" })}
                                        placeholder="Adresse complète"
                                    />
                                    {/* {errors.adresse && <p className="text-danger">{errors.adresse.message}</p>} */}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label>Complément d'adresse</Form.Label>
                            <Form.Control
                                type="text"
                                {...register("complement_adresse")}
                                placeholder="Appartement, bâtiment, etc."
                            />
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

export default DeliveryAdresse;
