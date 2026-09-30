'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The browser's current position, for trips that name no departure point.
 *
 * "I want to go to Galle" has no origin in it, so the planner had nothing to
 * route from and drew only the Galle stops. The whole backend chain for this
 * already existed - `chatApi.sendMessage` takes a `clientGps`, NestJS forwards
 * it as `client_gps`, and the AI backend resolves it into `start_location` -
 * but nothing ever called `navigator.geolocation`, so the parameter was always
 * undefined and every trip fell through to IP geolocation.
 *
 * Deliberately non-blocking. A permission prompt can sit unanswered
 * indefinitely, and a chat message must never wait on one: the hook asks once,
 * caches whatever comes back, and sending proceeds with `null` until then. The
 * backend already degrades IP -> nothing, so a denied prompt costs accuracy,
 * never function.
 *
 * A stated origin always wins over this on the server ("from Galle" beats a
 * GPS fix), so granting location never overrides what the traveler typed.
 */

export interface Coordinates {
  lat: number;
  lon: number;
}

/** Long enough that walking around during one planning session doesn't refetch. */
const MAX_AGE_MS = 10 * 60 * 1000;
/** A fix that takes longer than this is not worth waiting for. */
const TIMEOUT_MS = 10_000;

export function useCurrentLocation(): {
  coords: Coordinates | null;
  /** 'unsupported' | 'prompt' | 'granted' | 'denied' | 'unavailable' */
  status: string;
  request: () => void;
} {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState('prompt');
  // Guards against a second prompt from React 18 StrictMode's double-mount in
  // development, which would otherwise show the browser dialog twice.
  const asked = useRef(false);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setStatus('granted');
      },
      (error) => {
        // PERMISSION_DENIED is a real answer, not a failure to retry.
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: false, timeout: TIMEOUT_MS, maximumAge: MAX_AGE_MS },
    );
  }, []);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;

    // Ask the Permissions API first where it exists, so a previously granted
    // site gets its position without a fresh prompt, and one the traveler has
    // already refused is never prompted again.
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          if (result.state === 'denied') {
            setStatus('denied');
            return;
          }
          request();
        })
        .catch(() => request());   // Permissions API unsupported - just ask.
      return;
    }
    request();
  }, [request]);

  return { coords, status, request };
}
