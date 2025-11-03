import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import "./DashboardPage.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIcons, setShowIcons] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [location.pathname]); // Added dependency - refetch when route changes

  const fetchDashboardStats = async () => {
    try {
      setLoading(true); // Set loading true on each fetch
      const response = await fetch("http://localhost:5000/api/dashboard/stats");
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  const toggleIcons = () => {
    setShowIcons(!showIcons);
  };

  const isActive = (path) => location.pathname === path;

  const ticketStatusData = {
    labels: ["Open", "Pending", "In Progress", "Completed", "Closed"],
    datasets: [
      {
        data: [
          stats?.ticketsByStatus?.Open || 0,
          stats?.ticketsByStatus?.Pending || 0,
          stats?.ticketsByStatus?.["In Progress"] || 0,
          stats?.ticketsByStatus?.Completed || 0,
          stats?.ticketsByStatus?.Closed || 0,
        ],
        backgroundColor: [
          "#FF6B6B",
          "#FFA500",
          "#4ECDC4",
          "#95E1D3",
          "#A8E6CF",
        ],
        borderColor: ["#fff"],
        borderWidth: 2,
      },
    ],
  };

  const inventoryCategoryData = {
    labels: stats?.inventoryByCategory?.map((item) => item._id) || [],
    datasets: [
      {
        label: "Items Count",
        data: stats?.inventoryByCategory?.map((item) => item.count) || [],
        backgroundColor: "#BDB395",
        borderColor: "#8B7355",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
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
        <div className="dashboard-content">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

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
      <div className="dashboard-content">
        <h1 className="dashboard-title">Dashboard Overview</h1>

        <div className="stats-grid">
          <div className="stat-card revenue-card">
            <h3>Monthly Revenue</h3>
            <div className="revenue-amount">₱{stats?.revenue?.thisMonth?.toLocaleString() || 0}</div>
            <div className={`growth ${parseFloat(stats?.revenue?.growthPercentage) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(stats?.revenue?.growthPercentage) >= 0 ? '↑' : '↓'} {Math.abs(stats?.revenue?.growthPercentage)}% vs last month
            </div>
          </div>

          <div className="stat-card">
            <h3>Low Stock Alerts</h3>
            <div className="alert-count">{stats?.lowStockItems?.length || 0}</div>
            <div className="alert-text">Items need restocking</div>
          </div>

          <div className="stat-card">
            <h3>Active Today</h3>
            <div className="alert-count">{stats?.todaysActiveTickets?.length || 0}</div>
            <div className="alert-text">Services in progress</div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>Ticket Status Distribution</h3>
            <div className="chart-container">
              <Doughnut data={ticketStatusData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h3>Inventory by Category</h3>
            <div className="chart-container">
              <Bar data={inventoryCategoryData} options={barChartOptions} />
            </div>
          </div>
        </div>

        <div className="tables-row">
          <div className="table-card">
            <h3>Today's Active Services</h3>
            <div className="table-container">
              {stats?.todaysActiveTickets?.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Mechanic</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.todaysActiveTickets.map((ticket) => (
                      <tr key={ticket._id}>
                        <td>{ticket.ticketId}</td>
                        <td>{ticket.customerName}</td>
                        <td>{ticket.vehicleInfo?.make} {ticket.vehicleInfo?.model}</td>
                        <td>{ticket.assignedMechanic?.name || "Unassigned"}</td>
                        <td><span className="status-badge in-progress">{ticket.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data">No active services for today</div>
              )}
            </div>
          </div>

          <div className="table-card">
            <h3>Low Stock Items</h3>
            <div className="table-container">
              {stats?.lowStockItems?.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Part Name</th>
                      <th>Part Number</th>
                      <th>Quantity</th>
                      <th>Min Level</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockItems.map((item) => (
                      <tr key={item._id}>
                        <td>{item.partName}</td>
                        <td>{item.partNumber}</td>
                        <td className="low-stock">{item.quantity}</td>
                        <td>{item.minStockLevel}</td>
                        <td>{item.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data">All items are well stocked</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;