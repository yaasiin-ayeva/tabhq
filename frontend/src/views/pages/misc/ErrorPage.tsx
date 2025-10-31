import { Link } from 'react-router-dom'
import { MiscWrapper } from './MiscWrapper'
export const ErrorPage = () => {
    return (
        <MiscWrapper>
            <h2 className="mb-2 mx-2">Page Non Trouvée</h2>
            <p className="mb-4 mx-2">Oops! 😖 La page demandée n'a pas été trouvé.</p>
            <Link aria-label='Go to Home Page' to="/" className="btn btn-primary">Retour à l'accueil</Link>
            <div className="mt-3">
                <img
                    src="../assets/img/illustrations/page-misc-error-light.png"
                    alt="page-misc-error-light"
                    aria-label="page misc error light"
                    width="500"
                    className="img-fluid"
                    data-app-dark-img="illustrations/page-misc-error-dark.png"
                    data-app-light-img="illustrations/page-misc-error-light.png" />
            </div>
        </MiscWrapper>

    )
}
