import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './page-auth.css';
import { APP_NAME } from '@/utils/app.config';

interface AuthWrapperProps {
    children: ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    return (
        <div className="container-xxl">
            <div className="authentication-wrapper authentication-basic container-p-y">
                <div className="authentication-inner">
                    <div className="card">
                        <div className="card-body">
                            <div className="app-brand justify-content-center">
                                <Link aria-label="Go to Home Page" to="#" className="app-brand-link gap-2">
                                    {/* <span className="app-brand-logo demo">
                                        <img src="/assets/img/meditation-round-svgrepo-com.svg" alt="app-logo" />
                                    </span> */}
                                    <span className="app-brand-text demo text-body fw-bold">
                                        {APP_NAME}
                                    </span>
                                </Link>
                            </div>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
