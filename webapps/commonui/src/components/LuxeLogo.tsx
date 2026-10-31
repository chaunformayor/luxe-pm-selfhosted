import { BRAND } from '@microrealestate/shared';
import { cn } from '../utils';

// Artwork copied from the luxestl.com header logo: the Gateway Arch over a
// small skyline, followed by the LUXE wordmark.

type Tone = 'onDark' | 'onLight';

const TONES: Record<
  Tone,
  { skyline: string; name: string; tagline: string; location: string }
> = {
  onDark: {
    skyline: 'fill-white/15',
    name: 'fill-luxe-gold',
    tagline: 'fill-white/85',
    location: 'fill-luxe-gold/70'
  },
  onLight: {
    skyline: 'fill-luxe-navy/10 dark:fill-white/15',
    name: 'fill-luxe-navy dark:fill-luxe-gold',
    tagline: 'fill-luxe-navy-light dark:fill-white/85',
    location: 'fill-luxe-gold-dark dark:fill-luxe-gold/70'
  }
};

function Skyline({ className }: { className: string }) {
  return (
    <g className={className}>
      <rect x="2" y="51" width="7" height="14" />
      <rect x="3" y="48" width="2" height="3" />
      <rect x="11" y="44" width="6" height="21" />
      <rect x="13" y="41" width="2" height="3" />
      <rect x="19" y="50" width="5" height="15" />
      <rect x="20" y="47" width="2" height="3" />
      <rect x="61" y="48" width="6" height="17" />
      <rect x="63" y="45" width="2" height="3" />
      <rect x="69" y="42" width="8" height="23" />
      <rect x="72" y="38" width="2" height="4" />
      <rect x="79" y="50" width="7" height="15" />
      <rect x="80" y="47" width="2" height="3" />
    </g>
  );
}

function Arch() {
  return (
    <>
      <path
        className="fill-luxe-gold"
        d="M 9,65 C 9,24 32,3 43,3 C 54,3 77,24 77,65 L 71,65 C 71,28 55,9 43,9 C 31,9 15,28 15,65 Z"
      />
      <rect
        className="fill-luxe-gold"
        x="2"
        y="63"
        width="84"
        height="2"
        rx="1"
      />
    </>
  );
}

/** The arch-and-skyline mark on its own, for tight spaces. */
export function LuxeMark({
  tone = 'onLight',
  className
}: {
  tone?: Tone;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 88 66"
      role="img"
      aria-label={BRAND.name}
      className={cn('h-8 w-auto', className)}
    >
      <Skyline className={TONES[tone].skyline} />
      <Arch />
    </svg>
  );
}

/** Full logo: mark, LUXE wordmark, "Property Solutions" and location. */
export function LuxeLogo({
  tone = 'onLight',
  showLocation = true,
  className
}: {
  tone?: Tone;
  showLocation?: boolean;
  className?: string;
}) {
  const colors = TONES[tone];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 264 66"
      role="img"
      aria-label={BRAND.name}
      className={cn('h-12 w-auto', className)}
    >
      <Skyline className={colors.skyline} />
      <Arch />
      <line
        className="stroke-luxe-gold"
        x1="95"
        y1="9"
        x2="95"
        y2="56"
        strokeWidth="0.8"
        strokeOpacity="0.45"
      />
      <text
        className={cn('font-serif', colors.name)}
        x="106"
        y="38"
        fontSize="29"
        fontWeight="700"
        letterSpacing="5"
      >
        LUXE
      </text>
      <text
        className={cn('font-sans', colors.tagline)}
        x="108"
        y="51"
        fontSize="8.5"
        letterSpacing="3"
      >
        PROPERTY SOLUTIONS
      </text>
      {showLocation ? (
        <text
          className={cn('font-sans', colors.location)}
          x="109"
          y="61"
          fontSize="7"
          letterSpacing="1.5"
        >
          {BRAND.location.toUpperCase()}
        </text>
      ) : null}
    </svg>
  );
}
