import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import Supercluster from 'supercluster';
import { Map as MapCanvas } from '@/components/ui/map';
import { formatReportTimestamp } from '../../utils/roadReport';

const conditionColors = {
  Good: '#10b981',
  Moderate: '#f59e0b',
  Poor: '#ef4444',
};

/* ─── helpers ────────────────────────────────────────────────────────── */

function severityNum(condition) {
  return condition === 'Poor' ? 3 : condition === 'Moderate' ? 2 : 1;
}
function conditionFromSeverity(s) {
  return s >= 3 ? 'Poor' : s >= 2 ? 'Moderate' : 'Good';
}

/* ─── Convert reports → GeoJSON features for Supercluster ────────── */

function reportsToFeatures(reports) {
  return reports
    .filter((r) => r.latitude != null && r.longitude != null)
    .map((r) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [r.longitude, r.latitude],
      },
      properties: {
        reportData: r,
        worstSeverity: severityNum(r.condition),
      },
    }));
}

/* ─── popup HTML builders ────────────────────────────────────────────── */

function buildSinglePopupHtml(report) {
  const color = conditionColors[report.condition] || '#3b82f6';
  const lat = report.latitude;
  const lng = report.longitude;
  return `
    <div style="font-family:'Inter',sans-serif;padding:4px;min-width:200px">
      <h4 style="margin:0 0 8px;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.05em">RoadSense</h4>
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0f172a">${report.roadName || 'Unknown Road'}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;font-size:12px">
        <div><span style="display:block;font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase">Condition</span><span style="font-weight:700;color:${color}">${report.condition}</span></div>
        <div><span style="display:block;font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase">Confidence</span><span style="font-weight:600;color:#334155">${report.confidence}%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:11px">
        <div><span style="display:block;font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase">Location</span><span style="color:#475569;font-family:monospace">${lat.toFixed(4)}, ${lng.toFixed(4)}</span></div>
        <div><span style="display:block;font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase">Time</span><span style="color:#475569">${formatReportTimestamp(report.timestamp)}</span></div>
      </div>
      <div style="font-size:10px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:8px">Device ID: <span style="font-family:monospace">${report.deviceId}</span></div>
    </div>`;
}

