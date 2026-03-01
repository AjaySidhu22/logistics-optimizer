// E:\logistics-optimizer\client\src\components\Sidebar.jsx

import { useState } from "react";

export default function Sidebar({
  deliveries,
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  onAddDelivery,
  onDeleteDelivery,
  onClearAll,
  onAddVehicle,
  onOptimize,
  isOptimizing,
  loading,
}) {
  const [activeTab, setActiveTab] = useState("deliveries");
  const [showAddDelivery, setShowAddDelivery] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState({
    customerName: "",
    address: "",
    lat: "",
    lng: "",
    priority: "medium",
    packageWeight: 1,
    notes: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    plateNumber: "",
    capacity: 100,
    driverName: "",
    speed: 40,
    currentLocation: { lat: 28.6139, lng: 77.209 },
  });

  const handleDeliverySubmit = () => {
    if (!deliveryForm.customerName || !deliveryForm.address || !deliveryForm.lat || !deliveryForm.lng) {
      alert("Please fill all required fields");
      return;
    }
    onAddDelivery({
      customerName: deliveryForm.customerName,
      address: deliveryForm.address,
      coordinates: {
        lat: parseFloat(deliveryForm.lat),
        lng: parseFloat(deliveryForm.lng),
      },
      priority: deliveryForm.priority,
      packageWeight: parseFloat(deliveryForm.packageWeight),
      notes: deliveryForm.notes,
      status: "pending",
    });
    setDeliveryForm({
      customerName: "",
      address: "",
      lat: "",
      lng: "",
      priority: "medium",
      packageWeight: 1,
      notes: "",
    });
    setShowAddDelivery(false);
  };

  const handleVehicleSubmit = () => {
    if (!vehicleForm.name || !vehicleForm.plateNumber) {
      alert("Please fill all required fields");
      return;
    }
    onAddVehicle(vehicleForm);
    setVehicleForm({
      name: "",
      plateNumber: "",
      capacity: 100,
      driverName: "",
      speed: 40,
      currentLocation: { lat: 28.6139, lng: 77.209 },
    });
    setShowAddVehicle(false);
  };

  return (
    <div className="sidebar">
      {/* Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`tab-btn ${activeTab === "deliveries" ? "active" : ""}`}
          onClick={() => setActiveTab("deliveries")}
        >
          📦 Deliveries
        </button>
        <button
          className={`tab-btn ${activeTab === "vehicles" ? "active" : ""}`}
          onClick={() => setActiveTab("vehicles")}
        >
          🚚 Vehicles
        </button>
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div> Loading...
          </div>
        ) : activeTab === "deliveries" ? (
          <>
            <div className="section-title">
              Delivery Points ({deliveries.length})
            </div>

            {deliveries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📍</div>
                <p>No delivery points yet</p>
                <p style={{ marginTop: "4px", fontSize: "11px" }}>
                  Click on the map or use the form below
                </p>
              </div>
            ) : (
              deliveries.map((delivery) => (
                <div key={delivery._id} className="delivery-item">
                  <div className="delivery-info">
                    <div className="delivery-name">{delivery.customerName}</div>
                    <div className="delivery-address">{delivery.address}</div>
                    <div className="delivery-meta">
                      <span className={`priority-badge priority-${delivery.priority}`}>
                        {delivery.priority}
                      </span>
                      <span style={{ fontSize: "10px", color: "#475569" }}>
                        {delivery.coordinates.lat.toFixed(3)}, {delivery.coordinates.lng.toFixed(3)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn-danger"
                    onClick={() => onDeleteDelivery(delivery._id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}

            {/* Add Delivery Form */}
            {showAddDelivery && (
              <div
                style={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  padding: "12px",
                  marginTop: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#94a3b8",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  Add Delivery
                </div>
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    value={deliveryForm.customerName}
                    onChange={(e) =>
                      setDeliveryForm({ ...deliveryForm, customerName: e.target.value })
                    }
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    value={deliveryForm.address}
                    onChange={(e) =>
                      setDeliveryForm({ ...deliveryForm, address: e.target.value })
                    }
                    placeholder="e.g. 123 Main Street, Delhi"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div className="form-group">
                    <label>Latitude *</label>
                    <input
                      type="number"
                      value={deliveryForm.lat}
                      onChange={(e) =>
                        setDeliveryForm({ ...deliveryForm, lat: e.target.value })
                      }
                      placeholder="28.6139"
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude *</label>
                    <input
                      type="number"
                      value={deliveryForm.lng}
                      onChange={(e) =>
                        setDeliveryForm({ ...deliveryForm, lng: e.target.value })
                      }
                      placeholder="77.2090"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={deliveryForm.priority}
                    onChange={(e) =>
                      setDeliveryForm({ ...deliveryForm, priority: e.target.value })
                    }
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Package Weight (kg)</label>
                  <input
                    type="number"
                    value={deliveryForm.packageWeight}
                    onChange={(e) =>
                      setDeliveryForm({ ...deliveryForm, packageWeight: e.target.value })
                    }
                  />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-primary" onClick={handleDeliverySubmit}>
                    Add
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ marginTop: "0" }}
                    onClick={() => setShowAddDelivery(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="section-title">Vehicles ({vehicles.length})</div>

            {vehicles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🚚</div>
                <p>No vehicles yet</p>
                <p style={{ marginTop: "4px", fontSize: "11px" }}>
                  Add a vehicle to get started
                </p>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className={`vehicle-item ${selectedVehicle?._id === vehicle._id ? "selected" : ""}`}
                  onClick={() => onSelectVehicle(vehicle)}
                >
                  <div className="vehicle-name">
                    🚚 {vehicle.name}
                    {selectedVehicle?._id === vehicle._id && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#3b82f6",
                          marginLeft: "6px",
                          fontWeight: "600",
                        }}
                      >
                        SELECTED
                      </span>
                    )}
                  </div>
                  <div className="vehicle-details">
                    Plate: {vehicle.plateNumber} · Speed: {vehicle.speed} km/h
                  </div>
                  <div className="vehicle-details">
                    Driver: {vehicle.driverName || "N/A"} · Capacity: {vehicle.capacity} kg
                  </div>
                </div>
              ))
            )}

            {/* Add Vehicle Form */}
            {showAddVehicle && (
              <div
                style={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  padding: "12px",
                  marginTop: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#94a3b8",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  Add Vehicle
                </div>
                <div className="form-group">
                  <label>Vehicle Name *</label>
                  <input
                    value={vehicleForm.name}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, name: e.target.value })
                    }
                    placeholder="e.g. Truck 01"
                  />
                </div>
                <div className="form-group">
                  <label>Plate Number *</label>
                  <input
                    value={vehicleForm.plateNumber}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })
                    }
                    placeholder="e.g. DL-01-AB-1234"
                  />
                </div>
                <div className="form-group">
                  <label>Driver Name</label>
                  <input
                    value={vehicleForm.driverName}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, driverName: e.target.value })
                    }
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <div className="form-group">
                    <label>Capacity (kg)</label>
                    <input
                      type="number"
                      value={vehicleForm.capacity}
                      onChange={(e) =>
                        setVehicleForm({ ...vehicleForm, capacity: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Speed (km/h)</label>
                    <input
                      type="number"
                      value={vehicleForm.speed}
                      onChange={(e) =>
                        setVehicleForm({ ...vehicleForm, speed: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-primary" onClick={handleVehicleSubmit}>
                    Add
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ marginTop: "0" }}
                    onClick={() => setShowAddVehicle(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {activeTab === "deliveries" ? (
          <>
            <button
              className="btn-primary"
              onClick={() => setShowAddDelivery(!showAddDelivery)}
            >
              + Add Delivery Point
            </button>
            <button
              className="btn-success"
              onClick={onOptimize}
              disabled={isOptimizing || deliveries.length < 2 || !selectedVehicle}
            >
              {isOptimizing ? (
                <>
                  <div className="spinner"></div> Optimizing...
                </>
              ) : (
                "⚡ Optimize Route"
              )}
            </button>
            {deliveries.length > 0 && (
              <button className="btn-secondary" onClick={onClearAll}>
                🗑️ Clear All Deliveries
              </button>
            )}
          </>
        ) : (
          <button
            className="btn-primary"
            onClick={() => setShowAddVehicle(!showAddVehicle)}
          >
            + Add Vehicle
          </button>
        )}
      </div>
    </div>
  );
}