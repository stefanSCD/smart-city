// src/components/LocationMap.js
import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fixează iconițele care lipsesc în Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMap = ({ location, onLocationUpdate }) => {
  useEffect(() => {
    if (!location) return;

    // Inițializează harta
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Verifică dacă există deja o instanță a hărții
    if (mapContainer._leaflet_id) {
      // Harta există deja, curăț-o
      mapContainer._leaflet = null;
      mapContainer.innerHTML = '';
    }

    const map = L.map('map').setView([location.lat, location.lng], 15);

    // Adaugă layer-ul de tile-uri (harta de bază)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Adaugă marker draggable la locația curentă
    const marker = L.marker([location.lat, location.lng], { draggable: true }).addTo(map);

    // Actualizează coordonatele când markerul este tras
    marker.on('dragend', function(e) {
      const position = marker.getLatLng();
      if (onLocationUpdate) {
        onLocationUpdate({
          lat: position.lat,
          lng: position.lng
        });
      }
    });

    // De asemenea, permite actualizarea locației prin clic pe hartă
    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      if (onLocationUpdate) {
        onLocationUpdate({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    });

    // Curăță la dezasamblare
    return () => {
      map.remove();
    };
  }, [location, onLocationUpdate]);

  return <div id="map" style={{ height: '100%', width: '100%' }}></div>;
};

export default LocationMap;