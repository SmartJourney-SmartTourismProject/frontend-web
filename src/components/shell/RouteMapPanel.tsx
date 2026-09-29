'use client';

import { useEffect, useRef, useState } from 'react';
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

interface RoadRoute {
  coords: [number, number][];
  /** Road distance, not straight-line - this is what OSRM actually drove. */
  km: number;
  minutes: number;
}

async function fetchRoadRoute(points: [number, number][]): Promise<RoadRoute | null> {
  if (points.length < 2 || points.length > OSRM_MAX_WAYPOINTS) return null;
  const coordsParam = points.map(([lat, lon]) => `${lon},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?geometries=geojson&overview=full`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const route = data.routes?.[0];
    if (!route) return null;
    return {
      coords: route.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]),
      // OSRM reports metres and seconds; the response already carried both,
      // they were simply being thrown away with the rest of the payload.
      km: (route.distance ?? 0) / 1000,
      minutes: (route.duration ?? 0) / 60,
    };
  } catch {
    return null;
  }
}

/** Straight-line fallback, used only when OSRM is unreachable. */
function haversineKm([aLat, aLon]: [number, number], [bLat, bLon]: [number, number]): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDuration(minutes: number): string {
  const total = Math.round(minutes);
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function RouteMapPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeLayersRef = useRef<L.Polyline[]>([]);
  const [totalKm, setTotalKm] = useState<number | null>(null);
  const itinerary = useTripStore((s) => s.itinerary);
  const startLocation = useTripStore((s) => s.startLocation);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    // zoomControl: false + a manual bottom-left control - the default
    // top-left position sits right under the Home page's map-toggle button
    // (`absolute top-4 z-10` in page.tsx), which rendered on top of it and
    // made the +/- buttons unclickable/invisible behind that button.
    const map = L.map(containerRef.current, { zoomControl: false }).setView([7.8731, 80.7718], 8); // Sri Lanka
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    // Leaflet measures its container once on init and doesn't notice CSS
    // width/visibility changes on its own (e.g. the hide/show slide
    // animation on the Home page) - without this it keeps rendering at the
    // stale size, or shows a grey/blank tile grid after the panel resizes.
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
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
      let totalKm = 0;

      // The origin is not an itinerary stop - the plan only lists places at
      // the destination - so "Galle to Kandy" drew as Kandy alone until the
      // departure point was plotted explicitly. Day 1's route starts here
      // when one is known, which is what makes the inbound leg visible.
      let originPoint: [number, number] | null = null;
      if (startLocation && typeof startLocation.lat === 'number' && typeof startLocation.lon === 'number') {
        originPoint = [startLocation.lat, startLocation.lon];
        L.marker(originPoint)
          .bindPopup(`<b>Start${startLocation.name ? `: ${startLocation.name}` : ''}</b>`)
          .addTo(markersLayer!);
        allPoints.push(originPoint);
      }

      for (let dayIdx = 0; dayIdx < itinerary.length; dayIdx++) {
        const day = itinerary[dayIdx];
        // Only day 1 departs from the origin; later days start where the
        // traveler already is.
        const dayPoints: [number, number][] = dayIdx === 0 && originPoint ? [originPoint] : [];
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
          ? L.polyline(roadRoute.coords, { color, weight: 4 })
          : L.polyline(dayPoints, { color, weight: 3, dashArray: '6 6' });

        // When OSRM is unreachable the dashed straight-line fallback is
        // already drawn, so the distance shown must match it - a road figure
        // next to a straight line would be a number the map is not showing.
        let dayKm: number;
        let label: string;
        if (roadRoute) {
          dayKm = roadRoute.km;
          label = `Day ${day.day}: ${dayKm.toFixed(1)} km · ${formatDuration(roadRoute.minutes)} driving`;
        } else {
          dayKm = dayPoints
            .slice(1)
            .reduce((sum, point, i) => sum + haversineKm(dayPoints[i], point), 0);
          label = `Day ${day.day}: ~${dayKm.toFixed(1)} km straight line (road route unavailable)`;
        }
        totalKm += dayKm;

        line.bindTooltip(label, { sticky: true }).addTo(map!);
        routeLayersRef.current.push(line);
      }

      if (allPoints.length > 0) {
        map!.fitBounds(L.latLngBounds(allPoints), { padding: [30, 30] });
      }
      setTotalKm(totalKm > 0 ? totalKm : null);
    }

    render();
    return () => {
      cancelled = true;
    };
    // startLocation belongs here too: the departure leg is drawn from it, so
    // a plan that changes only the origin must still redraw.
  }, [itinerary, startLocation]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {totalKm !== null && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-[1100] rounded-lg border border-gray-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-700 shadow">
          Total route ·{' '}
          <span className="font-semibold text-gray-900">{totalKm.toFixed(1)} km</span>
        </div>
      )}
    </div>
  );
}
