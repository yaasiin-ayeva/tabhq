import React from "react";
import { useLocation } from "react-router-dom";
import Layout from "./views/layouts/Layout";
import { Blank } from "./views/layouts/Blank";
import AppRoutes from "./router/AppRoutes";

const App: React.FC = () => {
  const location = useLocation();

  const isAuthPath =
    location.pathname.includes("auth") ||
    location.pathname.includes("error") ||
    location.pathname.includes("under-maintenance") ||
    location.pathname.includes("blank");

  return (
    <>
      {isAuthPath ? (
        <AppRoutes>
          <Blank />
        </AppRoutes>
      ) : (
        <Layout>
          <AppRoutes />
        </Layout>
      )}
    </>
  );
};

export default App;
