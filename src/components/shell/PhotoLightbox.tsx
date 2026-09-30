'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxPhoto {
  url: string;
  name: string;
  attribution?: string | null;
}

/**
 * Full-screen view of one itinerary photo, with previous/next through the
 * rest of the card's photos. Esc, the close button or a click on the dark
 * backdrop closes it; arrow keys step through.
 */
export function PhotoLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const photo = photos[index];
  const many = photos.length > 1;

  const step = useCallback(
    (delta: number) => onIndexChange((index + delta + photos.length) % photos.length),
    [index, photos.length, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && many) step(1);
      else if (e.key === 'ArrowLeft' && many) step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, step, many]);

  // Focus the dialog and stop the page behind it scrolling while open.
  useEffect(() => {
    dialogRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!photo) return null;

  // Portalled to <body>: rendered inside the chat panel, `fixed` only
  // covered that panel (an ancestor creates its own containing block) and
  // the Leaflet map, whose panes sit at z-index 400-1000, stayed on top.
  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo of ${photo.name}`}
      tabIndex={-1}
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 p-4 outline-none"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close photo"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {many && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            step(-1);
          }}
          aria-label="Previous photo"
          className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Clicks on the photo or its caption don't close - only the backdrop does. */}
      <figure onClick={(e) => e.stopPropagation()} className="flex max-w-4xl flex-col items-center">
        <div className="relative h-[75vh] w-[85vw] max-w-4xl">
          <Image
            src={photo.url}
            alt={photo.name}
            fill
            sizes="85vw"
            className="object-contain"
            // Same reason as ListingCard: Next's server-side optimizer is
            // rate-limited by Wikimedia; the browser loads it directly.
            unoptimized
          />
        </div>
        <figcaption className="mt-3 text-center text-sm text-white">
          <span className="font-semibold">{photo.name}</span>
          {many && <span className="ml-2 text-white/60">{index + 1} / {photos.length}</span>}
          {photo.attribution && <p className="mt-1 text-xs text-white/60">{photo.attribution}</p>}
        </figcaption>
      </figure>

      {many && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            step(1);
          }}
          aria-label="Next photo"
          className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>,
    document.body,
  );
}
