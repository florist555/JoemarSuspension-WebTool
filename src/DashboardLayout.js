import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useLogout } from "./LogoutHandler";
import "./DashboardPage.css";

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIcons, setShowIcons] = useState(true);
  const handleLogout = useLogout();

  const toggleIcons = () => {
    setShowIcons(!showIcons);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="top-icons">
          <img
            src="/asset/P_Nav.png"
            alt="Navigation"
            className="icon"
            onClick={toggleIcons}
          />
          {showIcons && (
            <>
              <img
                src="/asset/Summary.png"
                alt="Dashboard"
                className={`icon ${isActive("/app/dashboard") ? "active" : ""}`}
                onClick={() => navigate("/app/dashboard")}
              />
              <img
                src="/asset/Tickets.png"
                alt="Tickets"
                className={`icon ${isActive("/app/tickets") ? "active" : ""}`}
                onClick={() => navigate("/app/tickets")}
              />
              <img
                src="/asset/Inventory.png"
                alt="Inventory"
                className={`icon ${isActive("/app/inventory") ? "active" : ""}`}
                onClick={() => navigate("/app/inventory")}
              />
            </>
          )}
        </div>
        <div className="bottom-icon">
          <img
            src="/asset/P_Logout.png"
            alt="Logout"
            className="icon logout-icon"
            onClick={handleLogout}
          />
        </div>
      </div>
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
