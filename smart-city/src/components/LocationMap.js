// src/components/LocationMap.js
// Această componentă este utilizată pentru afișarea și selectarea locațiilor pe hartă
// Verificați dacă acest fișier există și are implementarea corectă

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Corectăm iconițele Leaflet care nu se încarcă corect în React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const LocationMapContent = ({ location, onLocationUpdate }) => {
  const [position, setPosition] = useState(location || null);
  
  // Event handler pentru click pe hartă
  useMapEvents({
    click: (e) => {
      const newLocation = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      setPosition(newLocation);
      if (onLocationUpdate) {
        onLocationUpdate(newLocation);
      }
    }
  });
  
  // Dacă primim o locație nouă prin props, actualizăm poziția
  useEffect(() => {
    if (location && (!position || position.lat !== location.lat || position.lng !== location.lng)) {
      setPosition(location);
    }
  }, [location]);
  
  return position ? <Marker position={[position.lat, position.lng]} /> : null;
};

const LocationMap = ({ location, onLocationUpdate }) => {
  // Poziția inițială - centrată pe România dacă nu este specificată o locație
  const initialPosition = location 
    ? [location.lat, location.lng] 
    : [45.9443, 25.0094]; // Centrul României
  
  const mapRef = useRef(null);
  
  // Actualizăm vizualizarea hărții când se schimbă locația
  useEffect(() => {
    if (mapRef.current && location) {
      mapRef.current.setView([location.lat, location.lng], 13);
    }
  }, [location]);
  
  return (
    <MapContainer 
      center={initialPosition} 
      zoom={location ? 13 : 6} 
      style={{ height: '100%', width: '100%' }}
      whenCreated={map => { mapRef.current = map; }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMapContent location={location} onLocationUpdate={onLocationUpdate} />
    </MapContainer>
  );
};

export default LocationMap;