import { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "../views/pages/authentication/LoginPage";
import { ForgotPasswordPage } from "../views/pages/authentication/ForgotPasswordPage";
import { RegisterPage } from "@/views/pages/authentication/RegisterPage";
import AppsPage from "@/views/pages/apps";
import ProvidersPage from "@/views/pages/apps/providers";
import { Navigate } from "react-router-dom";
import { getToken } from "@/utils/localstorage";

const RequireAuth = ({ children }: { children: ReactNode }) => {
    const token = getToken();
    if (!token) return <Navigate to="/auth/login" replace />;
    return <>{children}</>;
};

const AppRoutes = ({ children }: { children?: ReactNode }) => {
    return (
        <>
            <Routes>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/apps" element={<RequireAuth><AppsPage /></RequireAuth>} />
                <Route
                    path="/apps/:appId/providers"
                    element={
                        <RequireAuth>
                            <ProvidersPage />
                        </RequireAuth>
                    }
                />
                <Route path="/" element={<Navigate to="/apps" replace />} />
            </Routes>
            {children}
        </>
    );
};

export default AppRoutes;