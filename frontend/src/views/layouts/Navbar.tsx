import React from 'react';
import { Link } from 'react-router-dom';
import getGreetingMessage, { displayName } from '../../utils/greetingHandler';

const Navbar: React.FC = () => {


  return (
    <nav
      className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
      id="layout-navbar"
    >
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <button
          aria-label="Toggle for sidebar"
          className="nav-item nav-link px-0 me-xl-4"
          type="button"
        >
          <i className="bx bx-menu bx-sm"></i>
        </button>
      </div>

      <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
        <span>{getGreetingMessage()}</span>
        <ul className="navbar-nav flex-row align-items-center ms-auto">
          <li className="nav-item navbar-dropdown dropdown-user dropdown">
            <button
              aria-label="Dropdown profile avatar"
              className="nav-link dropdown-toggle hide-arrow"
              type="button"
              data-bs-toggle="dropdown"
            >
              <div className="avatar avatar-online">
                <img
                  src="../assets/img/avatars/1.png"
                  className="w-px-40 h-auto rounded-circle"
                  alt="Avatar"
                  aria-label="Avatar Image"
                />
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link aria-label="Go to profile" className="dropdown-item" to="/profile">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar avatar-online">
                        <img
                          src="../assets/img/avatars/1.png"
                          className="w-px-40 h-auto rounded-circle"
                          alt="Avatar"
                          aria-label="Avatar Image"
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <span className="fw-medium d-block">
                        {displayName()}
                      </span>
                      <small className="text-muted">Admin</small>
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li>
              <li>
                <Link aria-label="Go to profile" className="dropdown-item" to="/profile">
                  <i className="bx bx-user me-2"></i>
                  <span className="align-middle">My Profile</span>
                </Link>
              </li>
              <li>
                <Link aria-label="Go to settings" className="dropdown-item" to="/settings">
                  <i className="bx bx-cog me-2"></i>
                  <span className="align-middle">Settings</span>
                </Link>
              </li>
              {/* <li>
                <Link aria-label="Go to notifications" className="dropdown-item" to="/notifications">
                  <span className="d-flex align-items-center align-middle">
                    <i className="flex-shrink-0 bx bx-credit-card me-2"></i>
                    <span className="flex-grow-1 align-middle ms-1">Notifications</span>
                    <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger w-px-20 h-px-20">
                      4
                    </span>
                  </span>
                </Link>
              </li> */}
              <li>
                <div className="dropdown-divider"></div>
              </li>
              <li>
                <Link
                  aria-label="Click to log out"
                  className="dropdown-item"
                  to="/auth/login"
                >
                  <i className="bx bx-power-off me-2"></i>
                  <span className="align-middle">Logout</span>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
