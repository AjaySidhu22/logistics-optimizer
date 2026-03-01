// E:\logistics-optimizer\client\src\components\MapView.jsx

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icons
const createIcon = (color, label) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:28px;height:28px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
    "><span style="
      transform:rotate(45deg);
      color:white;font-size:11px;
      font-weight:bold;
      display:block;text-align:center;line-height:24px;
    ">${label}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });

const vehicleIcon = L.divIcon({
  className: "",
  html: `<div style="
    background:#22c55e;
    width:36px;height:36px;
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.5);
    display:flex;align-items:center;justify-content:center;
    font-size:18px;
  ">🚚</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const priorityColors = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  const [isAdding, setIsAdding] = useState(false);

  useMapEvents({
    click(e) {
      if (isAdding) return;
      const address = prompt(
        "Enter delivery details:\nFormat: CustomerName, Address\nExample: John Doe, 123 Main Street"
      );
      if (!address) return;

      const parts = address.split(",");
      const customerName = parts[0]?.trim() || "Customer";
      const addr = parts.slice(1).join(",").trim() || "Unknown Address";

      const priority = prompt("Enter priority (high/medium/low):", "medium") || "medium";

      onMapClick({
        customerName,
        address: addr,
        coordinates: {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        },
        priority: ["high", "medium", "low"].includes(priority.toLowerCase())
          ? priority.toLowerCase()
          : "medium",
        status: "pending",
      });
    },
  });
  return null;
}

export default function MapView({
  deliveries,
  optimizedRoute,
  selectedVehicle,
  onMapClick,
}) {
  // Default center - India
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Build route polyline from optimized waypoints
  const routePositions =
    optimizedRoute?.waypoints?.map((wp) => [wp.lat, wp.lng]) || [];

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />

        {/* Vehicle marker */}
        {selectedVehicle && (
          <Marker
            position={[
              selectedVehicle.currentLocation.lat,
              selectedVehicle.currentLocation.lng,
            ]}
            icon={vehicleIcon}
          >
            <Popup>
              <div style={{ minWidth: "140px" }}>
                <strong>🚚 {selectedVehicle.name}</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#666" }}>
                  Driver: {selectedVehicle.driverName || "N/A"}
                </span>
                <br />
                <span style={{ fontSize: "12px", color: "#666" }}>
                  Plate: {selectedVehicle.plateNumber}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Delivery markers */}
        {deliveries.map((delivery, idx) => (
          <Marker
            key={delivery._id}
            position={[delivery.coordinates.lat, delivery.coordinates.lng]}
            icon={createIcon(
              priorityColors[delivery.priority] || "#3b82f6",
              idx + 1
            )}
          >
            <Popup>
              <div style={{ minWidth: "160px" }}>
                <strong>{delivery.customerName}</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {delivery.address}
                </span>
                <br />
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background:
                      delivery.priority === "high"
                        ? "#fee2e2"
                        : delivery.priority === "medium"
                        ? "#fef3c7"
                        : "#dcfce7",
                    color:
                      delivery.priority === "high"
                        ? "#dc2626"
                        : delivery.priority === "medium"
                        ? "#d97706"
                        : "#16a34a",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {delivery.priority}
                </span>
                <br />
                <span style={{ fontSize: "11px", color: "#888", marginTop: "4px", display: "block" }}>
                  Status: {delivery.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Optimized route polyline */}
        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
            dashArray="10, 5"
          />
        )}
      </MapContainer>

      {/* Map instruction */}
      <div className="map-instruction">
        🖱️ Click anywhere on the map to add a delivery point
      </div>
    </div>
  );
}