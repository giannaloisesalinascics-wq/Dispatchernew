import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function DispatchLeafletMap({ centerLat, centerLng }: { centerLat: number, centerLng: number }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { center: [centerLat, centerLng], zoom: 15, zoomControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png").addTo(map);

    // Mock target
    const targetIcon = L.divIcon({ html: `<div style="background-color:#d41414;width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`, className: '', iconSize: [18, 18] });
    L.marker([centerLat, centerLng], { icon: targetIcon }).addTo(map);

    // Mock AMB unit
    const ambIcon = L.divIcon({ html: `<div style="background-color:#3bdced;width:20px;height:20px;border-radius:50%;border:3px solid black;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`, className: '', iconSize: [20, 20] });
    const ambMarker = L.marker([centerLat - 0.003, centerLng - 0.006], { icon: ambIcon }).addTo(map);

    const ambPopup = `
      <div style="font-family:Arial;font-size:11px;color:#333;width:200px">
        <div style="font-weight:bold;font-size:14px;margin-bottom:4px;">AMB Unit 03</div>
        <div style="line-height:1.4"><strong>Station:</strong> UERM Hospital</div>
        <div style="line-height:1.4"><strong>Status:</strong> Available <span style="display:inline-block;width:8px;height:8px;background:#32db44;border-radius:50%;margin-left:2px"></span></div>
        <div style="line-height:1.4"><strong>Distance Away:</strong> 1.2 km</div>
        <div style="line-height:1.4"><strong>ETA:</strong> 5 mins</div>
        <div style="line-height:1.4"><strong>Crew:</strong> 3 paramedics</div>
        <div style="line-height:1.4"><strong>Team Leader:</strong> Grace Robles</div>
        <div style="display:flex;gap:6px;margin-top:10px">
           <button style="flex:1;background:#f3f3f3;border:1px solid #ccc;color:#333;border-radius:20px;padding:6px;font-weight:bold;cursor:pointer">Message</button>
           <button style="flex:1;background:#f2552c;border:none;color:white;border-radius:20px;padding:6px;font-weight:bold;cursor:pointer">Assign</button>
        </div>
      </div>
    `;
    ambMarker.bindPopup(ambPopup, { className: 'custom-dispatch-popup', closeButton: false });
    
    // Mock FIRE unit
    const fireIcon = L.divIcon({ html: `<div style="background-color:#f08b1d;width:20px;height:20px;border-radius:50%;border:3px solid black;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`, className: '', iconSize: [20, 20] });
    const fireMarker = L.marker([centerLat + 0.002, centerLng + 0.004], { icon: fireIcon }).addTo(map);
    
    const firePopup = `
      <div style="font-family:Arial;font-size:11px;color:#333;width:200px">
        <div style="font-weight:bold;font-size:14px;margin-bottom:4px;">FIRE Unit 07</div>
        <div style="line-height:1.4"><strong>Station:</strong> Quezon City Fire District</div>
        <div style="line-height:1.4"><strong>Status:</strong> Available <span style="display:inline-block;width:8px;height:8px;background:#32db44;border-radius:50%;margin-left:2px"></span></div>
        <div style="line-height:1.4"><strong>Distance Away:</strong> 900 m</div>
        <div style="line-height:1.4"><strong>ETA:</strong> 2 mins</div>
        <div style="line-height:1.4"><strong>Crew:</strong> 7 firefighters</div>
        <div style="line-height:1.4"><strong>Team Leader:</strong> Capt. Miguel Santos</div>
        <div style="display:flex;gap:6px;margin-top:10px">
           <button style="flex:1;background:#f3f3f3;border:1px solid #ccc;color:#333;border-radius:20px;padding:6px;font-weight:bold;cursor:pointer">Message</button>
           <button style="flex:1;background:#f2552c;border:none;color:white;border-radius:20px;padding:6px;font-weight:bold;cursor:pointer">Assign</button>
        </div>
      </div>
    `;
    fireMarker.bindPopup(firePopup, { className: 'custom-dispatch-popup', closeButton: false });

    // Mock POL units
    const polIcon = L.divIcon({ html: `<div style="background-color:#9f7aea;width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`, className: '', iconSize: [20, 20] });
    L.marker([centerLat + 0.006, centerLng + 0.001], { icon: polIcon }).addTo(map);
    L.marker([centerLat + 0.003, centerLng + 0.008], { icon: polIcon }).addTo(map);

    // Open popups after a slight delay
    setTimeout(() => {
        ambMarker.openPopup();
        setTimeout(() => fireMarker.openPopup(), 100);
    }, 400);

    return () => { map.remove() };
  }, [centerLat, centerLng]);

  return (
    <>
      <div ref={containerRef} className="w-full h-full z-0"></div>
      <style>{`
        .custom-dispatch-popup .leaflet-popup-content-wrapper { border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); padding:2px; }
        .custom-dispatch-popup .leaflet-popup-content { margin: 14px; }
        .custom-dispatch-popup .leaflet-popup-tip { width: 14px; height: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.1) }
      `}</style>
    </>
  );
}
