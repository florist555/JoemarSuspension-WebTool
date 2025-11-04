import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
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
  const doughnutRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchDashboardStats();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchDashboardStats = async () => {
    try {
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

  const getCurrentMonthYear = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleExportClick = async () => {
    const result = await Swal.fire({
      title: 'Export Monthly Report',
      text: 'Choose export format:',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5cb85c',
      cancelButtonColor: '#d9534f',
      confirmButtonText: 'PDF (Printable)',
      cancelButtonText: 'CSV (Excel)',
      showCloseButton: true,
    });

    if (result.isConfirmed) {
      exportToPDF();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      exportToCSV();
    }
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      const logo = new Image();
      logo.src = '/asset/W_Mechanic.png';
      
      logo.onload = () => {
        doc.addImage(logo, 'PNG', 15, yPos, 30, 30);
        
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Joemar Suspension', 50, yPos + 10);
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Monthly Report', 50, yPos + 18);
        
        doc.setFontSize(10);
        doc.text(getCurrentMonthYear(), 50, yPos + 25);
        
        doc.setLineWidth(0.5);
        doc.line(15, yPos + 35, pageWidth - 15, yPos + 35);
        
        yPos = yPos + 45;

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Financial Summary', 15, yPos);
        yPos += 7;
        
        autoTable(doc, {
          startY: yPos,
          head: [['Metric', 'Value']],
          body: [
            ['Monthly Revenue', `₱${stats?.revenue?.thisMonth?.toLocaleString() || 0}`],
            ['Growth vs Last Month', `${parseFloat(stats?.revenue?.growthPercentage) >= 0 ? '+' : ''}${Math.abs(stats?.revenue?.growthPercentage)}%`],
            ['Low Stock Alerts', `${stats?.lowStockItems?.length || 0} items`],
            ['Active Services Today', `${stats?.todaysActiveTickets?.length || 0} tickets`],
          ],
          theme: 'grid',
          headStyles: { fillColor: [189, 179, 149] },
          margin: { left: 15, right: 15 },
        });
        
        yPos = doc.lastAutoTable.finalY + 10;

        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = 20;
        }

        if (doughnutRef.current) {
          const doughnutImage = doughnutRef.current.toBase64Image();
          
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Ticket Status Distribution', 15, yPos);
          yPos += 10;
          
          const chartWidth = pageWidth - 30;
          const chartHeight = 100;
          const chartX = (pageWidth - chartWidth) / 2;
          
          doc.addImage(doughnutImage, 'PNG', chartX, yPos, chartWidth, chartHeight);
          yPos += chartHeight + 15;
        }

        if (yPos > pageHeight - 120) {
          doc.addPage();
          yPos = 20;
        }

        if (barRef.current) {
          const barImage = barRef.current.toBase64Image();
          
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Inventory by Category', 15, yPos);
          yPos += 10;
          
          const chartWidth = pageWidth - 30;
          const chartHeight = 100;
          const chartX = (pageWidth - chartWidth) / 2;
          
          doc.addImage(barImage, 'PNG', chartX, yPos, chartWidth, chartHeight);
          yPos += chartHeight + 15;
        }

        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Ticket Status Breakdown', 15, yPos);
        yPos += 7;
        
        const ticketStatusBody = [
          ['Open', stats?.ticketsByStatus?.Open || 0],
          ['Pending', stats?.ticketsByStatus?.Pending || 0],
          ['In Progress', stats?.ticketsByStatus?.["In Progress"] || 0],
          ['Completed', stats?.ticketsByStatus?.Completed || 0],
          ['Closed', stats?.ticketsByStatus?.Closed || 0],
        ];
        
        autoTable(doc, {
          startY: yPos,
          head: [['Status', 'Count']],
          body: ticketStatusBody,
          theme: 'grid',
          headStyles: { fillColor: [189, 179, 149] },
          margin: { left: 15, right: 15 },
        });

        yPos = doc.lastAutoTable.finalY + 15;

        const inventoryCategoryBody = stats?.inventoryByCategory?.map((item) => [
          item._id,
          item.count,
        ]) || [];

        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Inventory by Category Breakdown', 15, yPos);
        yPos += 7;

        autoTable(doc, {
          startY: yPos,
          head: [['Category', 'Count']],
          body: inventoryCategoryBody,
          theme: 'grid',
          headStyles: { fillColor: [189, 179, 149] },
          margin: { left: 15, right: 15 },
        });

        yPos = doc.lastAutoTable.finalY + 15;

        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Today's Active Services", 15, yPos);
        yPos += 7;

        if (stats?.todaysActiveTickets?.length > 0) {
          const activeServicesBody = stats.todaysActiveTickets.map((ticket) => [
            ticket.ticketId,
            ticket.customerName,
            ticket.assignedMechanic?.name || "Unassigned",
            ticket.status,
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Ticket ID', 'Customer', 'Mechanic', 'Status']],
            body: activeServicesBody,
            theme: 'grid',
            headStyles: { fillColor: [189, 179, 149] },
            margin: { left: 15, right: 15 },
          });
          
          yPos = doc.lastAutoTable.finalY + 10;
        } else {
          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);
          doc.text('No active services for today', 15, yPos);
          yPos += 10;
        }

        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Low Stock Items', 15, yPos);
        yPos += 7;

        if (stats?.lowStockItems?.length > 0) {
          const lowStockBody = stats.lowStockItems.map((item) => [
            item.partName,
            item.partNumber,
            item.quantity.toString(),
            item.minStockLevel.toString(),
            item.category,
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Part Name', 'Part Number', 'Quantity', 'Min Level', 'Category']],
            body: lowStockBody,
            theme: 'grid',
            headStyles: { fillColor: [189, 179, 149] },
            margin: { left: 15, right: 15 },
          });
        } else {
          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);
          doc.text('All items are well stocked', 15, yPos);
        }

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setFont(undefined, 'normal');
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }

        doc.save(`Joemar Suspension Monthly Report ${getCurrentMonthYear().replace(' ', '_')}.pdf`);
        
        Swal.fire({
          icon: 'success',
          title: 'Exported!',
          text: 'PDF report has been downloaded successfully.',
          confirmButtonColor: '#5cb85c'
        });
      };

      logo.onerror = () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load company logo. PDF export cancelled.',
          confirmButtonColor: '#d9534f'
        });
      };

    } catch (error) {
      console.error('Error exporting PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error exporting PDF. Please try again.',
        confirmButtonColor: '#d9534f'
      });
    }
  };

  const exportToCSV = () => {
    try {
      const wb = XLSX.utils.book_new();

      const detailedData = [];
      
      detailedData.push(['JOEMAR SUSPENSION - MONTHLY REPORT']);
      detailedData.push([getCurrentMonthYear()]);
      detailedData.push([]);
      
      detailedData.push(['TICKET STATUS BREAKDOWN']);
      detailedData.push(['Status', 'Count']);
      detailedData.push(['Open', stats?.ticketsByStatus?.Open || 0]);
      detailedData.push(['Pending', stats?.ticketsByStatus?.Pending || 0]);
      detailedData.push(['In Progress', stats?.ticketsByStatus?.["In Progress"] || 0]);
      detailedData.push(['Completed', stats?.ticketsByStatus?.Completed || 0]);
      detailedData.push(['Closed', stats?.ticketsByStatus?.Closed || 0]);
      detailedData.push([]);
      
      detailedData.push(['INVENTORY BY CATEGORY']);
      detailedData.push(['Category', 'Count']);
      stats?.inventoryByCategory?.forEach((item) => {
        detailedData.push([item._id, item.count]);
      });
      detailedData.push([]);
      
      detailedData.push(["TODAY'S ACTIVE SERVICES"]);
      if (stats?.todaysActiveTickets?.length > 0) {
        detailedData.push(['Ticket ID', 'Customer', 'Mechanic', 'Status']);
        stats.todaysActiveTickets.forEach((ticket) => {
          detailedData.push([
            ticket.ticketId,
            ticket.customerName,
            ticket.assignedMechanic?.name || "Unassigned",
            ticket.status,
          ]);
        });
      } else {
        detailedData.push(['No active services for today']);
      }
      detailedData.push([]);
      
      detailedData.push(['LOW STOCK ITEMS']);
      if (stats?.lowStockItems?.length > 0) {
        detailedData.push(['Part Name', 'Part Number', 'Quantity', 'Min Level', 'Category']);
        stats.lowStockItems.forEach((item) => {
          detailedData.push([
            item.partName,
            item.partNumber,
            item.quantity,
            item.minStockLevel,
            item.category,
          ]);
        });
      } else {
        detailedData.push(['All items are well stocked']);
      }

      const ws1 = XLSX.utils.aoa_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Detailed Data');

      const summaryData = [];
      summaryData.push(['JOEMAR SUSPENSION - DASHBOARD SUMMARY']);
      summaryData.push([getCurrentMonthYear()]);
      summaryData.push([]);
      summaryData.push(['FINANCIAL SUMMARY']);
      summaryData.push(['Metric', 'Value']);
      summaryData.push(['Monthly Revenue', `₱${stats?.revenue?.thisMonth?.toLocaleString() || 0}`]);
      summaryData.push(['Growth vs Last Month', `${parseFloat(stats?.revenue?.growthPercentage) >= 0 ? '+' : ''}${Math.abs(stats?.revenue?.growthPercentage)}%`]);
      summaryData.push(['Low Stock Alerts', `${stats?.lowStockItems?.length || 0} items`]);
      summaryData.push(['Active Services Today', `${stats?.todaysActiveTickets?.length || 0} tickets`]);
      summaryData.push([]);
      summaryData.push(['TICKET STATUS TOTALS']);
      summaryData.push(['Status', 'Count']);
      summaryData.push(['Open', stats?.ticketsByStatus?.Open || 0]);
      summaryData.push(['Pending', stats?.ticketsByStatus?.Pending || 0]);
      summaryData.push(['In Progress', stats?.ticketsByStatus?.["In Progress"] || 0]);
      summaryData.push(['Completed', stats?.ticketsByStatus?.Completed || 0]);
      summaryData.push(['Closed', stats?.ticketsByStatus?.Closed || 0]);
      summaryData.push([]);
      summaryData.push(['INVENTORY CATEGORY TOTALS']);
      summaryData.push(['Category', 'Count']);
      stats?.inventoryByCategory?.forEach((item) => {
        summaryData.push([item._id, item.count]);
      });

      const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

      XLSX.writeFile(wb, `Joemar_Suspension_Monthly_Report_${getCurrentMonthYear().replace(' ', '_')}.xlsx`);

      Swal.fire({
        icon: 'success',
        title: 'Exported!',
        text: 'CSV file has been downloaded successfully.',
        confirmButtonColor: '#5cb85c'
      });

    } catch (error) {
      console.error('Error exporting CSV:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error exporting CSV. Please try again.',
        confirmButtonColor: '#d9534f'
      });
    }
  };

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
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <button className="export-button" onClick={handleExportClick} title="Export Monthly Report">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export Report</span>
          </button>
        </div>

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
              <Doughnut ref={doughnutRef} data={ticketStatusData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h3>Inventory by Category</h3>
            <div className="chart-container">
              <Bar ref={barRef} data={inventoryCategoryData} options={barChartOptions} />
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
                      <th>Mechanic</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.todaysActiveTickets.map((ticket) => (
                      <tr key={ticket._id}>
                        <td>{ticket.ticketId}</td>
                        <td>{ticket.customerName}</td>
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