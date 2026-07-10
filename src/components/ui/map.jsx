import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

// A lightweight wrapper to load maplibre-gl dynamically to avoid npm install constraints
export const Map = forwardRef(({ styles, initialViewState, children, className, onLoad }, ref) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Inject MapLibre GL JS & CSS
    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }

    if (!window.maplibregl && !document.getElementById('maplibre-js')) {
      const script = document.createElement('script');
      script.id = 'maplibre-js';
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else if (window.maplibregl) {
      initMap();
    }

    function initMap() {
      if (mapInstanceRef.current || !containerRef.current) return;

      const map = new window.maplibregl.Map({
        container: containerRef.current,
        style: styles?.light || styles || 'https://tiles.openfreemap.org/styles/bright',
        center: [initialViewState?.longitude || 0, initialViewState?.latitude || 0],
        zoom: initialViewState?.zoom || 1,
        attributionControl: false,
      });

      map.addControl(new window.maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.addControl(new window.maplibregl.FullscreenControl(), 'top-right');

      mapInstanceRef.current = map;
      
      map.on('load', () => {
        setMapLoaded(true);
        if (onLoad) onLoad(map);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRef.current,
  }));

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className || ''}`}>
      {mapLoaded && React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { map: mapInstanceRef.current });
        }
        return child;
      })}
    </div>
  );
});

Map.displayName = 'Map';
