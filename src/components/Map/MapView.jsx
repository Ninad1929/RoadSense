import React, { useRef, useEffect, useCallback } from 'react';
import { Map as MapCanvas } from '@/components/ui/map';
import { formatReportTimestamp } from '../../utils/roadReport';

const conditionColors = {
  Good: '#10b981',
  Moderate: '#f59e0b',
  Poor: '#ef4444',
};

function buildPopupHtml(report, latitude, longitude) {
  const color = conditionColors[report.condition] || '#3b82f6';

  return `
    <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 200px;">
      <h4 style="margin: 0 0 8px 0; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">RoadSense</h4>
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
          <span style="color: #475569; font-family: monospace;">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</span>
        </div>
        <div>
          <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Time</span>
          <span style="color: #475569;">${formatReportTimestamp(report.timestamp)}</span>
        </div>
      </div>

      <div style="font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
        Device ID: <span style="font-family: monospace;">${report.deviceId}</span>
      </div>
    </div>
  `;
}

function createMarkerElement(report, isNew) {
  const el = document.createElement('div');
  el.className = isNew ? 'custom-map-marker marker-appear' : 'custom-map-marker';

  const isPoor = report.condition === 'Poor';
  const color = conditionColors[report.condition] || '#3b82f6';

  const dot = document.createElement('div');
  dot.style.width = '16px';
  dot.style.height = '16px';
  dot.style.borderRadius = '50%';
  dot.style.backgroundColor = color;
  dot.style.border = '2px solid white';
  dot.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  dot.style.cursor = 'pointer';
  el.appendChild(dot);

  if (isPoor) {
    const pulse = document.createElement('div');
    pulse.className = 'marker-pulse';
    pulse.style.position = 'absolute';
    pulse.style.inset = '-4px';
    pulse.style.borderRadius = '50%';
    pulse.style.backgroundColor = color;
    pulse.style.opacity = '0.5';
    pulse.style.animation = 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
    el.style.position = 'relative';
    el.style.width = '16px';
    el.style.height = '16px';
    el.insertBefore(pulse, dot);
  }

  return el;
}

function refreshMarkerPositions(markers) {
  markers.forEach((marker) => {
    const { lng, lat } = marker.getLngLat();
    marker.setLngLat([lng, lat]);
  });
}

export default function MapView({ reports }) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());

  const syncMarkers = useCallback((map, reportList) => {
    map.resize();

    const activeIds = new Set(reportList.map((r) => r.id));

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    reportList.forEach((report) => {
      const { latitude, longitude } = report;
      if (latitude == null || longitude == null) return;

      const lngLat = [longitude, latitude];
      const existing = markersRef.current.get(report.id);

      if (existing) {
        existing.setLngLat(lngLat);
        return;
      }

      const el = createMarkerElement(report, true);
      const popup = new window.maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(
        buildPopupHtml(report, latitude, longitude)
      );

      const marker = new window.maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.set(report.id, marker);
    });

    refreshMarkerPositions(markersRef.current);
  }, []);

  const handleMapLoad = useCallback(
    (map) => {
      mapInstanceRef.current = map;
      syncMarkers(map, reports);
    },
    [reports, syncMarkers]
  );

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    syncMarkers(mapInstanceRef.current, reports);
  }, [reports, syncMarkers]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      const map = mapInstanceRef.current;
      if (!map) return;
      map.resize();
      refreshMarkerPositions(markersRef.current);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (document.getElementById('pulse-keyframes')) return;

    const style = document.createElement('style');
    style.id = 'pulse-keyframes';
    style.innerHTML = `
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 0.8; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      @keyframes marker-appear {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .custom-map-marker {
        width: 16px;
        height: 16px;
      }
      .marker-appear { animation: marker-appear 0.4s ease-out forwards; }
      .maplibregl-marker {
        will-change: transform;
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
  }, []);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden bg-white border border-[#E2E8F0] card-shadow h-full w-full relative"
    >
      <MapCanvas
        onLoad={handleMapLoad}
        initialViewState={{
          longitude: 72.8777,
          latitude: 19.0760,
          zoom: 11,
        }}
      />
    </div>
  );
}
