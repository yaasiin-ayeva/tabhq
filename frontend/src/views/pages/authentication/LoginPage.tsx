import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import './page-auth.css';
import { AuthWrapper } from "./AuthWrapper";
import { useLoginMutation } from "@/store/authApi";
import { setToken, setUserInfo } from "@/utils/localstorage";
import Swal from 'sweetalert2';

interface FormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [login, { isLoading }] = useLoginMutation();
    const [formData, setFormData] = useState<FormData>({
        password: '',
        email: '',
        rememberMe: false,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await login({ email: formData.email, password: formData.password }).unwrap();
            if (res?.token) setToken(res.token);
            if (res?.user) setUserInfo(res.user);
            navigate('/apps');
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Login failed', text: 'Please check your credentials and try again.' });
        }
    };

    return (
        <AuthWrapper>
            <h4 className="mb-2 text-center">Welcome 👋</h4>
            <p className="mb-4 text-center">Login to your account</p>

            <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        name="email"
                        placeholder="Enter your email address"
                        autoFocus
                    />
                </div>
                <div className="mb-3 form-password-toggle">
                    <div className="d-flex justify-content-between">
                        <label className="form-label" htmlFor="password">Password</label>
                        <Link aria-label="Go to Forgot Password Page" to="/auth/forgot-password">
                            <small>Forgot Password ?</small>
                        </Link>
                    </div>
                    <div className="input-group input-group-merge">
                        <input
                            type="password"
                            autoComplete="true"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control"
                            name="password"
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                            aria-describedby="password"
                        />
                        <span className="input-group-text cursor-pointer"></span>
                    </div>
                </div>
                <div className="mb-3">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="remember-me"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="remember-me"> Remember me </label>
                    </div>
                </div>
                <div className="mb-3">
                    <button aria-label="Click me" className="btn btn-primary d-grid w-100" type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>

            <p className="text-center">
                <span>New on our platform ? </span>
                <Link aria-label="Go to Register Page" to='/auth/register' className="registration-link">
                    <span> Register Now</span>
                </Link>
            </p>
        </AuthWrapper>
    );
};
