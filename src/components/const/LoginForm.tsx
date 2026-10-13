import { Form, FormGroup, FormControl, InputGroup, Button } from 'react-bootstrap';
import { FaGoogle } from 'react-icons/fa';
import cadenar from "../../assets/images/sedima/locker_imag_2.jpg";
import loger from "../../assets/images/sedima/user-login-icon.png";
import { useState } from 'react';



const LoginForm = ({
    signInWithGoogle,
}: {
    signInWithGoogle: () => Promise<void>,
    signInWithFacebook: () => Promise<void>
}) => {
    // const { useCreateItem } = useCrud<{ utilisateur: User, token: string }>('/api/sociallogin', 'users');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');



    return (
        <>
            <Form className="rounded-5 p-4" style={{ width: "350px" }} onSubmit={(e) => e.preventDefault()}>
                {/* Email */}
                <FormGroup className="mb-1" controlId="login_connexion">
                    <InputGroup>
                        <InputGroup.Text className="bg-theme d-flex align-items-center p-2" style={{ height: "40px", width: "40px" }}>
                            <img src={loger} alt="email-icon" style={{ width: "20px", height: "20px" }} />
                        </InputGroup.Text>
                        <FormControl
                            type="email"
                            placeholder="Adresse email"
                            className="py-2"
                            style={{ height: "40px" }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </InputGroup>
                </FormGroup>

                {/* Mot de passe */}
                <FormGroup className="mb-1" controlId="password_connexion">
                    <InputGroup>
                        <InputGroup.Text className="bg-theme d-flex align-items-center p-2" style={{ height: "40px", width: "40px" }}>
                            <img src={cadenar} alt="password-icon" style={{ width: "20px", height: "20px" }} />
                        </InputGroup.Text>
                        <FormControl
                            type="password"
                            placeholder="Mot de passe"
                            className="py-2"
                            style={{ height: "40px" }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </InputGroup>
                </FormGroup>

                {/* Bouton Se connecter */}
                <div className="my-3">
                    <Button type="submit" variant="warning" className="w-100 text-dark fw-bold">
                        Se connecter
                    </Button>
                </div>

                {/* Boutons sociaux (inchangés) */}
                {/* <div className="my-3">
                    <Button className="w-100 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "white", borderColor: "#1877F2", color: "#1877F2" }}
                        onClick={signInWithFacebook}>
                        <FaFacebook size={20} className="me-2" /> Se connecter avec Facebook
                    </Button>
                </div> */}

                <div>
                    <Button className="w-100 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "white", borderColor: "#C71610", color: "#C71610" }}
                        onClick={signInWithGoogle}>
                        <FaGoogle size={20} className="me-2" /> Se connecter avec Google
                    </Button>
                </div>
            </Form>
        </>
    );
}

export default LoginForm;