import { useEffect, useRef, useState, CanvasHTMLAttributes } from 'react';
import { useComputedColorScheme } from '@mantine/core';

export type OrbState =
  | 'connecting'
  | 'working'
  | 'searching'
  | 'solving'
  | 'listening'
  | 'weaving'
  | 'composing'
  | 'breathing'
  | 'shaping';

export interface ThinkingOrbProps extends CanvasHTMLAttributes<HTMLCanvasElement> {
  state?: OrbState;
  size?: number;
  theme?: 'auto' | 'light' | 'dark';
  speed?: number;
  paused?: boolean;
  'aria-label'?: string;
}

interface Dot {
  x: number;
  y: number;
  z: number;
  r: number;
  white: number;
  a?: number;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  white: number;
  a?: number;
  w: number;
}

interface OrbRenderData {
  dots: Dot[];
  lines: Line[];
}

interface OrbBaseOpts {
  nodeN?: number;
  thr?: number;
  signals?: number;
  nodeR?: number;
  nodeRDepth?: number;
  lineW?: number;
  rsPow?: number;
  rMin?: number;
  spread?: number;
  rBase?: number;
  rDepth?: number;
  rBoost?: number;
  inkFar?: number;
  inkSpan?: number;
  orbitN?: number;
  ghostN?: number;
  ghostR?: number;
  ghostA?: number;
  particles?: number;
  partR?: number;
  partRDepth?: number;
  latRings?: number;
  lonDensity?: number;
  moveCount?: number;
  rActive?: number;
  rings?: number;
  strandN?: number;
  turns?: number;
  lanes?: number;
  segs?: number;
  faceOn?: number;
  bandMul?: number;
  wobMul?: number;
  rDot?: number;
  iconD?: number;
  scanMul?: number;
  dimBase?: number;
  rSizeMul?: number;
}

/* -------------------------------------------------------------------------- */
/* Mathematical & Projection Utilities                                        */
/* -------------------------------------------------------------------------- */

