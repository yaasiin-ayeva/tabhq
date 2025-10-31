import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import './page-auth.css';
import { AuthWrapper } from "./AuthWrapper";

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        window.location.href = '/auth/login';
    };

    return (
        <AuthWrapper>
            <h4 className="mb-2 text-center">Password forgotten ? 🔒</h4>
            <p className="mb-2 text-center">Forget your password? No problem. Just let us know your email address and we will email you a password reset link.</p>
            <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        autoFocus
                    />
                </div>
                <button aria-label="Click me" className="btn btn-primary d-grid w-100">
                    Send reset link
                </button>
            </form>
            <div className="text-center">
                <Link aria-label="Go to Login Page" to="/auth/login" className="d-flex align-items-center justify-content-center">
                    <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
                    Go to login
                </Link>
            </div>
        </AuthWrapper>
    );
};
