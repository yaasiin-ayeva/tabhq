import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import './page-auth.css';
import { AuthWrapper } from "./AuthWrapper";
import { useRegisterMutation } from "@/store/authApi";
import { setToken, setUserInfo } from "@/utils/localstorage";
import Swal from 'sweetalert2';

interface FormData {
  firstname: string;
  lastname: string;
  orgName: string;
  email: string;
  password: string;
  terms: boolean;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname: '',
    orgName: '',
    email: '',
    password: '',
    terms: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await register({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
        orgName: formData.orgName,
      }).unwrap();
      if (res?.token) setToken(res.token);
      if (res?.user) setUserInfo(res.user);
      await Swal.fire({ icon: 'success', title: 'Welcome!', text: 'Your account has been created successfully.' });
      navigate('/apps');
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Registration failed', text: 'Please try again later.' });
    }
  };

  return (
    <AuthWrapper>
      <h4 className="mb-2">Your journey starts here 🚀</h4>
      <p className="mb-4">Make your payment management easy and fun!</p>

      <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="firstname" className="form-label">First name</label>
          <input
            type="text"
            className="form-control"
            id="firstname"
            value={formData.firstname}
            onChange={handleChange}
            name="firstname"
            placeholder="Enter your first name"
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label htmlFor="lastname" className="form-label">Last name</label>
          <input
            type="text"
            className="form-control"
            id="lastname"
            value={formData.lastname}
            onChange={handleChange}
            name="lastname"
            placeholder="Enter your last name"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="orgName" className="form-label">Organization</label>
          <input
            type="text"
            className="form-control"
            id="orgName"
            value={formData.orgName}
            onChange={handleChange}
            name="orgName"
            placeholder="Your organization name"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="text"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-3 form-password-toggle">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="input-group input-group-merge">
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              name="password"
              placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
              aria-describedby="password"
            />
            <span className="input-group-text cursor-pointer"><i className="bx bx-hide"></i></span>
          </div>
        </div>

        <div className="mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="terms-conditions"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="terms-conditions">
              I agree to
              <a aria-label="privacy policy and terms" href="#"> privacy policy & terms</a>
            </label>
          </div>
        </div>
        <button aria-label='Click me' className="btn btn-primary d-grid w-100" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Sign up'}</button>
      </form>

      <p className="text-center">
        <span>Already have an account?</span>
        <Link aria-label="Go to Login Page" to="/auth/login" className="d-flex align-items-center justify-content-center">
          <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
          Login
        </Link>
      </p>
    </AuthWrapper>
  );
};
