import { useEffect, useRef, useState } from 'react';

/**
 * The Focus Flow mark: a strike and a decay.
 *
 * Fast attack, long exponential fall, never touching the line.
 * It is the bell, the pulse in the hand, and the arc of a session.
 *
 * Usage:
 *   <BrandMark />                          // static, gold on transparent
 *   <BrandMark animate size={96} />        // strikes once, then rests
 *   <BrandMark tone="sage" size={24} />    // small, quiet
 *
 * Per the never list: this does not appear during a session.
 * The brand disappears when the thing is in use.
 */

const PATH = 'M18 74 L31 18 C42 20 48 44 56 55 C65 64 74 68 86 71';

const TONES = {
  gold: '#C59B54',
  sage: '#4F8F7A',
  ink: '#23312C',
  light: '#E8EFEB',
} as const;

// Stroke weight thickens as the canvas shrinks, so the mark survives at 16px.
function strokeFor(size: number): number {
  if (size >= 128) return 7;
  if (size >= 64) return 8;
  if (size >= 32) return 10;
  return 13;
}

interface BrandMarkProps {
  size?: number;
  tone?: keyof typeof TONES;
  animate?: boolean;
  /** Draws a faint line beneath, marking the silence the decay approaches. */
  baseline?: boolean;
  className?: string;
}

export function BrandMark({
  size = 64,
  tone = 'gold',
  animate = false,
  baseline = false,
  className,
}: BrandMarkProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const [struck, setStruck] = useState(!animate);

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!pathRef.current) return;
    setLength(pathRef.current.getTotalLength());
  }, []);

  useEffect(() => {
    if (!animate || !length) return;
    if (reduceMotion) {
      setStruck(true);
      return;
    }
    // One frame of settle, then strike.
    const id = requestAnimationFrame(() => setStruck(true));
    return () => cancelAnimationFrame(id);
  }, [animate, length, reduceMotion]);

  const color = TONES[tone];
  const width = strokeFor(size);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Focus Flow"
    >
      {baseline && (
        <line
          x1="18"
          y1="82"
          x2="86"
          y2="82"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.28}
        />
      )}
      <path
        ref={pathRef}
        d={PATH}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animate && length
            ? {
                strokeDasharray: length,
                strokeDashoffset: struck ? 0 : length,
                // The attack is a snap. The decay takes its time.
                // 120ms of rise, then 1.6s of falling away.
                transition: struck
                  ? `stroke-dashoffset 1.72s cubic-bezier(0.06, 0.9, 0.2, 1)`
                  : 'none',
              }
            : undefined
        }
      />
    </svg>
  );
}

/**
 * The launch sequence. Renders once, on cold open, and then never again.
 *
 *   const [opened, setOpened] = useState(false);
 *   if (!opened) return <LaunchMark onDone={() => setOpened(true)} />;
 */
export function LaunchMark({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Strike: 1.72s. Rest: 400ms. Fade: 600ms.
    const rest = setTimeout(() => setFading(true), 2120);
    const done = setTimeout(onDone, 2720);
    return () => {
      clearTimeout(rest);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-app-bg"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 600ms ease-out',
      }}
    >
      <BrandMark size={128} tone="gold" animate />
    </div>
  );
}

export default BrandMark;
