import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

// A lightweight wrapper to load maplibre-gl dynamically to avoid npm install constraints
export const Map = forwardRef(({ styles, initialViewState, children, className, onLoad }, ref) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Inject MapLibre GL JS & CSS
    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }

    function initMap() {
      if (cancelled || mapInstanceRef.current || !containerRef.current || !window.maplibregl) return;

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

      resizeObserverRef.current = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserverRef.current.observe(containerRef.current);

      map.on('load', () => {
        map.resize();
        setMapLoaded(true);
        map.once('idle', () => {
          map.resize();
          if (onLoad) onLoad(map);
        });
      });
    }

    let scriptToListen = null;

    if (!window.maplibregl && !document.getElementById('maplibre-js')) {
      const script = document.createElement('script');
      script.id = 'maplibre-js';
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else if (window.maplibregl) {
      initMap();
    } else {
      scriptToListen = document.getElementById('maplibre-js');
      if (scriptToListen) {
        scriptToListen.addEventListener('load', initMap);
      }
    }

    return () => {
      cancelled = true;
      if (scriptToListen) {
        scriptToListen.removeEventListener('load', initMap);
      }
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
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
