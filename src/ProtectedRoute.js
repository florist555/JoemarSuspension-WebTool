import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  useEffect(() => {
    if (isAuthenticated === "true") {
      const current = window.location.href;
      window.history.replaceState(null, "", current);
      const preventBack = () => {
        const now = window.location.href;
        if (now === current) return;
        window.history.replaceState(null, "", current);
      };
      window.addEventListener("popstate", preventBack);
      return () => window.removeEventListener("popstate", preventBack);
    }
  }, [isAuthenticated]);

  if (isAuthenticated !== "true") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
