'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTripStore } from '@/lib/trip-store';

// Leaflet's default marker icon uses relative image paths that don't
// resolve under Next.js's bundler (a well-known Leaflet+webpack issue) -
// markers 404 and render blank without this fix.
type IconDefaultWithPrivateMethod = typeof L.Icon.Default.prototype & { _getIconUrl?: unknown };
delete (L.Icon.Default.prototype as IconDefaultWithPrivateMethod)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: (markerIcon2x as unknown as { src: string }).src ?? markerIcon2x,
  iconUrl: (markerIcon as unknown as { src: string }).src ?? markerIcon,
  shadowUrl: (markerShadow as unknown as { src: string }).src ?? markerShadow,
});

// Same free public routing server + per-day color scheme validated live in
// ai-backend/demo/index.html - no API key, no signup, real road-snapped
// geometry. See that file's history for why Mapbox/OSRM were compared.
const DAY_ROUTE_COLORS = ['#412874', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#0891b2'];
const OSRM_MAX_WAYPOINTS = 25;

async function fetchRoadRoute(points: [number, number][]): Promise<[number, number][] | null> {
  if (points.length < 2 || points.length > OSRM_MAX_WAYPOINTS) return null;
  const coordsParam = points.map(([lat, lon]) => `${lon},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?geometries=geojson&overview=full`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const route = data.routes?.[0];
    if (!route) return null;
    return route.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
  } catch {
    return null;
  }
}

export function RouteMapPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeLayersRef = useRef<L.Polyline[]>([]);
  const itinerary = useTripStore((s) => s.itinerary);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([7.8731, 80.7718], 8); // Sri Lanka
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersRef.current;
    if (!map || !markersLayer) return;

    let cancelled = false;

    async function render() {
      markersLayer!.clearLayers();
      routeLayersRef.current.forEach((layer) => map!.removeLayer(layer));
      routeLayersRef.current = [];
      if (itinerary.length === 0) return;

      const allPoints: [number, number][] = [];
      let stopNumber = 1;

      for (let dayIdx = 0; dayIdx < itinerary.length; dayIdx++) {
        const day = itinerary[dayIdx];
        const dayPoints: [number, number][] = [];
        for (const item of day.items) {
          if (typeof item.lat !== 'number' || typeof item.lon !== 'number') continue;
          L.marker([item.lat, item.lon])
            .bindPopup(`<b>${stopNumber}. ${item.name}</b><br>${item.time ?? ''}<br>${item.notes ?? ''}`)
            .addTo(markersLayer!);
          dayPoints.push([item.lat, item.lon]);
          allPoints.push([item.lat, item.lon]);
          stopNumber++;
        }

        if (dayPoints.length < 2) continue;
        const color = DAY_ROUTE_COLORS[dayIdx % DAY_ROUTE_COLORS.length];
        const roadRoute = await fetchRoadRoute(dayPoints);
        if (cancelled) return;
        const line = roadRoute
          ? L.polyline(roadRoute, { color, weight: 4 })
          : L.polyline(dayPoints, { color, weight: 3, dashArray: '6 6' });
        line.addTo(map!);
        routeLayersRef.current.push(line);
      }

      if (allPoints.length > 0) {
        map!.fitBounds(L.latLngBounds(allPoints), { padding: [30, 30] });
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [itinerary]);

  return <div ref={containerRef} className="h-full w-full" />;
}
