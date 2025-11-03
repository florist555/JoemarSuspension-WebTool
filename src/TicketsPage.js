import React, { useState, useEffect } from "react";

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editedTicket, setEditedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerId: "",
    customerContact: "",
    assignedMechanic: "",
    issueDescription: "",
    estimatedCost: "",
    status: "Open"
  });
  const [loading, setLoading] = useState(false);
  const API_URL = "http://localhost:5000/api";

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets`);
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMechanics = async () => {
    try {
      const res = await fetch(`${API_URL}/mechanics`);
      const data = await res.json();
      setMechanics(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchMechanics();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      setEditedTicket({...selectedTicket});
    }
  }, [selectedTicket]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newTicket = await res.json();
        setTickets([newTicket, ...tickets]);
        setShowAddForm(false);
        setFormData({
          customerName: "",
          customerId: "",
          customerContact: "",
          assignedMechanic: "",
          issueDescription: "",
          estimatedCost: "",
          status: "Open"
        });
      }
    } catch (err) {
      console.error(err);
      alert('Error creating ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editedTicket) return;
    
    setLoading(true);
    try {
      let endpoint = `${API_URL}/tickets/${editedTicket._id}`;
      let body = editedTicket;

      if (editedTicket.status === 'Completed' && selectedTicket.status !== 'Completed') {
        endpoint = `${API_URL}/tickets/${editedTicket._id}/mark-done`;
        body = { actualCost: editedTicket.actualCost || 0 };
      }

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        setSelectedTicket(null);
        setEditedTicket(null);
        alert('Ticket updated successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!editedTicket) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tickets/${editedTicket._id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setTickets(tickets.filter(t => t._id !== editedTicket._id));
        setSelectedTicket(null);
        setEditedTicket(null);
        setShowDeleteConfirm(false);
        alert('Ticket deleted successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets/export/csv`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error exporting CSV. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    if (status === "Completed") return "#a3e4a3";
    if (status === "In Progress") return "#f5c26b";
    return "#f7f3a3";
  };

  const filteredTickets = tickets.filter((t) =>
    t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasChanges = editedTicket && selectedTicket && 
    JSON.stringify(editedTicket) !== JSON.stringify(selectedTicket);

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#E8D7B5",
      overflow: "hidden"
    }}>
      
      <div style={{
        flex: "0 0 45%",
        padding: "20px",
        backgroundColor: "#F2E2B1",
        borderRight: "2px solid #BDB395",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        <h2 style={{ 
          textAlign: "center", 
          fontWeight: "bold", 
          marginBottom: "20px", 
          fontSize: "24px", 
          color: "#000",
          flexShrink: 0
        }}>
          Edit Ticket
        </h2>

        {editedTicket ? (
          <div style={{ 
            backgroundColor: "#fff", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editedTicket.customerName}
                  onChange={(e) => setEditedTicket({...editedTicket, customerName: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={editedTicket.ticketId}
                  disabled
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    backgroundColor: "#f5f5f5",
                    color: "#888",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Contact Number
                </label>
                <input
                  type="text"
                  value={editedTicket.customerContact}
                  onChange={(e) => setEditedTicket({...editedTicket, customerContact: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Assigned Mechanic
                </label>
                <select
                  value={editedTicket.assignedMechanic?._id || ""}
                  onChange={(e) => {
                    const mechanic = mechanics.find(m => m._id === e.target.value);
                    setEditedTicket({...editedTicket, assignedMechanic: mechanic || null});
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="">Select Mechanic</option>
                  {mechanics.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Description
                </label>
                <textarea
                  value={editedTicket.issueDescription}
                  onChange={(e) => setEditedTicket({...editedTicket, issueDescription: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    outline: "none",
                    minHeight: "80px",
                    resize: "vertical",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Estimated Price (₱)
                </label>
                <input
                  type="number"
                  value={editedTicket.estimatedCost}
                  onChange={(e) => setEditedTicket({...editedTicket, estimatedCost: parseFloat(e.target.value) || 0})}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Actual Cost (₱)
                </label>
                <input
                  type="number"
                  value={editedTicket.actualCost}
                  onChange={(e) => setEditedTicket({...editedTicket, actualCost: parseFloat(e.target.value) || 0})}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Date Created
                </label>
                <input
                  type="text"
                  value={formatDate(editedTicket.createdAt)}
                  disabled
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    backgroundColor: "#f5f5f5",
                    color: "#888",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Date Modified
                </label>
                <input
                  type="text"
                  value={formatDate(editedTicket.updatedAt)}
                  disabled
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    backgroundColor: "#f5f5f5",
                    color: "#888",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ 
                padding: "15px", 
                backgroundColor: getStatusColor(editedTicket.status), 
                borderRadius: "10px",
                marginBottom: "15px"
              }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "14px", display: "block", marginBottom: "12px", textAlign: "center" }}>
                  Status
                </label>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                  {["Open", "In Progress", "Completed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditedTicket({...editedTicket, status})}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: editedTicket.status === status ? "3px solid #8B6F47" : "2px solid transparent",
                        backgroundColor: getStatusColor(status),
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "12px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexShrink: 0 }}>
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || loading}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: hasChanges ? "#5cb85c" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: hasChanges && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease"
                }}
              >
                {loading ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Delete Ticket
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "50px", 
            color: "#888",
            fontSize: "18px",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            Select a ticket from the right to edit
          </div>
        )}
      </div>

      <div style={{
        flex: "0 0 55%",
        padding: "20px",
        backgroundColor: "#E8D7B5",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          fontWeight: "bold", 
          marginBottom: "15px", 
          fontSize: "28px", 
          color: "#000",
          flexShrink: 0
        }}>
          Manage Tickets
        </h1>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexShrink: 0 }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#D4A373",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
            }}
          >
            {showAddForm ? "Cancel" : "+ Create New Ticket"}
          </button>
          
          <button
            onClick={handleExportCSV}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#5cb85c",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
            }}
          >
            Export to CSV
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleCreateTicket} style={{
            backgroundColor: "#F2E2B1",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "15px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            flexShrink: 0
          }}>
            <h3 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: "bold" }}>New Ticket</h3>
            
            <input
              type="text"
              placeholder="Customer Name"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #BDB395",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
            />
            
            <input
              type="text"
              placeholder="Customer ID (Optional)"
              value={formData.customerId}
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #BDB395",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
            />
            
            <input
              type="text"
              placeholder="Contact Number"
              required
              value={formData.customerContact}
              onChange={(e) => setFormData({...formData, customerContact: e.target.value})}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #BDB395",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
            />
            
            <select
              value={formData.assignedMechanic}
              onChange={(e) => setFormData({...formData, assignedMechanic: e.target.value})}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #BDB395",
                fontSize: "13px",
                backgroundColor: "#fff",
                cursor: "pointer",
                boxSizing: "border-box"
              }}
            >
              <option value="">Select Mechanic</option>
              {mechanics.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
            
            <textarea
              placeholder="Issue Description"
              required
              value={formData.issueDescription}
              onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #BDB395",
                fontSize: "13px",
                minHeight: "60px",
                resize: "vertical",
                boxSizing: "border-box"
              }}
            />
            
            <input
              type="number"
              placeholder="Estimated Price"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({...formData, estimatedCost: parseFloat(e.target.value) || 0})}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #BDB395",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
            />
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#8B6F47",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Creating..." : "Create Ticket"}
            </button>
          </form>
        )}

        <input
          type="text"
          placeholder="Search by ticket ID or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "12px",
            border: "1px solid #BDB395",
            width: "100%",
            marginBottom: "15px",
            fontSize: "14px",
            outline: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            flexShrink: 0,
            boxSizing: "border-box"
          }}
        />

        <div style={{ 
          flex: 1, 
          overflowY: "auto",
          paddingRight: "5px"
        }}>
          {filteredTickets.map(ticket => (
            <div
              key={ticket._id}
              onClick={() => setSelectedTicket(selectedTicket?._id === ticket._id ? null : ticket)}
              style={{
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "12px",
                backgroundColor: selectedTicket?._id === ticket._id ? "#D4A373" : getStatusColor(ticket.status),
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: selectedTicket?._id === ticket._id ? "2px solid #8B6F47" : "2px solid transparent"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "15px", color: "#000" }}>
                    {ticket.ticketId}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>
                    {ticket.customerName}
                  </div>
                </div>
                <div style={{ 
                  padding: "4px 12px", 
                  borderRadius: "20px", 
                  backgroundColor: selectedTicket?._id === ticket._id ? "#8B6F47" : "#fff",
                  color: selectedTicket?._id === ticket._id ? "#fff" : "#000",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {ticket.status}
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Mechanic: {ticket.assignedMechanic?.name || "Unassigned"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            maxWidth: "400px",
            textAlign: "center"
          }}>
            <h3 style={{ marginBottom: "15px", color: "#d9534f" }}>Confirm Delete</h3>
            <p style={{ marginBottom: "20px", color: "#666" }}>
              Are you sure you want to delete ticket <strong>{editedTicket?.ticketId}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ccc",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTicket}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketsPage;