import { Form, FormGroup, FormLabel, FormControl, InputGroup, Button } from 'react-bootstrap';
import { FaFacebook } from 'react-icons/fa';
import cadenar from "../assets/images/sedima/locker_imag_2.jpg";
import loger from "../assets/images/sedima/user-login-icon.png";

const UnauthenticateForm = () => {

    return (
        <Form className="rounded-3 p-3  border-0" style={{ width: "350px", margin: "0 auto" }}>
            <FormGroup className="mb-1" controlId="login_connexion">
                <FormLabel className="fw-bold">Adresse email</FormLabel>
                <InputGroup>
                    <InputGroup.Text className="bg-warning d-flex align-items-center p-2" style={{ height: "50px", width: "45px" }}>
                        <img src={loger} alt="email-icon" style={{ width: "20px", height: "20px" }} />
                    </InputGroup.Text>
                    <FormControl type="email" placeholder="Adresse email" className="py-2" style={{ height: "50px" }} />
                </InputGroup>
            </FormGroup>
            <FormGroup className="mb-1" controlId="password_connexion">
                <FormLabel className="fw-bold">Mot de passe</FormLabel>
                <InputGroup>
                    <InputGroup.Text className="bg-warning d-flex align-items-center p-2" style={{ height: "50px", width: "45px" }}>
                        <img src={cadenar} alt="password-icon" style={{ width: "20px", height: "20px" }} />
                    </InputGroup.Text>
                    <FormControl type="password" placeholder="Mot de passe" className="py-2" style={{ height: "50px" }} />
                </InputGroup>
            </FormGroup>
            <p className="text-muted text-end">Mot de passe oublié ?</p>
            <div className="my-3">
                <Button type="submit" variant="warning" className="w-100 text-dark fw-bold">Se connecter</Button>
            </div>
            <div className="my-3">
                <Button id="facebook-login-info" variant="primary" className="w-100 d-flex align-items-center justify-content-center">
                    <FaFacebook size={20} className="me-2" /> Se connecter avec Facebook
                </Button>
            </div>
            <div>
                {/* <Button
                    id="info-buttonDiv"
                    variant="outline-primary"
                    className="w-100"
                    onClick={signInWithGoogle} // Connexion avec Google
                >
                    Se connecter avec Google
                </Button> */}
            </div>
        </Form>
    );
};

export default UnauthenticateForm;
