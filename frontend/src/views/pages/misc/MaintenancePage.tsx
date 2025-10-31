import { Link } from 'react-router-dom'
import { MiscWrapper } from './MiscWrapper'

export const MaintenancePage = () => {
    return (
        <MiscWrapper>
            <h2 className="mb-2 mx-2">En cours de maintenance!</h2>
            <p className="mb-4 mx-2">Désolé pour les inconvenients occasionnés par la maintenance en cours</p>
            <Link aria-label='Go to Home Page' to="/" className="btn btn-primary">Retour à l'accueil</Link>
            <div className="mt-4">
                <img
                    src="../assets/img/illustrations/girl-doing-yoga-light.png"
                    alt="girl-doing-yoga-light"
                    aria-label="Girl doing yoga light"
                    width="500"
                    className="img-fluid"
                    data-app-dark-img="illustrations/girl-doing-yoga-dark.png"
                    data-app-light-img="illustrations/girl-doing-yoga-light.png" />
            </div>
        </MiscWrapper>
    )
}
