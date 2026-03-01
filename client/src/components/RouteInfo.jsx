// E:\logistics-optimizer\client\src\components\RouteInfo.jsx

import { useState } from "react";

export default function RouteInfo({ route, onReroute, onClose }) {
  const [incident, setIncident] = useState("");
  const [showRerouteForm, setShowRerouteForm] = useState(false);

  const handleReroute = () => {
    if (!incident.trim()) {
      alert("Please describe the incident");
      return;
    }
    onReroute(incident);
    setIncident("");
    setShowRerouteForm(false);
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="route-info-panel">
      {/* Header */}
      <div className="route-info-header">
        <h3>🗺️ Optimized Route</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Stats */}
      <div className="route-stats">
        <div className="stat-card">
          <div className="stat-value">{route.totalDistance} km</div>
          <div className="stat-label">Total Distance</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(route.totalTime)}</div>
          <div className="stat-label">Est. Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{route.optimizedSequence?.length || 0}</div>
          <div className="stat-label">Total Stops</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {route.totalDistance > 0 && route.optimizedSequence?.length > 0
              ? (route.totalDistance / route.optimizedSequence.length).toFixed(1)
              : 0} km
          </div>
          <div className="stat-label">Avg per Stop</div>
        </div>
      </div>

      {/* AI Suggestion */}
      {route.aiSuggestion && (
        <div className="ai-suggestion">
          <div className="ai-suggestion-title">🤖 AI Traffic Analysis</div>
          <div className="ai-suggestion-text">{route.aiSuggestion}</div>
        </div>
      )}

      {/* Stop sequence */}
      <div className="route-stops">
        <div
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "10px",
          }}
        >
          Stop Sequence
        </div>

        {/* Start point */}
        <div className="stop-item">
          <div
            className="stop-number"
            style={{ background: "#22c55e" }}
          >
            S
          </div>
          <div className="stop-details">
            <div className="stop-address">🚚 Vehicle Start Location</div>
            <div className="stop-eta">Departure point</div>
          </div>
        </div>

        {/* Delivery stops */}
        {route.optimizedSequence?.map((stop, idx) => (
          <div key={idx} className="stop-item">
            <div className="stop-number">{idx + 1}</div>
            <div className="stop-details">
              <div className="stop-address">
                {stop.delivery?.customerName || "Customer"}
              </div>
              <div className="stop-address" style={{ color: "#64748b", fontSize: "11px" }}>
                {stop.delivery?.address || ""}
              </div>
              <div className="stop-eta">
                ETA: {stop.estimatedArrival} · {stop.distanceFromPrev} km from prev
              </div>
            </div>
            <span
              className={`priority-badge priority-${stop.delivery?.priority}`}
              style={{ flexShrink: 0, marginTop: "2px" }}
            >
              {stop.delivery?.priority}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="route-actions">
        {!showRerouteForm ? (
          <button
            className="btn-primary"
            onClick={() => setShowRerouteForm(true)}
          >
            🔄 Report Incident & Re-route
          </button>
        ) : (
          <div>
            <div className="form-group">
              <label>Describe the incident</label>
              <input
                value={incident}
                onChange={(e) => setIncident(e.target.value)}
                placeholder="e.g. Road blocked on NH-48"
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-primary" onClick={handleReroute}>
                Re-route Now
              </button>
              <button
                className="btn-secondary"
                style={{ marginTop: "0" }}
                onClick={() => setShowRerouteForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}