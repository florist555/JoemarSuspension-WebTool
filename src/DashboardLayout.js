import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "./DashboardPage.css";

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIcons, setShowIcons] = useState(true);

  const handleLogout = () => {
    navigate("/");
  };

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
                className={`icon ${isActive("/dashboard") ? "active" : ""}`}
                onClick={() => navigate("/dashboard")}
              />
              <img
                src="/asset/Tickets.png"
                alt="Tickets"
                className={`icon ${isActive("/tickets") ? "active" : ""}`}
                onClick={() => navigate("/tickets")}
              />
              <img
                src="/asset/Inventory.png"
                alt="Inventory"
                className={`icon ${isActive("/inventory") ? "active" : ""}`}
                onClick={() => navigate("/inventory")}
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
