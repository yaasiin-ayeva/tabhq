import React, { ReactNode } from 'react';
import './page-misc.css';

interface MiscWrapperProps {
    children: ReactNode;
}

export const MiscWrapper: React.FC<MiscWrapperProps> = ({ children }) => {
    return (
        <div className="container-xxl">
            <div className="misc-wrapper misc-basic container-p-y">
                <div className="misc-inner">
                    {children}
                </div>
            </div>
        </div>
    );
};
