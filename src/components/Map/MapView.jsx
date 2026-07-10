import React, { useRef, useEffect } from 'react';
import { Map } from '@/components/ui/map';

const conditionColors = {
  Good: '#10b981', // emerald-500
  Moderate: '#f59e0b', // amber-500
  Poor: '#ef4444', // red-500
};

export default function MapView({ reports }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const handleMapLoad = (map) => {
    // Clear existing markers if any
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new window.maplibregl.LatLngBounds();
    let hasValidPoints = false;

    reports.forEach((report) => {
      // Create custom HTML marker element
      const el = document.createElement('div');
      el.className = 'custom-map-marker';
      
      const isPoor = report.condition === 'Poor';
      const color = conditionColors[report.condition] || '#3b82f6';
      
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';

      if (isPoor) {
        // Add pulse effect container
        const pulse = document.createElement('div');
        pulse.className = 'marker-pulse';
        pulse.style.position = 'absolute';
        pulse.style.inset = '-4px';
        pulse.style.borderRadius = '50%';
        pulse.style.backgroundColor = color;
        pulse.style.opacity = '0.5';
        pulse.style.animation = 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
        el.appendChild(pulse);
      }

      // Create Popup
      const popup = new window.maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
        <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">SPOTHOLES</h4>
          <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${report.roadName}</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 12px;">
            <div>
              <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Condition</span>
              <span style="font-weight: 700; color: ${color};">${report.condition}</span>
            </div>
            <div>
              <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Confidence</span>
              <span style="font-weight: 600; color: #334155;">${report.confidence}%</span>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 11px;">
            <div>
              <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Location</span>
              <span style="color: #475569; font-family: monospace;">${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}</span>
            </div>
            <div>
              <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Time</span>
              <span style="color: #475569;">${new Date(report.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          </div>

          <div style="font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
            Device ID: <span style="font-family: monospace;">${report.deviceId}</span>
          </div>
        </div>
      `);

      // Add to map
      const marker = new window.maplibregl.Marker({ element: el })
        .setLngLat([report.longitude, report.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);

      bounds.extend([report.longitude, report.latitude]);
      hasValidPoints = true;
    });

    // Optionally center bounds if there are points
    if (hasValidPoints && reports.length > 0) {
      // we can fitbounds here if requested, but for now we rely on initialViewState for Mumbai
    }
  };

  // Add the pulse keyframes to the document if not present
  useEffect(() => {
    if (!document.getElementById('pulse-keyframes')) {
      const style = document.createElement('style');
      style.id = 'pulse-keyframes';
      style.innerHTML = `
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .maplibregl-popup-content {
          border-radius: 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) !important;
          padding: 12px 16px !important;
          border: 1px solid #e2e8f0 !important;
        }
        .maplibregl-popup-tip {
          border-top-color: #fff !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="rounded-xl overflow-hidden bg-white border border-slate-200 card-shadow h-full w-full relative">
      <Map
        ref={mapRef}
        onLoad={handleMapLoad}
        initialViewState={{
          longitude: 72.8777,
          latitude: 19.0760,
          zoom: 11
        }}
      />
    </div>
  );
}
