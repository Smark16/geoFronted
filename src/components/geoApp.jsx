import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const Geo = () => {
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://geolocation-s28f.onrender.com/ws/socket-server/');
    
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

  useEffect(() => {
    if (socket && lat !== null && long !== null) {
      const coordinates = JSON.stringify({ latitude: lat, longitude: long });
      socket.send(coordinates);
      console.log('Sent coordinates to server:', coordinates);
    }
  }, [lat, long, socket]);

  const handleGeo = () => {
    if (!navigator.geolocation) {
      console.log("Browser doesn't support Geolocation API");
    } else {
      setInterval(() => {
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
      }, 5000);

      // Clear interval when the component unmounts or when you want to stop tracking
    //   return () => clearInterval(geoInterval);
    }
  };

  console.log('cordinates are:', {lat, long})

  // Fix for default icon issue in Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
  
  // Handle resizing of the map
  useEffect(() => {
    if (lat !== null && long !== null) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 1000);
    }
  }, [lat, long]);

  return (
    <div>
      <button onClick={handleGeo}>Get Location</button>
      <h1>Coordinates</h1>
      {lat !== null && <p>Latitude: {lat}</p>}
      {long !== null && <p>Longitude: {long}</p>}
      {lat !== null && long !== null && (
        <MapContainer
          center={[lat, long]}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
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
          <Circle
            center={[lat, long]}
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
