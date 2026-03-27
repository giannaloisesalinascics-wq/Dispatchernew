"use client";

import { useEffect, useMemo, useRef } from "react";
import L, { type LatLngBoundsExpression, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

type ResourceType = "ALL" | "FIRE" | "AMB" | "POL";
type ResourceStatus = "available" | "on-route" | "on-scene" | "offline";

type ResourceMarker = {
  id: number;
  name: string;
  type: Exclude<ResourceType, "ALL">;
  status: ResourceStatus;
  position: [number, number];
};

type MetroManilaLiveMapProps = {
  searchTerm: string;
  searchNonce: number;
  selectedType: ResourceType;
  onSearchStatus?: (message: string) => void;
};

type SearchBounds = {
  south: number;
  north: number;
  west: number;
  east: number;
};

type GeocodeResult = {
  lat: string;
  lon: string;
  display_name: string;
  boundingbox?: [string, string, string, string];
};

const METRO_MANILA_CENTER: [number, number] = [14.5995, 120.9842];
const METRO_MANILA_BOUNDS: LatLngBoundsExpression = [
  [14.32, 120.85],
  [14.82, 121.18],
];

function getMarkerColor(status: ResourceStatus) {
  switch (status) {
    case "available":
      return "#32db44";
    case "on-route":
      return "#246ef0";
    case "on-scene":
      return "#d11d1d";
    default:
      return "#5f5f5f";
  }
}

function isInsideBounds(position: [number, number], bounds: SearchBounds | null) {
  if (!bounds) return true;

  const [lat, lng] = position;
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

function buildMarkers(
  type: Exclude<ResourceType, "ALL">,
  startId: number,
  prefix: string,
  hubs: Array<{ label: string; lat: number; lng: number; count: number }>,
  offsets: Array<[number, number]>,
  statusPattern: ResourceStatus[]
): ResourceMarker[] {
  const markers: ResourceMarker[] = [];
  let nextId = startId;
  let offsetIndex = 0;
  let statusIndex = 0;

  for (const hub of hubs) {
    for (let i = 0; i < hub.count; i += 1) {
      const offset = offsets[offsetIndex % offsets.length];
      const status = statusPattern[statusIndex % statusPattern.length];

      markers.push({
        id: nextId,
        name: `${hub.label} ${prefix} ${i + 1}`,
        type,
        status,
        position: [hub.lat + offset[0], hub.lng + offset[1]],
      });

      nextId += 1;
      offsetIndex += 1;
      statusIndex += 1;
    }
  }

  return markers;
}

const COMMON_OFFSETS: Array<[number, number]> = [
  [0.008, 0.006],
  [-0.007, 0.011],
  [0.012, -0.009],
  [-0.01, -0.007],
  [0.004, 0.015],
  [-0.014, 0.004],
  [0.009, -0.013],
  [-0.005, -0.015],
  [0.013, 0.008],
  [-0.009, 0.013],
];

const FIRE_MARKERS = buildMarkers(
  "FIRE",
  1,
  "Fire Unit",
  [
    { label: "Manila", lat: 14.5995, lng: 120.9842, count: 5 },
    { label: "Quezon City", lat: 14.676, lng: 121.0437, count: 5 },
    { label: "Pasig", lat: 14.5764, lng: 121.0851, count: 4 },
    { label: "Makati", lat: 14.5547, lng: 121.0244, count: 4 },
    { label: "Taguig", lat: 14.5176, lng: 121.0509, count: 3 },
    { label: "Pasay", lat: 14.5378, lng: 121.0014, count: 3 },
    { label: "Caloocan", lat: 14.6577, lng: 120.9831, count: 3 },
    { label: "Marikina", lat: 14.6507, lng: 121.1029, count: 3 },
  ],
  COMMON_OFFSETS,
  ["available", "on-route", "on-scene", "offline", "available", "on-route"]
);

const AMB_MARKERS = buildMarkers(
  "AMB",
  101,
  "Ambulance",
  [
    { label: "Manila", lat: 14.5995, lng: 120.9842, count: 6 },
    { label: "Quezon City", lat: 14.676, lng: 121.0437, count: 7 },
    { label: "Pasig", lat: 14.5764, lng: 121.0851, count: 5 },
    { label: "Makati", lat: 14.5547, lng: 121.0244, count: 5 },
    { label: "Taguig", lat: 14.5176, lng: 121.0509, count: 4 },
    { label: "Pasay", lat: 14.5378, lng: 121.0014, count: 4 },
    { label: "Caloocan", lat: 14.6577, lng: 120.9831, count: 3 },
    { label: "Marikina", lat: 14.6507, lng: 121.1029, count: 3 },
    { label: "Parañaque", lat: 14.4793, lng: 121.0198, count: 3 },
  ],
  COMMON_OFFSETS,
  ["available", "available", "on-route", "on-scene", "offline", "on-route", "available"]
);

const POL_MARKERS = buildMarkers(
  "POL",
  201,
  "Police Unit",
  [
    { label: "Manila", lat: 14.5995, lng: 120.9842, count: 5 },
    { label: "Quezon City", lat: 14.676, lng: 121.0437, count: 5 },
    { label: "Pasig", lat: 14.5764, lng: 121.0851, count: 4 },
    { label: "Makati", lat: 14.5547, lng: 121.0244, count: 4 },
    { label: "Taguig", lat: 14.5176, lng: 121.0509, count: 3 },
    { label: "Pasay", lat: 14.5378, lng: 121.0014, count: 3 },
    { label: "Caloocan", lat: 14.6577, lng: 120.9831, count: 3 },
    { label: "Marikina", lat: 14.6507, lng: 121.1029, count: 3 },
  ],
  COMMON_OFFSETS,
  ["available", "on-route", "available", "on-scene", "offline", "on-route"]
);

const ALL_MARKERS: ResourceMarker[] = [...FIRE_MARKERS, ...AMB_MARKERS, ...POL_MARKERS];

export default function MetroManilaLiveMap({
  searchTerm,
  searchNonce,
  selectedType,
  onSearchStatus,
}: MetroManilaLiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const resourceLayerRef = useRef<L.LayerGroup | null>(null);
  const searchedBoundsRef = useRef<SearchBounds | null>(null);

  const selectedMarkers = useMemo(() => {
    if (selectedType === "ALL") return ALL_MARKERS;
    return ALL_MARKERS.filter((marker) => marker.type === selectedType);
  }, [selectedType]);

  const renderMarkers = (markers: ResourceMarker[]) => {
    const resourceLayer = resourceLayerRef.current;
    if (!resourceLayer) return;

    resourceLayer.clearLayers();

    for (const marker of markers) {
      L.circleMarker(marker.position, {
        radius: 10,
        color: "#ffffff",
        weight: 4,
        fillColor: getMarkerColor(marker.status),
        fillOpacity: 1,
      })
        .addTo(resourceLayer)
        .bindPopup(
          `<strong>${marker.name}</strong><br/>Type: ${marker.type}<br/>Status: ${marker.status}`
        );
    }
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: METRO_MANILA_CENTER,
      zoom: 11,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: METRO_MANILA_BOUNDS,
      maxBoundsViscosity: 0.8,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    resourceLayerRef.current = L.layerGroup().addTo(map);
    renderMarkers(selectedMarkers);

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      searchMarkerRef.current?.remove();
      searchMarkerRef.current = null;

      resourceLayerRef.current?.clearLayers();
      resourceLayerRef.current = null;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const filtered = selectedMarkers.filter((marker) =>
      isInsideBounds(marker.position, searchedBoundsRef.current)
    );
    renderMarkers(filtered);
  }, [selectedMarkers]);

  useEffect(() => {
    const term = searchTerm.trim();

    if (!term || searchNonce === 0) {
      searchedBoundsRef.current = null;
      renderMarkers(selectedMarkers);
      onSearchStatus?.("");
      return;
    }

    if (term.length < 3) {
        searchedBoundsRef.current = null;
        renderMarkers(selectedMarkers);
        onSearchStatus?.("Type at least 3 characters.");
        return;
      }

    const activeMap = mapRef.current;
    if (!activeMap) return;

    let cancelled = false;

    async function searchPlace() {
      try {
        onSearchStatus?.("Searching...");

        const response = await fetch(`/api/geocode?q=${encodeURIComponent(term)}`, {
          cache: "no-store",
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Search failed");
        }

        const data: GeocodeResult[] = payload;

        if (cancelled) return;

        if (!Array.isArray(data) || data.length === 0) {
          onSearchStatus?.("No Metro Manila result found.");
          return;
        }

        const first = data[0];
        const lat = Number(first.lat);
        const lng = Number(first.lon);
        const label = first.display_name;

        let bounds: SearchBounds;

        if (first.boundingbox && first.boundingbox.length === 4) {
          bounds = {
            south: Number(first.boundingbox[0]),
            north: Number(first.boundingbox[1]),
            west: Number(first.boundingbox[2]),
            east: Number(first.boundingbox[3]),
          };
        } else {
          const delta = 0.01;
          bounds = {
            south: lat - delta,
            north: lat + delta,
            west: lng - delta,
            east: lng + delta,
          };
        }

        searchedBoundsRef.current = bounds;

        if (searchMarkerRef.current) {
          searchMarkerRef.current.remove();
          searchMarkerRef.current = null;
        }

        const searchMarker = L.marker([lat, lng]);
        searchMarker.addTo(activeMap).bindPopup(label).openPopup();
        searchMarkerRef.current = searchMarker;

        const markersInPlace = selectedMarkers.filter((unit) =>
          isInsideBounds(unit.position, bounds)
        );

        renderMarkers(markersInPlace);

        const placeBounds = L.latLngBounds(
          [bounds.south, bounds.west],
          [bounds.north, bounds.east]
        );

        activeMap.fitBounds(placeBounds, { padding: [25, 25] });

        if (markersInPlace.length === 0) {
          onSearchStatus?.(`No ${selectedType} units found inside ${term}.`);
        } else {
          onSearchStatus?.(
            `${markersInPlace.length} ${selectedType} unit${markersInPlace.length > 1 ? "s" : ""} found inside ${term}.`
          );
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Unable to search location.";
          onSearchStatus?.(message);
        }
      }
    }

    void searchPlace();

    return () => {
      cancelled = true;
    };
  }, [searchNonce, searchTerm, selectedMarkers, selectedType, onSearchStatus]);

  return (
    <div className="drms-live-map">
      <div ref={containerRef} className="drms-live-map-container" />
    </div>
  );
}