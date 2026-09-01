import { useId } from 'react';
import { cn } from '../../lib/format';

/**
 * Parametric SVG product illustration.
 * Art keys follow `<tone>-<shot>` e.g. "signature-front", "repair-detail".
 * This keeps the catalogue image-free while still looking considered,
 * and can be swapped for real photography by replacing this component.
 */

interface Palette {
  glassTop: string;
  glassBottom: string;
  label: string;
  labelText: string;
  cap: string;
  accent: string;
}

const palettes: Record<string, Palette> = {
  signature: {
    glassTop: '#3a5a44',
    glassBottom: '#182f22',
    label: '#fbf8f1',
    labelText: '#1f3d2b',
    cap: '#1f3d2b',
    accent: '#c9a96a',
  },
  rosemary: {
    glassTop: '#5f8a70',
    glassBottom: '#294637',
    label: '#f5efe1',
    labelText: '#294637',
    cap: '#294637',
    accent: '#8f6f3f',
  },
  scalp: {
    glassTop: '#ece0c8',
    glassBottom: '#d3b482',
    label: '#1f3d2b',
    labelText: '#fbf8f1',
    cap: '#1f3d2b',
    accent: '#b08d57',
  },
  repair: {
    glassTop: '#8f6f3f',
    glassBottom: '#3f2f18',
    label: '#fbf8f1',
    labelText: '#5b4322',
    cap: '#2b2b28',
    accent: '#c9a96a',
  },
  light: {
    glassTop: '#eef0ea',
    glassBottom: '#cfd6c9',
    label: '#fbf8f1',
    labelText: '#426b53',
    cap: '#426b53',
    accent: '#b08d57',
  },
  travel: {
    glassTop: '#3a5a44',
    glassBottom: '#182f22',
    label: '#fbf8f1',
    labelText: '#1f3d2b',
    cap: '#1f3d2b',
    accent: '#c9a96a',
  },
  kit: {
    glassTop: '#3a5a44',
    glassBottom: '#182f22',
    label: '#fbf8f1',
    labelText: '#1f3d2b',
    cap: '#1f3d2b',
    accent: '#c9a96a',
  },
  overnight: {
    glassTop: '#3b4a63',
    glassBottom: '#1e2636',
    label: '#f5efe1',
    labelText: '#2b3550',
    cap: '#1e2636',
    accent: '#c9a96a',
  },
};

const DEFAULT_ART_KEY = 'signature-front';

function parseKey(artKey?: string | null): { tone: string; shot: string; palette: Palette } {
  const key = artKey && artKey.trim() ? artKey.trim() : DEFAULT_ART_KEY;
  // Real image URLs (http/https/data) have no render palette — use the default bottle.
  const safeKey = /^(https?:|data:|\/)/.test(key) ? DEFAULT_ART_KEY : key;
  const [tone = 'signature', shot = 'front'] = safeKey.split('-');
  return { tone, shot, palette: palettes[tone] ?? palettes.signature };
}

interface ProductArtProps {
  /** A render key ("signature-front") — anything falsy or URL-like falls back to a default bottle. */
  artKey?: string | null;
  className?: string;
  /** Adds the surrounding botanical scene regardless of shot. */
  scene?: boolean;
}

export function ProductArt({ artKey, className, scene }: ProductArtProps) {
  const uid = useId().replace(/[:]/g, '');
  const { tone, shot, palette } = parseKey(artKey);
  const withScene = scene || shot === 'botanical';
  const isKit = tone === 'kit';
  const small = tone === 'travel';

  const gGlass = `glass-${uid}`;
  const gShine = `shine-${uid}`;
  const gFloor = `floor-${uid}`;

  return (
    <svg
      viewBox="0 0 600 720"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label="Product illustration"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gGlass} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.glassTop} />
          <stop offset="1" stopColor={palette.glassBottom} />
        </linearGradient>
        <linearGradient id={gShine} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={gFloor} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2b2b28" stopOpacity="0.16" />
          <stop offset="1" stopColor="#2b2b28" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="300" cy="662" rx={isKit ? 210 : 150} ry="24" fill={`url(#${gFloor})`} />

      {withScene && <BotanicalScene accent={palette.accent} />}

      {isKit ? (
        <g>
          <Bottle x={150} scale={0.74} palette={palette} gGlass={gGlass} gShine={gShine} label="ROSEMARY" />
          <Bottle x={300} scale={0.86} palette={palette} gGlass={gGlass} gShine={gShine} label="SIGNATURE" />
          <Bottle x={438} scale={0.7} palette={palette} gGlass={gGlass} gShine={gShine} label="FINISH" />
        </g>
      ) : shot === 'detail' ? (
        <g transform="translate(0,-40) scale(1.5)" transform-origin="300 360">
          <Bottle
            x={300}
            scale={small ? 0.8 : 1}
            palette={palette}
            gGlass={gGlass}
            gShine={gShine}
            label={tone.toUpperCase()}
          />
        </g>
      ) : (
        <g transform={shot === 'angle' ? 'rotate(-8 300 400)' : undefined}>
          {shot === 'angle' && (
            <rect
              x="196"
              y="250"
              width="208"
              height="360"
              rx="6"
              fill={palette.label}
              stroke={palette.accent}
              strokeWidth="1.5"
              transform="translate(150 18) rotate(6 300 430)"
              opacity="0.55"
            />
          )}
          <Bottle
            x={300}
            scale={small ? 0.78 : 1}
            palette={palette}
            gGlass={gGlass}
            gShine={gShine}
            label={tone.toUpperCase()}
          />
        </g>
      )}
    </svg>
  );
}

