import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const API_KEY = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY'

const Geo = () => {
  const [lat, setLat] = useState(localStorage.getItem('latitude') || '');
  const [long, setLong] = useState(localStorage.getItem('longitude') || '');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('ws://geolocation-s28f.onrender.com/ws/socket-server/');
    
    ws.onopen = () => {
      console.log('WebSocket connection opened');
      setSocket(ws);
    };

    
    ws.onclose = function(e) {
      console.log('WebSocket connection closed');
    };

    ws.onmessage = (event) => {
      // Handle incoming messages from the server
      const data = JSON.parse(event.data);
      console.log('Received data from server:', data);
      if (data.latitude && data.longitude) {
        setLat(data.latitude);
        setLong(data.longitude);
      }
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);


  useEffect(() => {
    localStorage.setItem('latitude', lat);
    localStorage.setItem('longitude', long);

    // Send coordinates to the server whenever they change
    if (socket && lat && long) {
      const coordinates = JSON.stringify({ latitude: lat, longitude: long });
      socket.send(coordinates);
      console.log('Sent coordinates to server:', coordinates);
    }
  }, [lat, long, socket]);

  const handleGeo = () => {
    if (!navigator.geolocation) {
      console.log("Browser doesn't support Geolocation API");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position)
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLong(longitude);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  };


  // Fix for default icon issue in Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  return (
    <div>
      <button onClick={handleGeo}>Get Location</button>
      <h1>Coordinates</h1>
      {lat && <p>Latitude: {lat}</p>}
      {long && <p>Longitude: {long}</p>}
      {lat && long && (
        <MapContainer center={[lat, long]} zoom={18
          
        } style={{ height: "400px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[lat, long]}>
            <Popup>You are here</Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
};

export default Geo;