function pseudoRandom(seedA: number, seedB: number): number {
  const n = Math.sin(seedA * 12.9898 + seedB * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let fx = x - ix;
  let fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const s00 = pseudoRandom(ix, iy);
  const s10 = pseudoRandom(ix + 1, iy);
  const s01 = pseudoRandom(ix, iy + 1);
  const s11 = pseudoRandom(ix + 1, iy + 1);
  return s00 + (s10 - s00) * fx + (s01 - s00) * fy + (s00 - s10 - s01 + s11) * fx * fy;
}

function fract(val: number): number {
  return val - Math.floor(val);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function fibonacciSphere(i: number, total: number): [number, number, number] {
  const phi = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - 2 * ((i + 0.5) / total);
  const radius = Math.sqrt(1 - y * y);
  const theta = i * phi;
  return [radius * Math.cos(theta), y, radius * Math.sin(theta)];
}

function create3DRotation(
  yaw: number,
  pitch: number,
  cx: number,
  cy: number,
  radius: number
): (x: number, y: number, z: number) => [number, number, number] {
  const sinP = Math.sin(pitch);
  const cosP = Math.cos(pitch);
  const sinY = Math.sin(yaw);
  const cosY = Math.cos(yaw);

  return (x: number, y: number, z: number) => {
    const rx = x * cosY + z * sinY;
    const rz = -x * sinY + z * cosY;
    const ry = y * cosP - rz * sinP;
    const projZ = y * sinP + rz * cosP;
    return [cx + rx * radius, cy - ry * radius, projZ];
  };
}

function scaleSizeFactor(size: number, power = 0.6): number {
  return (size / 300) ** power;
}

function clampNormalizeData(rawDots: Dot[], rawLines: Line[], rMin = 0.3): OrbRenderData {
  const dots: Dot[] = [];
  for (const dot of rawDots) {
    if ((dot.a ?? 1) >= 0.02) {
      dot.r = Math.max(rMin, dot.r);
      dots.push(dot);
    }
  }
  dots.sort((a, b) => a.z - b.z);
  return {
    dots,
    lines: rawLines.filter((line) => (line.a ?? 1) >= 0.02),
  };
}

/* -------------------------------------------------------------------------- */
/* Canvas Drawing Functions                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Colour of one shape. On a dark page it is a grey that gets brighter the closer the shape is. On
 * a light page grey nearly disappears (thin pale lines on white), so the orb is drawn in a deep
 * blue instead, darker for the shapes in front, and a little more opaque.
 */
function shade(whiteRatio: number, alpha: number, isDark: boolean): string {
  const w = Math.min(1, Math.max(0, whiteRatio));
  if (isDark) {
    const channel = Math.round((1 - w) * 255);
    return `rgba(${channel}, ${channel}, ${channel}, ${alpha})`;
  }
  const mix = Math.min(1, w / 0.65);
  const r = Math.round(23 + (59 - 23) * mix);
  const g = Math.round(37 + (130 - 37) * mix);
  const b = Math.round(84 + (246 - 84) * mix);
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha * 1.35)})`;
}

function drawDots(ctx: CanvasRenderingContext2D, dots: Dot[], isDark: boolean): void {
  for (const dot of dots) {
    const alpha = dot.a ?? 1;
    ctx.fillStyle = shade(dot.white, alpha, isDark);
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, isDark ? dot.r : dot.r * 1.25, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLines(ctx: CanvasRenderingContext2D, lines: Line[], isDark: boolean): void {
  for (const line of lines) {
    const alpha = line.a ?? 1;
    ctx.strokeStyle = shade(line.white, alpha, isDark);
    // Thin pale lines vanish on a white page, so they are drawn heavier there.
    ctx.lineWidth = isDark ? line.w : line.w * 1.7;
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();
  }
}

function renderFrame(ctx: CanvasRenderingContext2D, data: OrbRenderData, isDark: boolean): void {
  if (data.lines.length > 0) {
    drawLines(ctx, data.lines, isDark);
  }
  drawDots(ctx, data.dots, isDark);
}

/* -------------------------------------------------------------------------- */
/* Orb Generator Functions                                                    */
/* -------------------------------------------------------------------------- */

/** Mode "web": The Connected Mesh / Network for "connecting" */
function generateWebOrb(size: number, time: number, opts: OrbBaseOpts): OrbRenderData {
  const cx = size / 2;
  const cy = size / 2;
  const sphereRadius = (size / 2) * 0.8 * (opts.spread ?? 1);
  const project = create3DRotation(time * 0.12, 0.32, cx, cy, sphereRadius);
  const scale = scaleSizeFactor(size, opts.rsPow ?? 0.6);

  const nodeCount = opts.nodeN ?? 30;
  const threshold = opts.thr ?? 0.72;
  const baseNodeR = opts.nodeR ?? 1.4;
  const depthNodeR = opts.nodeRDepth ?? 1.8;

  const points: [number, number, number][] = [];
  for (let i = 0; i < nodeCount; i++) {
    const base = fibonacciSphere(i, nodeCount);
    const nx = base[0] + 0.3 * (smoothNoise(i * 0.31 + 9, time * 0.24) - 0.5) * 2;
    const ny = base[1] + 0.3 * (smoothNoise(i * 0.53 + 27, time * 0.21) - 0.5) * 2;
    const nz = base[2] + 0.3 * (smoothNoise(i * 0.77 + 55, time * 0.27) - 0.5) * 2;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    points.push([nx / len, ny / len, nz / len]);
  }

  const lines: Line[] = [];
  const dots: Dot[] = [];

  // Interconnected network lines
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const dz = points[i][2] - points[j][2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist >= threshold) continue;

      const [x1, y1, z1] = project(points[i][0], points[i][1], points[i][2]);
      const [x2, y2, z2] = project(points[j][0], points[j][1], points[j][2]);
      const avgDepth = ((z1 + z2) / 2 + 1) / 2;

      lines.push({
        x1,
        y1,
        x2,
        y2,
        white: 0.42,
        a: (1 - dist / threshold) * (0.3 + 0.55 * avgDepth),
        w: Math.max(0.6, (opts.lineW ?? 0.8) * scale),
      });
    }
  }

  // Node dots
  for (let i = 0; i < nodeCount; i++) {
    const [px, py, pz] = project(points[i][0], points[i][1], points[i][2]);
    const depth = (pz + 1) / 2;
    const pulse = 1 + 0.25 * Math.sin(time * 1.4 + i * 2.7);
    dots.push({
      x: px,
      y: py,
      z: pz,
      r: (baseNodeR + depthNodeR * depth) * pulse * scale,
      white: 0.55 - 0.45 * depth,
    });
  }

  // Signal pulses traversing along nodes
  const signalCount = opts.signals ?? 5;
  for (let s = 0; s < signalCount; s++) {
    const step = Math.floor(time * 0.55 + s * 7.31);
    const startIdx = Math.floor(pseudoRandom(step, s * 3.1 + 1.7) * nodeCount);
    const endIdx = Math.floor(pseudoRandom(step, s * 5.7 + 4.2) * nodeCount);
    if (startIdx === endIdx) continue;

    const progress = fract(time * 0.55 + s * 7.31);
    const sx = lerp(points[startIdx][0], points[endIdx][0], progress);
    const sy = lerp(points[startIdx][1], points[endIdx][1], progress);
    const sz = lerp(points[startIdx][2], points[endIdx][2], progress);
    const len = Math.max(1e-6, Math.sqrt(sx * sx + sy * sy + sz * sz));

    const [sigX, sigY, sigZ] = project(sx / len, sy / len, sz / len);
    const sigDepth = (sigZ + 1) / 2;

    dots.push({
      x: sigX,
      y: sigY,
      z: sigZ,
      r: (baseNodeR * 1.5 + depthNodeR * sigDepth) * scale,
      white: 0.05,
      a: 0.5 + 0.5 * sigDepth,
    });
  }

  return clampNormalizeData(dots, lines, opts.rMin ?? 0.3);
}

/** Fallback generator for other orb modes if referenced */
function generateOrbitOrb(size: number, time: number, opts: OrbBaseOpts): OrbRenderData {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * 0.78;
  const project = create3DRotation(time * 0.35, 0.4, cx, cy, radius);
  const scale = scaleSizeFactor(size, opts.rsPow ?? 0.6);
  const dots: Dot[] = [];

  const count = opts.ghostN ?? 40;
  for (let i = 0; i < count; i++) {
    const [bx, by, bz] = fibonacciSphere(i, count);
    const [px, py, pz] = project(bx, by, bz);
    const d = (pz + 1) / 2;
    dots.push({
      x: px,
      y: py,
      z: pz,
      r: (opts.ghostR ?? 0.9) * scale,
      white: 0.65,
      a: (opts.ghostA ?? 0.5) * d,
    });
  }

  return clampNormalizeData(dots, [], opts.rMin ?? 0.3);
}

/* -------------------------------------------------------------------------- */
/* State and Config Mappings                                                  */
/* -------------------------------------------------------------------------- */

const STATE_MODE_MAP: Record<OrbState, string> = {
  connecting: 'web',
  working: 'orbits',
  searching: 'globe',
  solving: 'rubik',
  listening: 'wave',
  weaving: 'braid',
  composing: 'ribbon',
  breathing: 'ring',
  shaping: 'morph',
};

const MODE_CONFIGS: Record<string, { speed: number; opts: OrbBaseOpts }> = {
  web: {
    speed: 3.315,
    opts: {
      nodeN: 30,
      thr: 0.72,
      signals: 5,
      nodeR: 1.4,
      nodeRDepth: 1.8,
      lineW: 0.8,
      rsPow: 0.6,
      rMin: 0.3,
    },
  },
  orbits: {
    speed: 1.885,
    opts: {
      orbitN: 12,
      ghostN: 40,
      ghostR: 0.9,
      ghostA: 0.5,
      particles: 3,
      partR: 1.2,
      partRDepth: 1.6,
      rsPow: 0.6,
      rMin: 0.3,
    },
  },
};

const DEFAULT_LABELS: Record<OrbState, string> = {
  connecting: 'Connecting to server...',
  working: 'Working...',
  searching: 'Searching...',
  solving: 'Solving...',
  listening: 'Listening...',
  weaving: 'Weaving...',
  composing: 'Composing...',
  breathing: 'Thinking...',
  shaping: 'Shaping...',
};

/* -------------------------------------------------------------------------- */
/* ThinkingOrb Component                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Whether the page is dark right now, read from the attribute Mantine writes on <html>. Some
 * screens (login, sign-up) pin the page to light without changing the saved choice, so the saved
 * Mantine scheme can disagree with what is on screen; the attribute is what the person sees.
 */
function usePageIsDark(fallback: boolean): boolean {
  const read = () =>
    typeof document === 'undefined'
      ? fallback
      : (document.documentElement.getAttribute('data-mantine-color-scheme') ?? '') === 'dark'
        ? true
        : (document.documentElement.getAttribute('data-mantine-color-scheme') ?? '') === 'light'
          ? false
          : fallback;
  const [isDark, setIsDark] = useState(read);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const update = () => setIsDark(read());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mantine-color-scheme'],
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback]);
  return isDark;
}

export const ThinkingOrb = ({
  state = 'connecting',
  size = 64,
  theme = 'auto',
  speed = 1,
  paused = false,
  style,
  'aria-label': ariaLabel,
  ...rest
}: ThinkingOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mantineColorScheme = useComputedColorScheme('light');
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const defaultLabel = DEFAULT_LABELS[state] || 'Connecting...';

  // Determine effective theme (dark vs light)
  const pageIsDark = usePageIsDark(mantineColorScheme === 'dark');
  const isDark = theme === 'dark' ? true : theme === 'light' ? false : pageIsDark;

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Main animation / rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mode = STATE_MODE_MAP[state] || 'web';
    const config = MODE_CONFIGS[mode] || MODE_CONFIGS.web;
    const generator = mode === 'web' ? generateWebOrb : generateOrbitOrb;
    const effectiveSpeed = config.speed * speed;

    const drawAtTime = (tSec: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const data = generator(size, tSec, config.opts);
      renderFrame(ctx, data, isDark);
    };

    // If reduced motion is requested, render a single aesthetic snapshot
    if (reducedMotion) {
      drawAtTime(0.6);
      return;
    }

    let animFrameId = 0;
    let isRunning = false;

    const tick = () => {
      const tSec = (performance.now() / 1000) * effectiveSpeed;
      drawAtTime(tSec);
      if (isRunning) {
        animFrameId = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (!isRunning && !paused) {
        isRunning = true;
        animFrameId = requestAnimationFrame(tick);
      }
    };

    const stop = () => {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
    };

    // Initial frame draw
    drawAtTime((performance.now() / 1000) * effectiveSpeed);

    // Pause when off-screen using IntersectionObserver
    let isIntersecting = true;
    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            isIntersecting = entry.isIntersecting;
            if (isIntersecting && document.visibilityState !== 'hidden') {
              start();
            } else {
              stop();
            }
          })
        : null;

    if (observer) {
      observer.observe(canvas);
    }

    // Pause when document tab is hidden
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else if (isIntersecting) {
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    if (!observer) {
      start();
    }

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [state, size, isDark, speed, paused, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
      style={{
        width: size,
        height: size,
        display: 'block',
        ...style,
      }}
      {...rest}
    />
  );
};
