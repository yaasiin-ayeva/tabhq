import { APP_NAME } from '@/utils/app.config';
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="content-footer footer bg-footer-theme">
      <div className="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
        <div className="mb-2 mb-md-0">
          {APP_NAME} © {currentYear} | All rights reserved
        </div>

        <div className="d-none d-lg-inline-block">
          <a
            aria-label="Go to GitHub license"
            href="https://github.com/yaasiin-ayeva/tabhq?tab=MIT-1-ov-file"
            className="footer-link me-4"
            target="_blank"
            rel="noreferrer"
          >
            License
          </a>

          <a
            aria-label="Go to GitHub documentation"
            href="https://github.com/yaasiin-ayeva/tabhq/blob/main/README.md"
            target="_blank"
            rel="noreferrer"
            className="footer-link me-4"
          >
            Documentation
          </a>

          <a
            aria-label="Go to GitHub support"
            href="https://github.com/yaasiin-ayeva/tabhq/issues"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
