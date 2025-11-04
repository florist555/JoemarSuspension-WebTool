import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editedTicket, setEditedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
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
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Ticket created successfully!',
          confirmButtonColor: '#5cb85c'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error creating ticket. Please try again.',
        confirmButtonColor: '#d9534f'
      });
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
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Ticket updated successfully!',
          confirmButtonColor: '#5cb85c'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating ticket. Please try again.',
        confirmButtonColor: '#d9534f'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!editedTicket) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `Do you want to delete ticket <strong>${editedTicket.ticketId}</strong>?<br/>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d9534f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/tickets/${editedTicket._id}`, {
          method: "DELETE"
        });

        if (res.ok) {
          setTickets(tickets.filter(t => t._id !== editedTicket._id));
          setSelectedTicket(null);
          setEditedTicket(null);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Ticket has been deleted successfully.',
            confirmButtonColor: '#5cb85c'
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error deleting ticket. Please try again.',
          confirmButtonColor: '#d9534f'
        });
      } finally {
        setLoading(false);
      }
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
      Swal.fire({
        icon: 'success',
        title: 'Exported!',
        text: 'CSV file has been downloaded successfully.',
        confirmButtonColor: '#5cb85c'
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error exporting CSV. Please try again.',
        confirmButtonColor: '#d9534f'
      });
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
    if (status === "Completed") return "#90EE90";
    if (status === "In Progress") return "#FFD580";
    return "#FFEB99";
  };

  const filteredTickets = tickets.filter((t) =>
    t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasChanges = editedTicket && selectedTicket && 
    JSON.stringify(editedTicket) !== JSON.stringify(selectedTicket);

  return (
    <>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div style={{ 
        display: "flex", 
        height: "100vh", 
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#999999",
        overflow: "hidden",
        padding: "10px",
        boxSizing: "border-box"
      }}>
      
      <div style={{
        flex: "0 0 45%",
        padding: "10px",
        backgroundColor: "#A9A9A9",
        borderRight: "2px solid #8B8B8B",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        <h2 style={{ 
          textAlign: "center", 
          fontWeight: "bold", 
          marginBottom: "10px", 
          fontSize: "22px", 
          color: "#000",
          flexShrink: 0
        }}>
          Edit Ticket
        </h2>

        {editedTicket ? (
          <div style={{ 
            backgroundColor: "#fff", 
            padding: "12px", 
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editedTicket.customerName}
                  onChange={(e) => setEditedTicket({...editedTicket, customerName: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={editedTicket.ticketId}
                  disabled
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
                    backgroundColor: "#f5f5f5",
                    color: "#888",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  Contact Number
                </label>
                <input
                  type="text"
                  value={editedTicket.customerContact}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setEditedTicket({...editedTicket, customerContact: value});
                  }}
                  maxLength={11}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
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
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
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

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  Description
                </label>
                <textarea
                  value={editedTicket.issueDescription}
                  onChange={(e) => setEditedTicket({...editedTicket, issueDescription: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
                    outline: "none",
                    minHeight: "50px",
                    resize: "vertical",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  Estimated Price (₱)
                </label>
                <input
                  type="text"
                  value={editedTicket.estimatedCost}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setEditedTicket({...editedTicket, estimatedCost: value ? parseInt(value) : 0});
                  }}
                  maxLength={9}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  Actual Cost (₱)
                </label>
                <input
                  type="text"
                  value={editedTicket.actualCost}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setEditedTicket({...editedTicket, actualCost: value ? parseInt(value) : 0});
                  }}
                  maxLength={9}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  Date Created
                </label>
                <input
                  type="text"
                  value={formatDate(editedTicket.createdAt)}
                  disabled
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
                    backgroundColor: "#f5f5f5",
                    color: "#888",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  Date Modified
                </label>
                <input
                  type="text"
                  value={formatDate(editedTicket.updatedAt)}
                  disabled
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
                    backgroundColor: "#f5f5f5",
                    color: "#888",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ 
                padding: "10px", 
                backgroundColor: getStatusColor(editedTicket.status), 
                borderRadius: "10px",
                marginBottom: "8px"
              }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "10px", textAlign: "center" }}>
                  Status
                </label>
                <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                  {["Open", "In Progress", "Completed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditedTicket({...editedTicket, status})}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: editedTicket.status === status ? "3px solid #8B7355" : "2px solid transparent",
                        backgroundColor: getStatusColor(status),
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "11px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexShrink: 0 }}>
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || loading}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: hasChanges ? "#5cb85c" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: hasChanges && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease"
                }}
              >
                {loading ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
              </button>
              
              <button
                onClick={handleDeleteTicket}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
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
        padding: "10px 10px 10px 10px",
        backgroundColor: "#999999",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          fontWeight: "bold", 
          marginBottom: "10px", 
          fontSize: "24px", 
          color: "#000",
          flexShrink: 0
        }}>
          Manage Tickets
        </h1>

        <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexShrink: 0 }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#BDB395",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
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
              padding: "8px",
              backgroundColor: "#5cb85c",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
            }}
          >
            Export to CSV
          </button>
        </div>

        {showAddForm && (
          <div style={{
            backgroundColor: "#A9A9A9",
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
                border: "1px solid #8B8B8B",
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
                border: "1px solid #8B8B8B",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
            />
            
            <input
              type="text"
              placeholder="Contact Number"
              required
              value={formData.customerContact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                setFormData({...formData, customerContact: value});
              }}
              maxLength={11}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #8B8B8B",
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
                border: "1px solid #8B8B8B",
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
                border: "1px solid #8B8B8B",
                fontSize: "13px",
                minHeight: "60px",
                resize: "vertical",
                boxSizing: "border-box"
              }}
            />
            
            <input
              type="text"
              placeholder="Estimated Price"
              value={formData.estimatedCost}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                setFormData({...formData, estimatedCost: value ? parseInt(value) : 0});
              }}
              maxLength={9}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #8B8B8B",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
            />
            
            <button
              onClick={(e) => {
                e.preventDefault();
                handleCreateTicket(e);
              }}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#8B7355",
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
          </div>
        )}

          <input
            type="text"
            placeholder="Search by ticket ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              border: "1px solid #8B8B8B",
              width: "100%",
              marginBottom: "10px",
              fontSize: "13px",
              outline: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              flexShrink: 0,
              boxSizing: "border-box"
            }}
          />

        <div style={{ 
          flex: 1, 
          overflowY: "auto",
          paddingRight: "5px",
          marginBottom: "10px",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
        className="hide-scrollbar"
        >
          {filteredTickets.map(ticket => (
            <div
              key={ticket._id}
              onClick={() => {
                if (selectedTicket?._id === ticket._id) {
                  setSelectedTicket(null);
                  setEditedTicket(null);
                } else {
                  setSelectedTicket(ticket);
                }
              }}
              style={{
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "12px",
                backgroundColor: selectedTicket?._id === ticket._id ? "#BDB395" : getStatusColor(ticket.status),
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: selectedTicket?._id === ticket._id ? "2px solid #8B7355" : "2px solid transparent"
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
                  backgroundColor: selectedTicket?._id === ticket._id ? "#8B7355" : "#fff",
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
      </div>
    </>
  );
}

export default TicketsPage;