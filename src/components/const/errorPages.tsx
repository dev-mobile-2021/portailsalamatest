import { useRouteError, Link } from "react-router-dom";

export default function ErrorPage() {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div className="d-flex text-center justify-content-center align-items-center vh-100 bg-light">
            <div className="p-5 bg-white rounded shadow">
                <h1 className="display-1 fw-bold text-primary">404</h1>
                <p className="fs-3 text-secondary">
                    Oops! Page not found.
                </p>
       
                <Link to="/" className="btn btn-button mt-3">
                    Return to Home
                </Link>
            </div>
        </div>
    );
}