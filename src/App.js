import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardLayout from "./DashboardLayout";
import TicketsPage from "./TicketsPage";
import InventoryPage from "./InventoryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route
            path="dashboard"
            element={
              <h1
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginTop: "50px",
                  fontSize: "36px",
                  color: "#000"
                }}
              >
                Dashboard
              </h1>
            }
          />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
