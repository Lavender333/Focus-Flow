import { useMemo } from 'react';

/**
 * A bloom is a fingerprint of one session.
 *
 *   petal count  <-  minutes
 *   color        <-  the tone that was played
 *   openness     <-  the mood
 *   orientation  <-  a hash of the entry id
 *
 * Deterministic. The same entry always produces the same flower, in the same
 * place, forever. That is what makes the garden a record rather than a display.
 *
 * The geometry is phyllotactic: each petal sits at the golden angle (137.507°)
 * from the last. This is the difference between a flower that looks grown and
 * one that looks designed. Even radial spacing gives you a daisy.
 */

const GOLDEN_ANGLE = 137.507764;
const GOLD = '#C59B54';

// Each tone's [light, deep] pair. Outer petals take the deep, inner the light.
const TONE_COLORS: Record<string, [string, string]> = {
  '174': ['#8C5B54', '#3A2320'],
  '285': ['#B0764A', '#402A18'],
  '396': ['#A65A4E', '#38201C'],
  '417': ['#C68B5A', '#45301C'],
  '528': ['#C59B54', '#45361A'],
  '639': ['#4F8F7A', '#1E3A31'],
  '741': ['#5E8AA6', '#22364A'],
  '852': ['#6B6FA6', '#262845'],
  '963': ['#8A6FA0', '#322542'],
};

// Openness furls the petals. A tight bloom holds narrow petals close to the
// heart. An open bloom has wide petals pushed out from a broader center.
const OPENNESS: Record<string, number> = {
  anxious: 0.30,
  tense: 0.42,
  blocked: 0.58,
  tired: 0.72,
  scattered: 0.85,
  focused: 1.0,
  ready: 1.0,
};

// A lotus petal: pointed ovate, widest at ~40% of its length, slight recurve.
// NOT an ellipse. An ellipse reads as clip art.
const PETAL = 'M0 0 C 0.36 -0.20, 0.47 -0.62, 0 -1 C -0.47 -0.62, -0.36 -0.20, 0 0 Z';

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}

interface GardenEntry {
  id: string;
  moodId: string;
  minutes: number;
  frequencyId: string;
  completedAt: string;
}

interface BloomProps {
  entry: GardenEntry;
  size?: number;
  /** True only for a bloom that was just planted. It opens, once. */
  opening?: boolean;
  /** Older blooms sit further back. 0 = oldest, 1 = newest. */
  depth?: number;
}

export function Bloom({ entry, size = 120, opening = false, depth = 1 }: BloomProps) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const petals = useMemo(() => {
    const [light, deep] = TONE_COLORS[entry.frequencyId] ?? TONE_COLORS['639'];
    const open = OPENNESS[entry.moodId] ?? 0.7;
    const seed = hashSeed(entry.id);

    // Petals grow with the length of the session. 7 min -> 8. 25 min -> 18.
    const n = Math.max(8, Math.min(20, Math.round(entry.minutes * 0.55) + 4));

    // Overall scale grows too, but by sqrt, so 25 min is bigger without being
    // three times bigger than 7 min.
    const scale = 0.6 + 0.4 * Math.sqrt(Math.min(entry.minutes, 30) / 30);

    const baseRot = seed % 360;
    const c = size / 2;
    const rMax = size * 0.46 * scale;

    // i = 0 is the outermost petal. Rendered first, so inner petals layer on top.
    return Array.from({ length: n }, (_, i) => {
      const t = i / Math.max(n - 1, 1); // 0 outer, 1 inner
      const angle = baseRot + i * GOLDEN_ANGLE; // phyllotaxis

      const length = rMax * (1.0 - 0.58 * t); // outer long, inner short
      const width = length * (0.34 + 0.34 * open); // openness widens the petal
      const offset = rMax * (0.02 + 0.15 * open) * (1 - 0.6 * t); // and pushes it out

      return {
        key: i,
        // Outer petals dark, inner petals light. Depth from value, never a shadow.
        fill: mix(deep, light, 0.18 + 0.82 * t),
        opacity: (0.8 + 0.2 * t) * (0.4 + 0.6 * depth),
        transform: `translate(${c},${c}) rotate(${angle.toFixed(2)}) translate(0,${(-offset).toFixed(2)}) scale(${width.toFixed(2)},${length.toFixed(2)})`,
        // Closed state, for the opening animation: furled at the center.
        closed: `translate(${c},${c}) rotate(${(baseRot + i * 4).toFixed(2)}) scale(${(width * 0.35).toFixed(2)},${(length * 0.25).toFixed(2)})`,
        // Outer rings open first, inner rings last.
        delay: t * 0.9,
      };
    });
  }, [entry.id, entry.frequencyId, entry.minutes, entry.moodId, size, depth]);

  const rMax = size * 0.46;
  const open = OPENNESS[entry.moodId] ?? 0.7;
  const heartR = rMax * (0.06 + 0.07 * open);

  const shouldAnimate = opening && !reduceMotion;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${entry.minutes} minute session, ${entry.moodId}`}
    >
      {petals.map((p) =>
        shouldAnimate ? (
          <path
            key={p.key}
            d={PETAL}
            fill={p.fill}
            opacity={0}
            transform={p.closed}
          >
            <animate
              attributeName="transform"
              from={p.closed}
              to={p.transform}
              dur="1.4s"
              begin={`${p.delay}s`}
              fill="freeze"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.16 1 0.3 1"
            />
            <animate
              attributeName="opacity"
              from="0"
              to={p.opacity}
              dur="1.4s"
              begin={`${p.delay}s`}
              fill="freeze"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.16 1 0.3 1"
            />
          </path>
        ) : (
          <path
            key={p.key}
            d={PETAL}
            fill={p.fill}
            opacity={p.opacity}
            transform={p.transform}
          />
        )
      )}
      {/* The heart of every bloom is gold, because gold means completion,
          and a bloom is what a completion looks like. */}
      {shouldAnimate ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r="0"
          fill={GOLD}
          opacity="0"
        >
          <animate
            attributeName="r"
            from="0"
            to={heartR}
            dur="0.8s"
            begin="1.1s"
            fill="freeze"
            calcMode="spline"
            keyTimes="0;1"
            keySplines="0.16 1 0.3 1"
          />
          <animate
            attributeName="opacity"
            from="0"
            to="1"
            dur="0.8s"
            begin="1.1s"
            fill="freeze"
            calcMode="spline"
            keyTimes="0;1"
            keySplines="0.16 1 0.3 1"
          />
        </circle>
      ) : (
        <circle cx={size / 2} cy={size / 2} r={heartR} fill={GOLD} />
      )}
    </svg>
  );
}

export default Bloom;
