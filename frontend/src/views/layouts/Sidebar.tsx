import { sidebarData } from '@/data/sidebarData';
import { APP_NAME } from '@/utils/app.config';
import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

interface SubmenuItem {
    text: string;
    link: string;
    available?: boolean;
    icon?: string;
}

interface MenuItemProps {
    text: string;
    link: string;
    available?: boolean;
    icon?: string;
    submenu?: SubmenuItem[];
}

interface Section {
    header?: string;
    items: MenuItemProps[];
}

const Sidebar: React.FC = () => {
    return (
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
            <div className="app-brand demo">
                <Link
                    aria-label="Navigate to app homepage"
                    to="/"
                    className="app-brand-link"
                >
                    {/* <span className="app-brand-logo demo">
                        <img
                            src="/assets/img/meditation-round-svgrepo-com.svg"
                            alt="app-logo"
                            aria-label="App logo image"
                        />
                    </span> */}
                    <span className="app-brand-text demo menu-text fw-bold ms-2">
                        {APP_NAME}
                    </span>
                </Link>

                <a
                    href="#"
                    className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none"
                >
                    <i className="bx bx-chevron-left bx-sm align-middle"></i>
                </a>
            </div>

            <div className="menu-inner-shadow"></div>

            <ul className="menu-inner py-1">
                {(sidebarData as Section[]).map((section) => (
                    <React.Fragment key={section.header || Math.random()}>
                        {section.header && (
                            <li className="menu-header small text-uppercase">
                                <span className="menu-header-text">{section.header}</span>
                            </li>
                        )}
                        {section.items.map((item) => (
                            <MenuItem key={item.text} {...item} />
                        ))}
                    </React.Fragment>
                ))}
            </ul>
        </aside>
    );
};

const MenuItem: React.FC<MenuItemProps> = ({
    text,
    link,
    available = true,
    icon,
    submenu,
}) => {
    const location = useLocation();
    const isActive = location.pathname === link;
    const hasSubmenu = submenu && submenu.length > 0;
    const isSubmenuActive =
        hasSubmenu && submenu.some((subitem) => location.pathname === subitem.link);

    return (
        <li
            className={`menu-item ${isActive || isSubmenuActive ? 'active' : ''} ${hasSubmenu && isSubmenuActive ? 'open' : ''
                }`}
        >
            <NavLink
                aria-label={`Navigate to ${text} ${available ? 'Disponible' : ''}`}
                to={link}
                className={`menu-link ${submenu ? 'menu-toggle' : ''}`}
                target={link.includes('http') ? '_blank' : undefined}
            >
                {icon && <i className={`menu-icon tf-icons ${icon}`}></i>}
                <div>{text}</div>
                {available && (
                    <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
                        Disponible
                    </div>
                )}
            </NavLink>
            {hasSubmenu && (
                <ul className="menu-sub">
                    {submenu.map((subitem) => (
                        <MenuItem key={subitem.text} {...subitem} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default Sidebar;
