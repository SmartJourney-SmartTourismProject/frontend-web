"use client";

import { forwardRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, CalendarDays, Info, MapPin } from "lucide-react";
import { AuthLaunchButton } from "@/components/auth/AuthLaunchButton";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import {
  DESTINATIONS,
  DESTINATION_REGIONS,
  TRIP_IDEAS,
  type Destination,
  type DestinationRegion,
} from "@/lib/landing-destinations";
import { EASE_OUT, SPRING } from "@/lib/motion";

/** After sign-up, land in the Home chat with the prompt typed in (not sent). */
const planUrl = (prompt: string) =>
  `/home?prompt=${encodeURIComponent(prompt)}`;

export function Destinations() {
  const [region, setRegion] = useState<DestinationRegion>("All");
  const reduced = useReducedMotion();

  const visible =
    region === "All"
      ? DESTINATIONS
      : DESTINATIONS.filter((d) => d.region === region);
  // A 2x2 feature tile only reads well when there are enough cards to balance it.
  const hasFeature = visible.length >= 8;

  return (
    <>
      <section
        id="destinations"
        className="bg-brand-800 px-6 pb-24 pt-16 sm:px-10 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">
              Where to next
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">
              Iconic viewpoints across Sri Lanka.
            </h2>
            <p className="mt-4 max-w-xl text-base text-brand-100/80">
              From misty tea country to leopard trails and ramparts by the sea.
              Pick a place and we will build the trip around it.
            </p>
          </Reveal>

          {/* Region filter: one shared pill slides between the options. */}
          <LayoutGroup id="destination-filter">
            <div
              role="tablist"
              aria-label="Filter destinations by region"
              className="mt-8 flex flex-wrap gap-2"
            >
              {DESTINATION_REGIONS.map((r) => {
                const active = r === region;
                return (
                  <button
                    key={r}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setRegion(r)}
                    className={clsx(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-white"
                        : "text-brand-100/80 hover:text-white",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="destination-pill"
                        transition={reduced ? { duration: 0 } : SPRING}
                        className="absolute inset-0 rounded-full bg-brand-gradient shadow-glow"
                      />
                    )}
                    <span className="relative">{r}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <motion.div
            layout={!reduced}
            className="mt-8 grid grid-flow-dense auto-rows-[220px] grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((d, i) => (
                <DestinationCard
                  key={d.id}
                  destination={d}
                  className={clsx(
                    hasFeature && i === 0 && "col-span-2 row-span-2",
                    hasFeature && i === 4 && "row-span-2",
                  )}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Separate section so it can take its own background. */}
      <section
        id="trip-ideas"
        className="bg-white px-6 py-24 sm:px-10 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">
                Ready-made starting points
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-800 sm:text-4xl">
                Popular trip ideas.
              </h2>
              <p className="mt-4 max-w-xl text-base text-gray-600">
                Start from one of these and tweak it, or describe your own.
                Every idea becomes a full day-by-day plan with a map and budget.
              </p>
            </Reveal>

            <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TRIP_IDEAS.map((trip) => (
                <StaggerItem key={trip.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-lg shadow-brand-800/10 transition duration-300 hover:-translate-y-1 hover:border-accent-500/40 hover:shadow-xl hover:shadow-brand-800/20">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={trip.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-110"
                      />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {trip.duration}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-serif text-lg font-semibold text-brand-800">
                        {trip.title}
                      </h3>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {trip.stops.map((stop) => (
                          <li
                            key={stop}
                            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-600"
                          >
                            <MapPin className="h-3 w-3 text-accent-500" />
                            {stop}
                          </li>
                        ))}
                      </ul>
                      <AuthLaunchButton
                        mode="signup"
                        callbackUrl={planUrl(trip.prompt)}
                        className="mt-5 gap-1.5 self-start text-sm font-semibold text-accent-600 transition hover:gap-2.5 hover:text-brand-800"
                      >
                        Start planning <ArrowRight className="h-4 w-4" />
                      </AuthLaunchButton>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>
    </>
  );
}

// forwardRef: AnimatePresence (mode="popLayout") measures exiting children by ref.
const DestinationCard = forwardRef<
  HTMLElement,
  { destination: Destination; className?: string }
>(function DestinationCard({ destination: d, className }, ref) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      ref={ref}
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? undefined : { opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className={clsx(
        "group relative overflow-hidden rounded-2xl bg-brand-800 shadow-lg transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/40",
        className,
      )}
    >
      <Image
        src={d.image}
        alt={`${d.name}, ${d.tag}`}
        fill
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="object-cover transition duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

      <span
        title={`Photo: ${d.credit.author}, ${d.credit.license} (Wikimedia Commons)`}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/80 opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
      >
        <Info
          className="h-4 w-4"
          aria-label={`Photo credit: ${d.credit.author}, ${d.credit.license}`}
        />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-pink-200">
          {d.region}
        </p>
        <h3 className="font-serif text-xl font-semibold leading-tight text-white">
          {d.name}
        </h3>
        <p className="text-sm text-white/75">{d.tag}</p>
        {/* Always visible on touch screens (no hover); slides up on hover elsewhere. */}
        <div className="mt-2 max-h-10 overflow-hidden transition-all duration-300 sm:max-h-0 sm:opacity-0 sm:group-hover:max-h-10 sm:group-hover:opacity-100 sm:group-focus-within:max-h-10 sm:group-focus-within:opacity-100">
          <AuthLaunchButton
            mode="signup"
            callbackUrl={planUrl(d.prompt)}
            className="gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
          >
            Plan a trip here <ArrowRight className="h-3.5 w-3.5" />
          </AuthLaunchButton>
        </div>
      </div>
    </motion.article>
  );
});
