'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A draggable divider between two panels.
 *
 * The split is stored as a percentage of the container, not pixels, so the
 * layout survives a window resize rather than leaving one panel stranded at a
 * width that no longer fits.
 *
 * Both panels stay above `MIN_PERCENT` of the container. Dragging past that
 * clamps rather than collapsing: a panel squeezed to zero width looks broken
 * and cannot be dragged back, because there is nothing left to grab. Closing a
 * panel is what the map toggle is for - an explicit action with an obvious way
 * to undo it.
 */

const MIN_PERCENT = 20;
const MAX_PERCENT = 80;
const DEFAULT_PERCENT = 50;
const STORAGE_KEY = 'sj.split.percent';
/** Keyboard nudge per arrow-key press, for operating the divider without a mouse. */
const KEY_STEP = 2;

function clamp(value: number): number {
  return Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, value));
}

export function SplitPane({
  left,
  right,
  rightOpen,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  /** When false the right panel is fully hidden and the divider is withdrawn. */
  rightOpen: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(DEFAULT_PERCENT);
  const [dragging, setDragging] = useState(false);

  // Restored after mount rather than during render: localStorage is not
  // available on the server, and reading it in the initial state would make
  // the server and client markup disagree.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setPercent(clamp(Number(saved) || DEFAULT_PERCENT));
    } catch {
      // Private mode or blocked storage - the default split is fine.
    }
  }, []);

  const persist = useCallback((value: number) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Math.round(value)));
    } catch {
      // Losing the remembered width is not worth surfacing to the user.
    }
  }, []);

  const applyFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    setPercent(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  // Listeners live on window, not the handle: once a drag starts the pointer
  // routinely leaves the 6px handle, and a handle-bound mousemove would drop
  // the drag the moment it did.
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => applyFromClientX(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) applyFromClientX(e.touches[0].clientX);
    };
    const stop = () => {
      setDragging(false);
      setPercent((p) => {
        persist(p);
        return p;
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', stop);
    // While dragging, the cursor must not flicker to a text caret and the
    // pointer must not select text in either panel.
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stop);
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };
  }, [dragging, applyFromClientX, persist]);

  const nudge = (delta: number) => {
    setPercent((p) => {
      const next = clamp(p + delta);
      persist(next);
      return next;
    });
  };

  const reset = () => {
    setPercent(DEFAULT_PERCENT);
    persist(DEFAULT_PERCENT);
  };

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* min-w-0 lets a flex child shrink below its content width; without it
          a long chat message sets a floor the divider cannot drag past. */}
      <div className="h-full min-w-0 overflow-hidden" style={{ width: rightOpen ? `${percent}%` : '100%' }}>
        {left}
      </div>

      {rightOpen && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize chat and map panels"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={MIN_PERCENT}
          aria-valuemax={MAX_PERCENT}
          tabIndex={0}
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onTouchStart={() => setDragging(true)}
          onDoubleClick={reset}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              nudge(-KEY_STEP);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              nudge(KEY_STEP);
            } else if (e.key === 'Home') {
              e.preventDefault();
              reset();
            }
          }}
          title="Drag to resize · double-click to reset"
          // Leaflet's controls sit as high as z-index 1000, so the handle has
          // to clear that stack or it becomes ungrabbable over the map edge.
          className={`relative z-[1100] flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-gray-100 transition-colors hover:bg-blue-200 focus:outline-none focus-visible:bg-blue-300 ${
            dragging ? 'bg-blue-300' : ''
          }`}
        >
          {/* A wider invisible hit area: a 6px target is painful to grab, but
              a visually wide divider would eat layout space. */}
          <span className="absolute inset-y-0 -left-1.5 -right-1.5" />
          <span className="pointer-events-none h-8 w-0.5 rounded-full bg-gray-400/70" />
        </div>
      )}

      <div
        className="h-full min-w-0 overflow-hidden"
        style={{ width: rightOpen ? `${100 - percent}%` : '0%' }}
      >
        {right}
      </div>
    </div>
  );
}
