"use client";

import { useEffect, useRef } from "react";
import L, { type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

export default function IncidentsMap({ incidents = [] }: { incidents?: any[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Map Setup
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [14.605, 121.025],
      zoom: 13,
      zoomControl: false,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  // Update Markers when incidents change
  useEffect(() => {
    if (!layerRef.current) return;
    
    const layer = layerRef.current;
    layer.clearLayers();

    let cancelled = false;

    const plotIncidents = async () => {
      for (const inc of incidents) {
        if (cancelled) break;

        const displayId = inc.ticket_id || inc.id || 'INC-000';
        
        let lat: number | null = null;
        let lng: number | null = null;
        
        let latRaw = inc.lat;
        let lngRaw = inc.lng;
        if (latRaw === undefined || latRaw === null || latRaw === '') latRaw = inc.latitude;
        if (lngRaw === undefined || lngRaw === null || lngRaw === '') lngRaw = inc.longitude;
        if (latRaw === undefined || latRaw === null || latRaw === '') latRaw = inc.location_lat;
        if (lngRaw === undefined || lngRaw === null || lngRaw === '') lngRaw = inc.location_lng;
        
        if (latRaw !== undefined && lngRaw !== undefined && latRaw !== null && lngRaw !== null && latRaw !== '') {
          lat = parseFloat(latRaw);
          lng = parseFloat(lngRaw);
        } else if (inc.coordinates && typeof inc.coordinates === 'string') {
          const parts = inc.coordinates.split(',');
          if (parts.length >= 2) {
            lat = parseFloat(parts[0].replace(/[^0-9.-]/g, ''));
            lng = parseFloat(parts[1].replace(/[^0-9.-]/g, ''));
          }
        }
        
        const locToSearch = inc.location || inc.city || '';
        if ((!lat || !lng || isNaN(lat)) && locToSearch.trim().length >= 3) {
          try {
             // Geocode dynamically from api/geocode like the main dashboard
             const res = await fetch(`/api/geocode?q=${encodeURIComponent(locToSearch)}`);
             const data = await res.json();
             if (Array.isArray(data) && data.length > 0 && !cancelled) {
               lat = parseFloat(data[0].lat);
               lng = parseFloat(data[0].lon);
             }
          } catch (e) {
             console.error("Geocoding failed for:", locToSearch);
          }
        }

        if (!lat || !lng || isNaN(lat)) {
          // Offset perfectly stacked unknown coordinates slightly so you can see count
          lat = 14.605 + (Math.random() - 0.5) * 0.05;
          lng = 121.025 + (Math.random() - 0.5) * 0.05;
        }

        const type = inc.title || inc.incident_type || inc.type || 'Unknown';
        const unitStatus = inc.status || 'Responding';
        const situation = inc.severity || 'Unknown';
        const severityStr = (inc.severity || '').toLowerCase();
        
        const statusColor = severityStr === 'critical' ? 'red' : (severityStr === 'high' ? 'orange' : 'green');
        const locationStr = inc.location || inc.city || 'Unknown Location';
        const assigned = inc.units_assigned || 'N/A';
        const activeTime = new Date(inc.created_at).toLocaleTimeString();

        let color = '#32db44';
        if (statusColor === 'red') color = '#d11d1d';
        else if (statusColor === 'orange') color = '#f08b1d';

        // Add small jitter to avoid perfect collision stacking on map
        lat += (Math.random() - 0.5) * 0.0002;
        lng += (Math.random() - 0.5) * 0.0002;

        const iconHtml = `
        <div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
      `;
      const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [20, 20], iconAnchor: [10, 10] });
      
      const marker = L.marker([lat, lng], { icon }).addTo(layer);
            const popupHtml = `
          <div style="font-family: Arial; font-size: 13px; line-height: 1.4; color: #333; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 6px;">
              <strong style="color: ${color}; font-size: 15px;">${displayId}</strong>
              <span style="color: #888; cursor: pointer;">&#x2304;</span>
            </div>
            <div><strong>Type:</strong> ${type}</div>
            <div><strong>Unit Status:</strong> <span style="color: #246ef0; font-weight: bold;">${unitStatus}</span></div>
            <div><strong>Situation Status:</strong> <span style="color: ${color}; font-weight: bold;">${situation}</span></div>
            <div><strong>Location:</strong> ${locationStr}</div>
            <div><strong>Units Assigned:</strong> ${assigned}</div>
            <div><strong>Time Active:</strong> ${activeTime}</div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button style="flex: 1; background: #e8862e; color: white; border: none; padding: 6px; border-radius: 20px; font-weight: bold; font-size: 11px; cursor: pointer;">Request Backup</button>
              <button style="flex: 1; background: #c21d1d; color: white; border: none; padding: 6px; border-radius: 20px; font-weight: bold; font-size: 11px; cursor: pointer; line-height: 1;">High Level<br/>Intervention</button>
            </div>
          </div>
        `;
        marker.bindPopup(popupHtml, { className: 'custom-incident-popup' });
      }
    };
    
    plotIncidents();

    return () => {
      cancelled = true;
    };
  }, [incidents]);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={containerRef} className="w-full h-full z-0" />
      <style>{`
        .custom-incident-popup .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .custom-incident-popup .leaflet-popup-content { margin: 12px 14px; }
        .mini-incident-popup .leaflet-popup-content-wrapper { border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); padding: 4px; }
        .mini-incident-popup .leaflet-popup-content { margin: 4px 8px; }
      `}</style>
    </div>
  );
}
