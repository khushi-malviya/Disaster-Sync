import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function IncidentMap({ incidents }) {
  const defaultPosition = [20.5937, 78.9629]; // Center of India

  return (
    <div className="mb-6 rounded shadow-lg overflow-hidden">
      <MapContainer center={defaultPosition} zoom={5} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {incidents.map((incident) => (
          <Marker
            key={incident._id}
            position={incident.location.coordinates.reverse()} // [lat, lng]
          >
            <Popup>
              <strong>{incident.title}</strong><br />
              {incident.description}<br />
              Severity: {incident.severity}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
