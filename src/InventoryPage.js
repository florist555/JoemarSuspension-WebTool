import React, { useState, useEffect } from "react";

const InventoryPage = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newItem, setNewItem] = useState({
    partName: "",
    partNumber: "",
    quantity: "",
    price: "",
    supplier: "",
    minStockLevel: 5,
    category: "Other",
    description: ""
  });

  const categories = [
    "Engine",
    "Brakes",
    "Suspension",
    "Transmission",
    "Ignition",
    "Exhaust",
    "Cooling",
    "Fuel",
    "Other"
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');
      const data = await response.json();
      console.log('Fetched data:', data);
      if (Array.isArray(data)) {
        setInventoryItems(data);
      } else {
        console.error('Expected array but got:', data);
        setInventoryItems([]);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventoryItems([]);
    }
  };

  const updateItem = async (id, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      const updatedItem = await response.json();
      
      setInventoryItems(items =>
        items.map(item =>
          item._id === id ? updatedItem : item
        )
      );
      
      setSelectedItem(updatedItem);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  const handleSaveChanges = () => {
    if (!selectedItem) return;
    updateItem(selectedItem._id, {
      partName: selectedItem.partName,
      category: selectedItem.category,
      price: selectedItem.price,
      supplier: selectedItem.supplier
    });
    alert('Changes saved successfully!');
    setSelectedItem(null);
  };

  const addNewItem = async (e) => {
    e.preventDefault();
    try {
      const itemToSend = {
        partName: newItem.partName,
        partNumber: newItem.partNumber,
        quantity: parseInt(newItem.quantity) || 0,
        price: parseFloat(newItem.price) || 0,
        supplier: newItem.supplier,
        minStockLevel: newItem.minStockLevel || 5,
        category: newItem.category || "Other",
        description: newItem.description || ""
      };

      console.log('Sending item:', itemToSend);

      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        console.error('Full error response:', JSON.stringify(errorData, null, 2));
        alert(`Error adding item: ${errorData.message || 'Unknown error'}`);
        return;
      }

      const addedItem = await response.json();
      setInventoryItems([addedItem, ...inventoryItems]);
      setShowAddForm(false);
      setNewItem({
        partName: "",
        partNumber: "",
        quantity: "",
        price: "",
        supplier: "",
        minStockLevel: 5,
        category: "Other",
        description: ""
      });
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Make sure Part Number is unique.');
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${selectedItem._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setInventoryItems(inventoryItems.filter(item => item._id !== selectedItem._id));
        setSelectedItem(null);
        setShowDeleteConfirm(false);
        alert('Item deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/inventory/export/csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
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

  const filteredAndSortedItems = inventoryItems
    .filter(item => 
      (item.partName && item.partName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.partNumber && item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === "highToLow") return b.price - a.price;
      if (sortOrder === "lowToHigh") return a.price - b.price;
      return 0;
    });

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
          Edit Item
        </h2>

        {selectedItem ? (
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
                  Part Name
                </label>
                <input
                  type="text"
                  value={selectedItem.partName}
                  onChange={(e) => setSelectedItem({...selectedItem, partName: e.target.value})}
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
                  Category
                </label>
                <select
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#fff",
                    cursor: "pointer"
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                  Price (₱)
                </label>
                <input
                  type="number"
                  value={selectedItem.price}
                  onChange={(e) => setSelectedItem({...selectedItem, price: parseFloat(e.target.value)})}
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
                  Supplier
                </label>
                <input
                  type="text"
                  value={selectedItem.supplier}
                  onChange={(e) => setSelectedItem({...selectedItem, supplier: e.target.value})}
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
                  ID Number
                </label>
                <input
                  type="text"
                  value={selectedItem.partNumber}
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

              {selectedItem.createdAt && (
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                    Date Created
                  </label>
                  <input
                    type="text"
                    value={formatDate(selectedItem.createdAt)}
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
              )}

              {selectedItem.updatedAt && (
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                    Date Modified
                  </label>
                  <input
                    type="text"
                    value={formatDate(selectedItem.updatedAt)}
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
              )}

              <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#F2E2B1", borderRadius: "10px", marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "14px", display: "block", marginBottom: "12px", textAlign: "center" }}>
                  Current Stock
                </label>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
                  <button
                    onClick={() => updateItem(selectedItem._id, { quantity: selectedItem.quantity - 1 })}
                    disabled={selectedItem.quantity <= 0}
                    style={{
                      backgroundColor: "#D4A373",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 18px",
                      cursor: selectedItem.quantity <= 0 ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "22px",
                      color: "#fff",
                      opacity: selectedItem.quantity <= 0 ? 0.5 : 1,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}
                  >
                    -
                  </button>
                  <span style={{ 
                    fontWeight: "bold", 
                    fontSize: "28px", 
                    minWidth: "70px", 
                    textAlign: "center",
                    color: selectedItem.quantity <= selectedItem.minStockLevel ? "#d32f2f" : "#000"
                  }}>
                    {selectedItem.quantity}
                  </span>
                  <button
                    onClick={() => updateItem(selectedItem._id, { quantity: selectedItem.quantity + 1 })}
                    style={{
                      backgroundColor: "#D4A373",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 18px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "22px",
                      color: "#fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexShrink: 0 }}>
              <button
                onClick={handleSaveChanges}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#5cb85c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Delete Item
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
            Select an item from the right to edit
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
          Inventory
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
            {showAddForm ? "Cancel" : "+ Add New Item"}
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
          <form onSubmit={addNewItem} style={{
            backgroundColor: "#F2E2B1",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "15px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            flexShrink: 0
          }}>
            <h3 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: "bold" }}>Add New Part</h3>
            
            <input
              type="text"
              placeholder="Part Name"
              required
              value={newItem.partName}
              onChange={(e) => setNewItem({...newItem, partName: e.target.value})}
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
              required
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #BDB395",
                fontSize: "13px",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                cursor: "pointer"
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Part Number (ID)"
              required
              value={newItem.partNumber}
              onChange={(e) => setNewItem({...newItem, partNumber: e.target.value})}
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
              type="number"
              placeholder="Quantity"
              required
              min="0"
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: e.target.value ? parseInt(e.target.value) : ""})}
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
              type="number"
              placeholder="Price"
              required
              min="0"
              step="0.01"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value ? parseFloat(e.target.value) : ""})}
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
              placeholder="Supplier"
              required
              value={newItem.supplier}
              onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
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
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#8B6F47",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Add Item
            </button>
          </form>
        )}

        <input
          type="text"
          placeholder="Search by part name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "12px",
            border: "1px solid #BDB395",
            width: "100%",
            marginBottom: "10px",
            fontSize: "14px",
            outline: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            flexShrink: 0,
            boxSizing: "border-box"
          }}
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "12px",
            border: "1px solid #BDB395",
            width: "100%",
            marginBottom: "15px",
            fontSize: "14px",
            outline: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
            cursor: "pointer",
            flexShrink: 0,
            boxSizing: "border-box"
          }}
        >
          <option value="">Sort by Price</option>
          <option value="highToLow">Price: High to Low</option>
          <option value="lowToHigh">Price: Low to High</option>
        </select>

        <div style={{ 
          flex: 1, 
          overflowY: "auto",
          paddingRight: "5px"
        }}>
          {filteredAndSortedItems.map(item => (
            <div
              key={item._id}
              onClick={() => setSelectedItem(selectedItem?._id === item._id ? null : item)}
              style={{
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "12px",
                backgroundColor: selectedItem?._id === item._id ? "#D4A373" : "#F2E2B1",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: selectedItem?._id === item._id ? "2px solid #8B6F47" : "2px solid transparent"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "15px", color: "#000" }}>
                    {item.partName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    ID: {item.partNumber} | Stock: {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: "bold", fontSize: "15px", color: selectedItem?._id === item._id ? "#fff" : "#8B6F47" }}>
                  ₱{item.price.toFixed(2)}
                </div>
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
              Are you sure you want to delete <strong>{selectedItem?.partName}</strong>? This action cannot be undone.
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
                onClick={handleDeleteItem}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;