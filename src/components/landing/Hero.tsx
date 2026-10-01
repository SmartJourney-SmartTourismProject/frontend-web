'use client';

import { AuthLaunchButton } from '@/components/auth/AuthLaunchButton';
import Image from 'next/image';
import { useRef, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import { CountUp } from '@/components/ui/CountUp';
import { EASE_OUT } from '@/lib/motion';
import { HeroChatDemo } from './HeroChatDemo';
import { HeroPopCards } from './HeroPopCards';

// Real figures from the ingested dataset (REPO_STATUS.md: 25 districts,
// 6,572 listings). Rounded down so the "+" stays honest as data changes.
const STATS = [
  { value: 25, suffix: '', label: 'Districts covered' },
  { value: 6500, suffix: '+', label: 'Places indexed' },
];

const HEADLINE_TOP = ['Plan', 'trips', 'that', 'feel'];
const HEADLINE_BOTTOM = ['handcrafted,', 'not', 'generic.'];

export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll parallax: the photo drifts down and zooms while the copy lifts
  // and fades, which reads as depth without needing separate image layers.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Pointer parallax for the floating cards (-0.5..0.5 across the hero).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const word = (i: number, base = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: base + i * 0.08, ease: EASE_OUT },
  });

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      className="relative min-h-screen overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { y: imageY, scale: imageScale }}
      >
        <Image
          src="/images/hero-mountains.png"
          alt="Mountain landscape at golden hour"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Brand-toned scrim so hero text stays legible while keeping the same palette */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-900/70 via-brand-900/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      {/* 25s aurora: a wide pink/violet gradient slowly sliding across the scene. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-gradient-shift bg-[linear-gradient(115deg,rgba(213,82,163,0.0),rgba(213,82,163,0.28),rgba(92,61,140,0.30),rgba(213,82,163,0.0))] bg-[length:250%_100%] mix-blend-soft-light [animation-duration:25s]"
      />

      <motion.div
        className="relative flex min-h-screen flex-col"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="grid flex-1 items-center gap-10 px-6 pt-28 pb-16 sm:px-10 lg:grid-cols-[1.1fr,0.9fr] lg:px-20 lg:pt-24">
          <div className="max-w-3xl">
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              AI-Powered Travel Planning
            </motion.span>

            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] text-white drop-shadow-sm sm:text-6xl lg:text-7xl">
              <span className="block">
                {HEADLINE_TOP.map((w, i) => (
                  <motion.span key={w} {...word(i, 0.1)} className="mr-[0.25em] inline-block">
                    {w}
                  </motion.span>
                ))}
              </span>
              <span className="block">
                {HEADLINE_BOTTOM.map((w, i) => (
                  <motion.span
                    key={w}
                    {...word(i, 0.1 + HEADLINE_TOP.length * 0.08)}
                    // "handcrafted," gets the looping light sweep; the rest stay calm.
                    className={`mr-[0.25em] inline-block ${i === 0 ? 'text-shimmer' : 'text-brand-200'}`}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: EASE_OUT }}
              className="mt-6 max-w-xl text-lg font-light text-white/90 sm:text-xl"
            >
              Discover destinations, build personalized itineraries, and travel with confidence
              using AI backed by verified local insights.
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: EASE_OUT }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <AuthLaunchButton
                mode="signup"
                className="animate-gradient-shift rounded-2xl bg-[linear-gradient(90deg,#ffffff,#e6dcf2,#f5d0e8,#ffffff)] bg-[length:200%_100%] px-10 py-4 text-lg font-semibold text-brand-800 transition duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                Start Here
              </AuthLaunchButton>
              <a
                href="#destinations"
                className="glass inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-medium text-white transition duration-200 hover:scale-[1.03] hover:bg-white/20 active:scale-[0.98]"
              >
                Explore destinations
              </a>
            </motion.div>

            <motion.dl
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1, ease: EASE_OUT }}
              className="mt-16 flex flex-wrap gap-10"
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <CountUp
                      value={stat.value}
                      suffix={stat.suffix}
                      className="block text-4xl font-semibold text-white sm:text-5xl"
                    />
                    <span className="text-base font-light text-white/80">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Floating decorative cards — visible on larger screens to keep mobile clean */}
          <div className="relative hidden h-[640px] lg:block">
            {/* Chat demo floats like the cards but sits beneath them (they are z-10). */}
            <FloatCard
              mx={mx}
              my={my}
              depth={12}
              floatBy={8}
              delay={0.2}
              from={{ y: 20 }}
              plain
              className="inset-x-0 top-4 z-0 mx-auto w-[600px] max-w-full"
            >
              <HeroChatDemo className="h-[600px] w-full" />
            </FloatCard>
            <HeroPopCards />
          </div>
        </div>

        <a
          href="#destinations"
          aria-label="Scroll to destinations"
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-float text-white/70 transition hover:text-white sm:block"
        >
          <ArrowDown className="h-6 w-6" />
        </a>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-brand-900" />
    </section>
  );
}

/**
 * Outer layer follows the pointer (spring-smoothed parallax, opposite depths
 * make the cards feel like they sit at different distances); inner layer
 * plays the entrance and the idle bob, so the two never fight over `x`/`y`.
 */
function FloatCard({
  mx,
  my,
  depth,
  floatBy,
  delay,
  from,
  plain = false,
  className,
  children,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  floatBy: number;
  delay: number;
  from: { x?: number; y?: number };
  /** Skip the card chrome (padding/background) when the child draws its own. */
  plain?: boolean;
  className: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const x = useSpring(useTransform(mx, [-0.5, 0.5], [-depth, depth]), { stiffness: 60, damping: 18 });
  const y = useSpring(useTransform(my, [-0.5, 0.5], [-depth, depth]), { stiffness: 60, damping: 18 });

  return (
    <motion.div className={`absolute ${className}`} style={reduced ? undefined : { x, y }}>
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9, ...from }}
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, x: 0, y: [0, -floatBy, 0] }
        }
        transition={{
          opacity: { duration: 0.7, delay, ease: EASE_OUT },
          scale: { duration: 0.7, delay, ease: EASE_OUT },
          x: { duration: 0.7, delay, ease: EASE_OUT },
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0 },
        }}
        className={
          plain
            ? undefined
            : 'flex items-center gap-3 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-sm'
        }
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