interface BottleProps {
  x: number;
  scale: number;
  palette: Palette;
  gGlass: string;
  gShine: string;
  label: string;
}

function Bottle({ x, scale, palette, gGlass, gShine, label }: BottleProps) {
  return (
    <g transform={`translate(${x} 360) scale(${scale})`}>
      <g transform="translate(-300 -360)">
        {/* cap */}
        <rect x="266" y="150" width="68" height="46" rx="5" fill={palette.cap} />
        <rect x="272" y="139" width="56" height="16" rx="4" fill={palette.accent} />
        {/* neck */}
        <rect x="278" y="196" width="44" height="34" fill={palette.glassBottom} />
        {/* body */}
        <path
          d="M196 252 C 196 234, 210 232, 244 232 L 356 232 C 390 232, 404 234, 404 252 L 404 596 C 404 640, 372 664, 300 664 C 228 664, 196 640, 196 596 Z"
          fill={`url(#${gGlass})`}
        />
        <path
          d="M196 252 C 196 234, 210 232, 244 232 L 356 232 C 390 232, 404 234, 404 252 L 404 596 C 404 640, 372 664, 300 664 C 228 664, 196 640, 196 596 Z"
          fill={`url(#${gShine})`}
        />
        <path
          d="M214 264 C 214 252, 224 248, 236 248 L 236 632 C 224 628, 214 616, 214 596 Z"
          fill="#ffffff"
          opacity="0.1"
        />
        {/* label */}
        <rect x="232" y="326" width="136" height="212" rx="5" fill={palette.label} />
        <rect
          x="232"
          y="326"
          width="136"
          height="212"
          rx="5"
          fill="none"
          stroke={palette.accent}
          strokeWidth="1.4"
          opacity="0.7"
        />
        <text
          x="300"
          y="372"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="27"
          fontStyle="italic"
          fill={palette.labelText}
        >
          Verdance
        </text>
        <line x1="264" y1="388" x2="336" y2="388" stroke={palette.accent} strokeWidth="1.4" />
        <text
          x="300"
          y="420"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="12"
          letterSpacing="3"
          fill={palette.labelText}
          opacity="0.85"
        >
          {label}
        </text>
        <text
          x="300"
          y="440"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="12"
          letterSpacing="3"
          fill={palette.labelText}
          opacity="0.85"
        >
          HAIR OIL
        </text>
        <g stroke={palette.accent} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9">
          <path d="M300 470 C 289 456, 284 449, 275 446" />
          <path d="M300 470 C 311 456, 316 449, 325 446" />
          <path d="M300 470 L 300 494" />
        </g>
        <text
          x="300"
          y="520"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          letterSpacing="2"
          fill={palette.labelText}
          opacity="0.6"
        >
          NATURAL / VEGAN
        </text>
      </g>
    </g>
  );
}

function BotanicalScene({ accent }: { accent: string }) {
  return (
    <g opacity="0.85">
      <g stroke="#5f8a70" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M120 620 C 150 500, 150 420, 130 340" />
        <path d="M130 400 C 100 380, 86 350, 82 320" />
        <path d="M132 460 C 160 442, 176 414, 180 386" />
        <path d="M480 630 C 452 520, 452 440, 474 360" />
        <path d="M470 420 C 500 400, 514 372, 518 344" />
        <path d="M472 480 C 444 462, 430 436, 426 408" />
      </g>
      <g fill="#8daf98">
        <ellipse cx="80" cy="316" rx="20" ry="9" transform="rotate(-28 80 316)" />
        <ellipse cx="182" cy="382" rx="18" ry="8" transform="rotate(24 182 382)" />
        <ellipse cx="128" cy="336" rx="16" ry="7" transform="rotate(-8 128 336)" />
        <ellipse cx="520" cy="340" rx="20" ry="9" transform="rotate(26 520 340)" />
        <ellipse cx="424" cy="404" rx="18" ry="8" transform="rotate(-24 424 404)" />
        <ellipse cx="476" cy="356" rx="16" ry="7" transform="rotate(8 476 356)" />
      </g>
      <g fill={accent} opacity="0.5">
        <circle cx="150" cy="250" r="4" />
        <circle cx="470" cy="270" r="4" />
        <circle cx="300" cy="150" r="3" />
      </g>
    </g>
  );
}