function buildClusterPopupHtml(pointCount, worstCondition, clusterLat, clusterLng, childReports) {
  const color = conditionColors[worstCondition] || '#3b82f6';

  // Sort by timestamp descending and show most recent 5
  const sorted = childReports
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const latest = sorted.slice(0, 5);

  const listHtml = latest
    .map((r) => {
      const c = conditionColors[r.condition] || '#3b82f6';
      return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid #f1f5f9">
        <div style="width:8px;height:8px;border-radius:50%;background:${c};flex-shrink:0"></div>
        <span style="font-size:10px;color:#334155;font-weight:600">${r.condition}</span>
        <span style="font-size:10px;color:#94a3b8;margin-left:auto">${formatReportTimestamp(r.timestamp)}</span>
      </div>`;
    })
    .join('');

  return `
    <div style="font-family:'Inter',sans-serif;padding:4px;min-width:220px">
      <h4 style="margin:0 0 8px;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.05em">RoadSense — Cluster</h4>
      <div style="text-align:center;margin-bottom:8px">
        <div style="font-size:28px;font-weight:800;color:${color}">${pointCount}</div>
        <div style="font-size:11px;color:#64748b;font-weight:600">detections at this spot</div>
      </div>
      <div style="margin-bottom:6px;font-size:10px;color:#64748b">Location: <span style="font-family:monospace;color:#475569">${clusterLat.toFixed(4)}, ${clusterLng.toFixed(4)}</span></div>
      <div style="margin-bottom:4px;font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase">Recent detections</div>
      ${listHtml}
      ${pointCount > 5 ? `<div style="font-size:10px;color:#94a3b8;padding-top:4px;text-align:center">+ ${pointCount - 5} more</div>` : ''}
    </div>`;
}

/* ─── DOM marker builders ────────────────────────────────────────────── */

function createSingleDotElement(condition) {
  const color = conditionColors[condition] || '#3b82f6';

  const el = document.createElement('div');
  el.className = 'rs-marker-container';
  el.style.width = '16px';
  el.style.height = '16px';
  el.style.cursor = 'pointer';

  const inner = document.createElement('div');
  inner.className = 'rs-marker-inner rs-marker-appear';
  inner.style.position = 'relative';
  inner.style.width = '100%';
  inner.style.height = '100%';

  const dot = document.createElement('div');
  dot.style.cssText = `width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3);position:relative;z-index:2`;
  inner.appendChild(dot);

  if (condition === 'Poor') {
    const pulse = document.createElement('div');
    pulse.style.cssText = `position:absolute;inset:-4px;border-radius:50%;background:${color};opacity:.5;animation:rs-pulse 2s cubic-bezier(.4,0,.6,1) infinite;z-index:1;pointer-events:none`;
    inner.insertBefore(pulse, dot);
  }

  el.appendChild(inner);
  return el;
}

function createClusterElement(count, condition) {
  const color = conditionColors[condition] || '#3b82f6';
  const size = count < 10 ? 36 : count < 50 ? 42 : count < 100 ? 48 : 54;

  const el = document.createElement('div');
  el.className = 'rs-marker-container';
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.cursor = 'pointer';

  const inner = document.createElement('div');
  inner.className = 'rs-marker-inner rs-marker-appear';
  inner.style.position = 'relative';
  inner.style.width = '100%';
  inner.style.height = '100%';

  // pulsing halo
  const halo = document.createElement('div');
  halo.style.cssText = `position:absolute;inset:-4px;border-radius:50%;background:${color};opacity:.25;animation:rs-pulse 3s cubic-bezier(.4,0,.6,1) infinite;z-index:1;pointer-events:none`;
  inner.appendChild(halo);

  // main circle
  const circle = document.createElement('div');
  circle.style.cssText = `width:100%;height:100%;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;position:relative;z-index:2;opacity:.92`;

  const label = document.createElement('span');
  label.textContent = count >= 1000 ? `${Math.round(count / 1000)}k` : String(count);
  label.style.cssText = `color:#fff;font-family:'Inter',system-ui,sans-serif;font-weight:800;font-size:${count < 10 ? 13 : count < 100 ? 12 : 11}px;line-height:1;text-shadow:0 1px 2px rgba(0,0,0,.3);user-select:none;pointer-events:none`;

  circle.appendChild(label);
  inner.appendChild(circle);
  el.appendChild(inner);
  return el;
}

/* ─── Inject styles once ─────────────────────────────────────────────── */

function injectStyles() {
  if (document.getElementById('rs-map-styles')) return;
  const style = document.createElement('style');
  style.id = 'rs-map-styles';
  style.innerHTML = `
    @keyframes rs-pulse {
      0%   { transform:scale(.8); opacity:.8 }
      100% { transform:scale(2.5); opacity:0 }
    }
    @keyframes rs-appear {
      from { opacity:0; transform:scale(.6) }
      to   { opacity:1; transform:scale(1) }
    }
    .rs-marker-appear { animation:rs-appear .25s cubic-bezier(0,0,.2,1) forwards }
    .maplibregl-marker {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      will-change: transform !important;
    }
    .maplibregl-popup-content {
      border-radius:12px !important;
      box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1) !important;
      padding:12px 16px !important;
      border:1px solid #e2e8f0 !important;
    }
    .maplibregl-popup-tip { border-top-color:#fff !important }
  `;
  document.head.appendChild(style);
}

/* ─── Collect all leaf reports inside a cluster (recursive) ──────────── */

function getClusterLeaves(index, clusterId, totalCount) {
  try {
    const leaves = index.getLeaves(clusterId, totalCount);
    return leaves.map((leaf) => leaf.properties.reportData);
  } catch {
    return [];
  }
}

/* ─── Component ──────────────────────────────────────────────────────── */

export default function MapView({ reports }) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map()); // string key → { marker, pointCount, worstCondition, isCluster }
  const indexRef = useRef(null);        // Supercluster instance
  const rafRef = useRef(null);

  /**
   * Build / rebuild the Supercluster index whenever reports change.
   * Supercluster.map   → runs per-point to set initial aggregation values.
   * Supercluster.reduce → merges two clusters together (keeps worst severity).
   */
  const scIndex = useMemo(() => {
    const idx = new Supercluster({
      radius: 60,   // cluster radius in pixels — how aggressively to merge
      maxZoom: 18,   // beyond this zoom, every point is individual
      minZoom: 0,
      minPoints: 2,  // at least 2 points needed to form a cluster
      map: (props) => ({
        worstSeverity: props.worstSeverity,
      }),
      reduce: (acc, props) => {
        if (props.worstSeverity > acc.worstSeverity) {
          acc.worstSeverity = props.worstSeverity;
        }
      },
    });

    const features = reportsToFeatures(reports);
    idx.load(features);
    return idx;
  }, [reports]);

  // Store current index in ref for event handlers
  useEffect(() => {
    indexRef.current = scIndex;
  }, [scIndex]);

  /**
   * Core render: query Supercluster for the map's current bounds + zoom,
   * then update DOM markers.
   */
  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const index = indexRef.current;
    if (!map || !index) return;

    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());

    // Clamp bbox to valid geo boundaries
    const bbox = [
      Math.max(-180, bounds.getWest()),
      Math.max(-85, bounds.getSouth()),
      Math.min(180, bounds.getEast()),
      Math.min(85, bounds.getNorth()),
    ];

    const clusters = index.getClusters(bbox, zoom);

    // Build a unique key for each cluster or point
    const nextKeys = new Map(); // key → cluster feature
    for (const feature of clusters) {
      const props = feature.properties;
      const key = props.cluster
        ? `cluster-${props.cluster_id}`
        : `point-${props.reportData.id}`;
      nextKeys.set(key, feature);
    }

    // Remove stale markers
    markersRef.current.forEach((entry, key) => {
      if (!nextKeys.has(key)) {
        entry.marker.remove();
        markersRef.current.delete(key);
      }
    });

    // Add / update markers
    for (const [key, feature] of nextKeys) {
      const props = feature.properties;
      const [lng, lat] = feature.geometry.coordinates;
      const lngLat = [lng, lat];

      const isCluster = !!props.cluster;
      const pointCount = isCluster ? props.point_count : 1;
      const worstCondition = conditionFromSeverity(props.worstSeverity);

      const existing = markersRef.current.get(key);

      if (existing) {
        // If properties changed, remove and recreate cleanly
        if (
          existing.pointCount !== pointCount ||
          existing.worstCondition !== worstCondition ||
          existing.isCluster !== isCluster
        ) {
          existing.marker.remove();
          markersRef.current.delete(key);
        } else {
          // Just update position and popup
          existing.marker.setLngLat(lngLat);
          const popup = buildPopup(index, feature, lat, lng, pointCount, worstCondition);
          existing.marker.setPopup(popup);
          continue;
        }
      }

      // Brand-new marker
      const el = isCluster
        ? createClusterElement(pointCount, worstCondition)
        : createSingleDotElement(worstCondition);

      const popup = buildPopup(index, feature, lat, lng, pointCount, worstCondition);

      const marker = new window.maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map);

      // On cluster click → zoom in to expand that cluster
      if (isCluster) {
        el.addEventListener('click', (e) => {
          if (e.detail > 1) return;
          const currentIndex = indexRef.current;
          if (!currentIndex) return;
          try {
            const expansionZoom = Math.min(
              currentIndex.getClusterExpansionZoom(props.cluster_id),
              18
            );
            map.flyTo({ center: lngLat, zoom: expansionZoom, duration: 500 });
          } catch {
            map.flyTo({ center: lngLat, zoom: map.getZoom() + 2, duration: 500 });
          }
        });
      }

      markersRef.current.set(key, {
        marker,
        pointCount,
        worstCondition,
        isCluster,
      });
    }
  }, []);

  function buildPopup(index, feature, lat, lng, pointCount, worstCondition) {
    const props = feature.properties;

    if (!props.cluster) {
      // Single point
      return new window.maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(
        buildSinglePopupHtml(props.reportData)
      );
    }

    // Cluster — get leaf reports for the popup detail
    const childReports = getClusterLeaves(index, props.cluster_id, pointCount);

    return new window.maplibregl.Popup({ offset: 18, closeButton: false, maxWidth: '300px' }).setHTML(
      buildClusterPopupHtml(pointCount, worstCondition, lat, lng, childReports)
    );
  }

  /**
   * Schedule a re-render via rAF so we don't thrash during rapid zoom/pan.
   */
  const scheduleRender = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => renderMarkers());
  }, [renderMarkers]);

  /* map loaded — bind event listeners and do first render */
  const handleMapLoad = useCallback(
    (map) => {
      mapInstanceRef.current = map;
      injectStyles();

      // re-cluster on every zoom / pan
      map.on('moveend', scheduleRender);
      map.on('zoomend', scheduleRender);

      // initial render
      renderMarkers();
    },
    [renderMarkers, scheduleRender]
  );

  /* when reports (and thus scIndex) change, re-render */
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    renderMarkers();
  }, [scIndex, renderMarkers]);

  /* resize handling */
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      const map = mapInstanceRef.current;
      if (!map) return;
      map.resize();
      scheduleRender();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [scheduleRender]);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      markersRef.current.forEach((e) => e.marker.remove());
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
