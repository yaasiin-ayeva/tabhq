import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface BlankProps {
    children?: ReactNode;
}

export const Blank: React.FC<BlankProps> = ({ children }) => {
    return (
        <>
            <Link aria-label="Go to Home Page" to="/">
                {children}
            </Link>
        </>
    );
};
