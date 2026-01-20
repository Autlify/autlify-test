'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence, useTransform } from 'framer-motion';
import { Home, CheckCircle2, Star } from 'lucide-react';
import LiquidGlass from 'liquid-glass-react';
import { set } from 'date-fns';

type SegmentedItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type Props = {
  items: SegmentedItem[];
  value: string;
  onValueChange: (next: string) => void;
  disabled?: boolean;
  className?: string;
  accentClassName?: string; // e.g. "text-amber-400"
};

type Metrics = {
  trackW: number;
  items: { x: number; w: number; h: number; cx: number }[];
};

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function closestIndex(xs: number[], x: number) {
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < xs.length; i++) {
    const d = Math.abs(xs[i] - x);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/**
 * RESTORED + REWORKED (stable base)
 * - No external deps (no clsx/tailwind-merge)
 * - Single LiquidGlass instance wrapping the whole control:
 *     displacement affects whichever object is under the pointer while dragging
 * - Lens overlay:
 *     idle scale ~0.9725, grows on press/drag, resizes to hovered segment
 */
export function LiquidGlassSegmented({
  items,
  value,
  onValueChange,
  disabled,
  className,
  accentClassName = 'text-amber-400',
}: Props) {
  const glassRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [metrics, setMetrics] = React.useState<Metrics | null>(null);

  const selectedIndex = Math.max(0, items.findIndex((i) => i.id === value));
  const [scroll, setScroll] = React.useState(0);
  const [lensIndex, setLensIndex] = React.useState(selectedIndex);
  // Interaction state
  const [pressIndex, setPressIndex] = React.useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [phase, setPhase] = React.useState<'idle' | 'active' | 'release'>('idle');

  // Refs to avoid stale state
  const hoverIndexRef = React.useRef<number | null>(null);
  const movedRef = React.useRef(false);
  const ignoreClickRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const lastXRef = React.useRef<number | null>(null);
  const releaseTimer = React.useRef<number | null>(null);

  // Lens X motion value (center X, relative to track)
  const lensRawX = useMotionValue(0);
  const anchorRawX = useMotionValue(0);
  const lensSpringX = useSpring(lensRawX, { stiffness: 720, damping: 52, mass: 0.6 });
  const lensRenderX = dragging ? lensRawX : lensSpringX;

  const measure = React.useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const tr = track.getBoundingClientRect();

    const next = btnRefs.current
      .map((b) => {
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return {
          x: r.left - tr.left,
          w: r.width,
          h: r.height,
          cx: r.left - tr.left + r.width / 2,
        };
      })
      .filter(Boolean) as Metrics['items'];

    if (next.length) setMetrics({ trackW: tr.width, items: next });
  }, []);

  React.useLayoutEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;

    const ro = new ResizeObserver(() => measure());
    ro.observe(track);

    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [measure]);

  React.useEffect(() => {
    // Park lens at selected when idle
    if (!metrics || phase !== 'idle') return;
    const cx0 = metrics.items[selectedIndex]?.cx ?? 0;
    lensRawX.set(cx0);
    anchorRawX.set(cx0);
    setLensIndex(selectedIndex);
  }, [metrics, selectedIndex, phase, lensRawX, anchorRawX]);

  React.useEffect(() => {
    return () => {
      if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
    };
  }, []);

  const commitIndex = React.useCallback(
    (idx: number) => {
      const nextId = items[idx]?.id;
      if (nextId && nextId !== value) onValueChange(nextId);
    },
    [items, value, onValueChange]
  );

  const beginPress = (idx: number, e: React.PointerEvent) => {
    if (disabled) return;
    if (!metrics) measure();

    if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
    releaseTimer.current = null;

    setPressIndex(idx);
    setHoverIndex(idx);
    hoverIndexRef.current = idx;

    setDragging(false);
    movedRef.current = false;
    ignoreClickRef.current = false;

    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;

    setPhase('active');

    const cx0 = metrics?.items[idx]?.cx;
    if (typeof cx0 === 'number') {
      lensRawX.set(cx0);
      anchorRawX.set(cx0);
    }

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const movePress = (e: React.PointerEvent) => {
    if (pressIndex === null || disabled || !metrics) return;

    const prev = lastXRef.current ?? startXRef.current;
    const deltaFromStart = e.clientX - startXRef.current;
    const deltaStep = Math.abs(e.clientX - prev);
    lastXRef.current = e.clientX;

    if (!movedRef.current && (Math.abs(deltaFromStart) > 4 || deltaStep > 2)) {
      movedRef.current = true;
      setDragging(true);
      ignoreClickRef.current = true;
    }

    if (!movedRef.current) return;

    const track = trackRef.current;
    if (!track) return;
    const tr = track.getBoundingClientRect();

    const xRel = clamp(e.clientX - tr.left, 0, metrics.trackW);
    lensRawX.set(xRel);

    const centers = metrics.items.map((it) => it.cx);
    const hi = closestIndex(centers, xRel);
    hoverIndexRef.current = hi;
    setHoverIndex(hi);
    setLensIndex(hi);
  };

  const endPress = (e: React.PointerEvent) => {
    if (pressIndex === null || disabled || !metrics) return;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const idx = movedRef.current ? (hoverIndexRef.current ?? pressIndex) : pressIndex;

    // Snap lens to committed index for a clean release
    const cx0 = metrics.items[idx]?.cx;
    if (typeof cx0 === 'number') lensRawX.set(cx0);

    commitIndex(idx);

    setPressIndex(null);
    setHoverIndex(null);
    hoverIndexRef.current = null;
    setDragging(false);
    movedRef.current = false;
    lastXRef.current = null;

    setPhase('release');
    releaseTimer.current = window.setTimeout(() => {
      setPhase('idle');
      ignoreClickRef.current = false;
    }, 160);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();

    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = clamp(selectedIndex + dir, 0, items.length - 1);
    commitIndex(next);
  };

  // Active index used for lens sizing while dragging
  const activeIdx = dragging && hoverIndex !== null ? hoverIndex : selectedIndex;

  const segW = metrics?.items[activeIdx]?.w ?? 132;
  const segH = metrics?.items[activeIdx]?.h ?? 64;

  // Lens padding (idle smaller, active larger)
  const idlePadX = 18;
  const idlePadY = 10;
  const activePadX = 28;
  const activePadY = 14;

  const lensW = segW + 22;
  const lensH = segH + 14;

  const IDLE_SCALE = 0.9725; // ~2.75% smaller
  const lensScale =
    phase === 'idle' ? IDLE_SCALE : phase === 'active' ? (dragging ? 1.035 : 1.06) : 0.995;

  const lensCenterX =
    phase === 'idle'
      ? (metrics?.items[selectedIndex]?.cx ?? 0)
      : (metrics ? lensRenderX : 0);

  // Displacement should affect whichever object is interacted when dragging.
  // We do this by applying ONE LiquidGlass over the whole control during drag.
  const displace = phase === 'active' && dragging;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => {
      setScroll((event?.target as any)?.scrollTop)
    })
  }

  return (
    <div className={cx(className, 'lg-wrap')} ref={glassRef} onScroll={handleScroll}>
      <LiquidGlass
        // Hard constraints per your request:
        blurAmount={0}
        elasticity={0.3}
        aberrationIntensity={2}
        saturation={140}
        cornerRadius={50}
        displacementScale={displace ? 120 : 0}
        mouseContainer={glassRef}
        padding="28px"
        className="lg-glass z-100"
        style={{ display: 'inline-block', overflow: 'visible', position: 'relative', zIndex: 100, height: '100%', width: '100%' }}
      >
        <div className="lg-bleed" style={{ margin: '-28px', overflow: 'visible' }}>
        <div
          ref={trackRef}
          className={
            'lg-track relative inline-flex select-none items-stretch rounded-full p-1 ' +
            'border border-white/10 bg-white/7 ' +
            'shadow-[0_6px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] ' +
            (disabled ? 'opacity-60 pointer-events-none' : '')
          }
          style={{ touchAction: 'none' }}
          role="tablist"
          aria-disabled={disabled ? true : undefined}
          onKeyDown={onKeyDown}
        >
          {/* Subtle track sheen (no glow) */}
          <div className="pointer-events-none absolute inset-0 overflow-visible rounded-full">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/4 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
          </div>

          {/* Lens overlay bubble (resizes on drag + idle is slightly smaller). */}
          {metrics && (
            <motion.div
              className="pointer-events-none absolute left-0 top-1/2 z-[5]"
              style={{ x: lensCenterX, translateX: '-50%', translateY: '-50%' }}
              animate={{ width: lensW, height: lensH, scale: lensScale, opacity: phase === 'release' ? 0.92 : 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 46, mass: 0.55 }}
            >
              <div className="lg-lens" />
            </motion.div>
          )}

          {/* Buttons */}
          {items.map((it, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={it.id}
                ref={(el) => {
                  btnRefs.current[idx] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                style={{ touchAction: 'none' }}
                className={cx(
                  'relative z-10 flex h-16 w-[132px] flex-col items-center justify-center gap-1 rounded-full',
                  'px-5 text-xs font-medium tracking-wide transition-colors',
                  isSelected ? accentClassName : 'text-white/75'
                )}
                onPointerDown={(e) => beginPress(idx, e)}
                onPointerMove={movePress}
                onPointerUp={endPress}
                onPointerCancel={endPress}
                onClick={() => {
                  if (disabled) return;
                  if (ignoreClickRef.current) return;
                  onValueChange(it.id);
                }}
              >
                <span className="grid place-items-center">{it.icon}</span>
                <span className="leading-none">{it.label}</span>
              </button>
            );
          })}

          {/* Edge vignette */}
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_-14px_22px_rgba(0,0,0,0.40)]" />
        </div>
        </div>
      </LiquidGlass>

      <style jsx global>{`
        /* Allow LiquidGlass + lens to paint outside without clipping */
        .lg-wrap { overflow: visible; }
        .lg-glass { overflow: visible !important; zIndex: 100 }
        .lg-glass * { overflow: visible; }

        .lg-track {
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          backdrop-filter: blur(22px) saturate(160%);
        }

        /* Lens bubble styling (visual only) */
        .lg-lens {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow:
            0 14px 38px rgba(0, 0, 0, 0.65),
            inset 0 1px 0 rgba(255, 255, 255, 0.20),
            inset 0 -1px 0 rgba(255, 255, 255, 0.10);
          overflow: visible;
          transform: translateZ(0);
        }

        .lg-lens::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 2px;
          background: conic-gradient(
            from 210deg,
            rgba(255, 84, 84, 0.35),
            rgba(255, 189, 86, 0.26),
            rgba(95, 255, 214, 0.28),
            rgba(88, 170, 255, 0.30),
            rgba(187, 88, 255, 0.30),
            rgba(255, 84, 84, 0.35)
          );
          opacity: 0.76;
          filter: blur(0.25px);
          mix-blend-mode: screen;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        .lg-lens::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            radial-gradient(120% 85% at 18% 10%, rgba(255, 255, 255, 0.28), transparent 60%),
            radial-gradient(120% 85% at 88% 85%, rgba(255, 255, 255, 0.10), transparent 62%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default function Demo() {
  const [tab, setTab] = React.useState('automation');

  const items: SegmentedItem[] = React.useMemo(
    () => [
      { id: 'home', label: 'Home', icon: <Home className="h-7 w-7" /> },
      { id: 'automation', label: 'Automation', icon: <CheckCircle2 className="h-7 w-7" /> },
      { id: 'discover', label: 'Discover', icon: <Star className="h-7 w-7" /> },
    ],
    []
  );

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl items-end justify-center px-6 pb-20">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="text-sm text-white/70">LiquidGlass Segmented</div>

          <LiquidGlassSegmented items={items} value={tab} onValueChange={setTab} />

          <div className="text-xs text-white/60">Selected: {tab}</div>
          <div className="text-xs text-white/50 max-w-md text-center">
            Press and hold, drag left/right (displacement follows your finger), release to commit.
          </div>
        </div>
      </div>
    </div>
  );
}
