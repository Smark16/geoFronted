import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'; // Import Circle from react-leaflet
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const Geo = () => {
  const [lat, setLat] = useState(localStorage.getItem('latitude') || '');
  const [long, setLong] = useState(localStorage.getItem('longitude') || '');
  const [socket, setSocket] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('wss://geolocation-s28f.onrender.com/ws/socket-server/');
    
    ws.onopen = () => {
      console.log('WebSocket connection opened');
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onmessage = (event) => {
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

  // Store coordinates in local storage and send to server
  useEffect(() => {
    localStorage.setItem('latitude', lat);
    localStorage.setItem('longitude', long);

    if (socket && lat && long) {
      const coordinates = JSON.stringify({ latitude: lat, longitude: long });
      socket.send(coordinates);
      console.log('Sent coordinates to server:', coordinates);
    }
  }, [lat, long, socket]);

  // Get current location
  const handleGeo = () => {
    if (!navigator.geolocation) {
      console.log("Browser doesn't support Geolocation API");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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

  // Handle resizing of the map
  useEffect(() => {
    if (lat && long) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 1000);
    }
  }, [lat, long]);

  return (
    <div>
      <button onClick={handleGeo}>Get Location</button>
      <h1>Coordinates</h1>
      {lat && <p>Latitude: {lat}</p>}
      {long && <p>Longitude: {long}</p>}
      {lat && long && (
        <MapContainer
          center={[lat, long]}
          zoom={13} // Adjusted to match the example
          style={{ height: "400px", width: "100%" }} // Match the style of the example
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[lat, long]}>
            <Popup>
              <b>Hello world!</b><br />You are here.
            </Popup>
          </Marker>
          <Marker position={[51.5, -0.09]}>
            <Popup>
              I am a marker at a fixed position.
            </Popup>
          </Marker>
          <Circle
            center={[51.508, -0.11]} 
            radius={500} 
            color="red" 
            fillColor="#f03" 
            fillOpacity={0.5}
          >
            <Popup>
              I am a circle.
            </Popup>
          </Circle>
        </MapContainer>
      )}
    </div>
  );
};

export default Geo;
