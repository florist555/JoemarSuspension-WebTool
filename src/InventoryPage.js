import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const InventoryPage = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState("");
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
      setSelectedItem(prev => ({...prev, ...updates}));
      
      const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      const updatedItem = await response.json();
      
      setInventoryItems(items =>
        items.map(item =>
          item._id === id ? updatedItem : item
        )
      );
      
      setSelectedItem(updatedItem);
    } catch (error) {
      console.error('Error updating item:', error);
      fetchInventory();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error saving changes. Please try again.',
        confirmButtonColor: '#d9534f'
      });
    }
  };

  const handleQuantityDoubleClick = () => {
    setIsEditingQuantity(true);
    setTempQuantity(selectedItem.quantity.toString());
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setTempQuantity(value);
    }
  };

  const handleQuantityBlur = () => {
    const newQuantity = parseInt(tempQuantity);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      updateItem(selectedItem._id, { quantity: newQuantity });
    }
    setIsEditingQuantity(false);
  };

  const handleQuantityKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleQuantityBlur();
    } else if (e.key === 'Escape') {
      setIsEditingQuantity(false);
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
    Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Changes saved successfully!',
      confirmButtonColor: '#5cb85c'
    });
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error adding item: ${errorData.message || 'Unknown error'}`,
          confirmButtonColor: '#d9534f'
        });
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
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Item added successfully!',
        confirmButtonColor: '#5cb85c'
      });
    } catch (error) {
      console.error('Error adding item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error adding item. Make sure Part Number is unique.',
        confirmButtonColor: '#d9534f'
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `Do you want to delete <strong>${selectedItem.partName}</strong>?<br/>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d9534f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/inventory/${selectedItem._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setInventoryItems(inventoryItems.filter(item => item._id !== selectedItem._id));
          setSelectedItem(null);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Item has been deleted successfully.',
            confirmButtonColor: '#5cb85c'
          });
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error deleting item. Please try again.',
          confirmButtonColor: '#d9534f'
        });
      }
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
          Edit Item
        </h2>

        {selectedItem ? (
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
                  Part Name
                </label>
                <input
                  type="text"
                  value={selectedItem.partName}
                  onChange={(e) => setSelectedItem({...selectedItem, partName: e.target.value})}
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
                  Category
                </label>
                <select
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #8B8B8B",
                    fontSize: "13px",
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

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  Price (₱)
                </label>
                <input
                  type="number"
                  value={selectedItem.price}
                  onChange={(e) => setSelectedItem({...selectedItem, price: parseFloat(e.target.value)})}
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
                  Supplier
                </label>
                <input
                  type="text"
                  value={selectedItem.supplier}
                  onChange={(e) => setSelectedItem({...selectedItem, supplier: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  ID Number
                </label>
                <input
                  type="text"
                  value={selectedItem.partNumber}
                  disabled
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #BDB395",
                    fontSize: "13px",
                    backgroundColor: "#f5f5f5",
                    color: "#888",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {selectedItem.createdAt && (
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    Date Created
                  </label>
                  <input
                    type="text"
                    value={formatDate(selectedItem.createdAt)}
                    disabled
                    style={{
                      width: "100%",
                      padding: "6px",
                      borderRadius: "8px",
                      border: "1px solid #BDB395",
                      fontSize: "13px",
                      backgroundColor: "#f5f5f5",
                      color: "#888",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              )}

              {selectedItem.updatedAt && (
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontWeight: "600", color: "#555", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    Date Modified
                  </label>
                  <input
                    type="text"
                    value={formatDate(selectedItem.updatedAt)}
                    disabled
                    style={{
                      width: "100%",
                      padding: "6px",
                      borderRadius: "8px",
                      border: "1px solid #BDB395",
                      fontSize: "13px",
                      backgroundColor: "#f5f5f5",
                      color: "#888",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              )}

              <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#A9A9A9", borderRadius: "10px", marginBottom: "8px" }}>
                <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "10px", textAlign: "center" }}>
                  Current Stock
                </label>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
                  <button
                    onClick={() => updateItem(selectedItem._id, { quantity: selectedItem.quantity - 1 })}
                    disabled={selectedItem.quantity <= 0}
                    style={{
                      backgroundColor: "#BDB395",
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
                  {isEditingQuantity ? (
                    <input
                      type="text"
                      value={tempQuantity}
                      onChange={handleQuantityChange}
                      onBlur={handleQuantityBlur}
                      onKeyDown={handleQuantityKeyDown}
                      autoFocus
                      style={{
                        fontWeight: "bold",
                        fontSize: "28px",
                        width: "70px",
                        textAlign: "center",
                        border: "2px solid #BDB395",
                        borderRadius: "8px",
                        padding: "5px",
                        outline: "none"
                      }}
                    />
                  ) : (
                    <span 
                      onDoubleClick={handleQuantityDoubleClick}
                      style={{ 
                        fontWeight: "bold", 
                        fontSize: "28px", 
                        minWidth: "70px", 
                        textAlign: "center",
                        color: selectedItem.quantity <= selectedItem.minStockLevel ? "#d32f2f" : "#000",
                        cursor: "pointer",
                        userSelect: "none"
                      }}
                      title="Double-click to edit"
                    >
                      {selectedItem.quantity}
                    </span>
                  )}
                  <button
                    onClick={() => updateItem(selectedItem._id, { quantity: selectedItem.quantity + 1 })}
                    style={{
                      backgroundColor: "#BDB395",
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

            <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexShrink: 0 }}>
              <button
                onClick={handleSaveChanges}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#5cb85c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Save Changes
              </button>
              <button
                onClick={handleDeleteItem}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
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
          Inventory
        </h1>

        <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexShrink: 0 }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#D4A373",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
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
              onClick={(e) => {
                e.preventDefault();
                addNewItem(e);
              }}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#8B7355",
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
          </div>
        )}

        <input
          type="text"
          placeholder="Search by part name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 10px",
            borderRadius: "12px",
            border: "1px solid #BDB395",
            width: "100%",
            marginBottom: "10px",
            fontSize: "13px",
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
            padding: "8px 10px",
            borderRadius: "12px",
            border: "1px solid #BDB395",
            width: "100%",
            marginBottom: "10px",
            fontSize: "13px",
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
          paddingRight: "5px",
          marginBottom: "10px",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
        className="hide-scrollbar"
        >
          {filteredAndSortedItems.map(item => (
            <div
              key={item._id}
              onClick={() => setSelectedItem(selectedItem?._id === item._id ? null : item)}
              style={{
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "12px",
                backgroundColor: selectedItem?._id === item._id ? "#BDB395" : "#A9A9A9",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: selectedItem?._id === item._id ? "2px solid #8B7355" : "2px solid transparent"
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
                <div style={{ fontWeight: "bold", fontSize: "15px", color: selectedItem?._id === item._id ? "#333" : "#333" }}>
                  ₱{item.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
};

export default InventoryPage;