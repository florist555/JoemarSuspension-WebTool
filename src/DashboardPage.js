import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DashboardPage.css";

function DashboardPage() {
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
                className={`icon ${isActive("/") ? "active" : ""}`}
                onClick={() => navigate("/")}
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
      <div className="dashboard-content"></div>
    </div>
  );
}

export default DashboardPage;
