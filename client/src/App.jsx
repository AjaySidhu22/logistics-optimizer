// E:\logistics-optimizer\client\src\App.jsx

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import RouteInfo from "./components/RouteInfo";
import api from "./services/api";
import "./App.css";

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch deliveries and vehicles on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, vehiclesRes] = await Promise.all([
        api.get("/deliveries"),
        api.get("/vehicles"),
      ]);
      setDeliveries(deliveriesRes.data.data || []);
      setVehicles(vehiclesRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async (delivery) => {
    try {
      const res = await api.post("/deliveries", delivery);
      setDeliveries((prev) => [...prev, res.data.data]);
      toast.success("Delivery point added!");
    } catch (err) {
      toast.error("Failed to add delivery");
    }
  };

  const handleDeleteDelivery = async (id) => {
    try {
      await api.delete(`/deliveries/${id}`);
      setDeliveries((prev) => prev.filter((d) => d._id !== id));
      toast.success("Delivery removed");
    } catch (err) {
      toast.error("Failed to delete delivery");
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete("/deliveries");
      setDeliveries([]);
      setOptimizedRoute(null);
      toast.success("All deliveries cleared");
    } catch (err) {
      toast.error("Failed to clear deliveries");
    }
  };

  const handleAddVehicle = async (vehicle) => {
    try {
      const res = await api.post("/vehicles", vehicle);
      setVehicles((prev) => [...prev, res.data.data]);
      toast.success("Vehicle added!");
    } catch (err) {
      toast.error("Failed to add vehicle");
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      if (selectedVehicle?._id === id) setSelectedVehicle(null);
      toast.success("Vehicle removed");
    } catch (err) {
      toast.error("Failed to delete vehicle");
    }
  };

  const handleOptimizeRoute = async () => {
    if (!selectedVehicle) {
      toast.warning("Please select a vehicle first");
      return;
    }
    if (deliveries.length < 2) {
      toast.warning("Add at least 2 delivery points");
      return;
    }

    try {
      setIsOptimizing(true);
      const deliveryIds = deliveries
        .filter((d) => d.status === "pending")
        .map((d) => d._id);

      const res = await api.post("/optimize", {
        vehicleId: selectedVehicle._id,
        deliveryIds,
      });

      setOptimizedRoute(res.data.data);
      toast.success("Route optimized successfully!");
    } catch (err) {
      toast.error("Failed to optimize route");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleReroute = async (incident) => {
    if (!optimizedRoute) return;
    try {
      toast.info("Re-routing based on incident...");
      await handleOptimizeRoute();
    } catch (err) {
      toast.error("Failed to re-route");
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <span className="header-icon">🚚</span>
          <h1>Logistics Route Optimizer</h1>
        </div>
        <div className="header-right">
          <span className="status-dot"></span>
          <span className="status-text">
            {deliveries.length} stops · {vehicles.length} vehicles
          </span>
        </div>
      </header>

      <div className="app-body">
        <Sidebar
          deliveries={deliveries}
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={setSelectedVehicle}
          onAddDelivery={handleAddDelivery}
          onDeleteDelivery={handleDeleteDelivery}
          onClearAll={handleClearAll}
          onAddVehicle={handleAddVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onOptimize={handleOptimizeRoute}
          isOptimizing={isOptimizing}
          loading={loading}
        />

        <main className="map-container">
          <MapView
            deliveries={deliveries}
            optimizedRoute={optimizedRoute}
            selectedVehicle={selectedVehicle}
            onMapClick={handleAddDelivery}
          />
        </main>

        {optimizedRoute && (
          <RouteInfo
            route={optimizedRoute}
            onReroute={handleReroute}
            onClose={() => setOptimizedRoute(null)}
          />
        )}
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;