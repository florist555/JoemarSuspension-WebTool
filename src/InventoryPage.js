import React, { useState, useEffect } from "react";

const InventoryPage = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    partName: "",
    partNumber: "",
    quantity: 0,
    price: 0,
    supplier: "",
    minStockLevel: 5,
    category: "Other",
    description: ""
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');
      const data = await response.json();
      setInventoryItems(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
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
    }
  };

  const addNewItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem)
      });
      
      const addedItem = await response.json();
      setInventoryItems([addedItem, ...inventoryItems]);
      setShowAddForm(false);
      setNewItem({
        partName: "",
        partNumber: "",
        quantity: 0,
        price: 0,
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
      item.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
            flex: 1
          }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                Part Name
              </label>
              <input
                type="text"
                value={selectedItem.partName}
                onChange={(e) => setSelectedItem({...selectedItem, partName: e.target.value})}
                onBlur={() => updateItem(selectedItem._id, { partName: selectedItem.partName })}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #BDB395",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "600", color: "#555", fontSize: "13px", display: "block", marginBottom: "5px" }}>
                Price (₱)
              </label>
              <input
                type="number"
                value={selectedItem.price}
                onChange={(e) => setSelectedItem({...selectedItem, price: parseFloat(e.target.value)})}
                onBlur={() => updateItem(selectedItem._id, { price: selectedItem.price })}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #BDB395",
                  fontSize: "14px",
                  outline: "none"
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
                onBlur={() => updateItem(selectedItem._id, { supplier: selectedItem.supplier })}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #BDB395",
                  fontSize: "14px",
                  outline: "none"
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
                  color: "#888"
                }}
              />
            </div>

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
                  color: "#888"
                }}
              />
            </div>

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
                  color: "#888"
                }}
              />
            </div>

            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#F2E2B1", borderRadius: "10px" }}>
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

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            backgroundColor: "#D4A373",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            flexShrink: 0
          }}
        >
          {showAddForm ? "Cancel" : "+ Add New Item"}
        </button>

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
                fontSize: "13px"
              }}
            />
            
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
                fontSize: "13px"
              }}
            />
            
            <input
              type="number"
              placeholder="Quantity"
              required
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #BDB395",
                fontSize: "13px"
              }}
            />
            
            <input
              type="number"
              placeholder="Price"
              required
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #BDB395",
                fontSize: "13px"
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
                fontSize: "13px"
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
            flexShrink: 0
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
            flexShrink: 0
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
              onClick={() => setSelectedItem(item)}
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
    </div>
  );
};

export default InventoryPage;