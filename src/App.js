import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

function App() {
  const mapContainerRef = useRef(null);
  const [lng, setLng] = useState(-97.7431); 
  const [lat, setLat] = useState(30.2672); 
  const [zoom, setZoom] = useState(12);    

  const setUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLng(position.coords.longitude);
          setLat(position.coords.latitude);
        },
        () => {
          console.log("Permission denied or error, using default location.");
        }
      );
    }
  };

  useEffect(() => {
    setUserLocation();

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11", 
      center: [lng, lat], 
      zoom: zoom,         
    });

    return () => map.remove(); 
  }, [lng, lat]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
}

export default App;
