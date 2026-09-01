import type { IconName } from '../../types';

interface IconProps {
  name: IconName;
  className?: string;
  strokeWidth?: number;
  title?: string;
}

/**
 * Single line-icon set drawn on a 24x24 grid with `currentColor` strokes.
 * Keeps the visual language consistent and avoids an icon-font dependency.
 */
const paths: Record<IconName, JSX.Element> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7" />
    </>
  ),
  bag: (
    <>
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.5Z" />,
  'star-half': (
    <>
      <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.5Z" />
      <path d="M12 3.5v13.27l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.5Z" fill="currentColor" stroke="none" />
    </>
  ),
  heart: <path d="M12 20s-7-4.35-9.2-8.2C1.3 9.3 2.3 6 5.5 6c2 0 3.3 1.3 4.5 3 1.2-1.7 2.5-3 4.5-3 3.2 0 4.2 3.3 2.7 5.8C19 15.65 12 20 12 20Z" />,
  'heart-filled': (
    <path
      d="M12 20s-7-4.35-9.2-8.2C1.3 9.3 2.3 6 5.5 6c2 0 3.3 1.3 4.5 3 1.2-1.7 2.5-3 4.5-3 3.2 0 4.2 3.3 2.7 5.8C19 15.65 12 20 12 20Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13h10l1-13" />
    </>
  ),
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'arrow-right': (
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M20 12H4" />
      <path d="m10 6-6 6 6 6" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z" />
      <path d="M5 19c3-6 7-9 11-11" />
    </>
  ),
  droplet: <path d="M12 3.5c3.5 4 6 6.8 6 10.5a6 6 0 0 1-12 0c0-3.7 2.5-6.5 6-10.5Z" />,
  shield: (
    <>
      <path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  rabbit: (
    <>
      <path d="M8 13a4 4 0 0 1 8 0v2a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-2Z" />
      <path d="M9 9C8 6 8 3.5 9.5 3.5S12 6 12 9" />
      <path d="M15 9c1-3 1-5.5 2.5-5.5S19 6 18 9" />
      <path d="M10 14h.01M14 14h.01" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 4c.6 3.5 1.5 4.4 5 5-3.5.6-4.4 1.5-5 5-.6-3.5-1.5-4.4-5-5 3.5-.6 4.4-1.5 5-5Z" />
      <path d="M18.5 14.5c.3 1.6.7 2 2.5 2.5-1.8.5-2.2.9-2.5 2.5-.3-1.6-.7-2-2.5-2.5 1.8-.5 2.2-.9 2.5-2.5Z" />
    </>
  ),
  check: <path d="m5 12 5 5L20 7" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-5.5" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7.5" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </>
  ),
  refresh: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
      <path d="M4 20v-4h4" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  ),
  wind: (
    <>
      <path d="M4 9h9a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M4 14h13a3 3 0 1 1-3 3" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M16.5 7.5h.01" />
    </>
  ),
  facebook: <path d="M14 8h2V5h-2c-2 0-3.5 1.5-3.5 3.5V11H8v3h2.5v6h3v-6H16l.5-3h-3V8.7c0-.4.3-.7.7-.7Z" />,
  tiktok: (
    <>
      <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 6c.8 1.7 2.3 2.8 4 3" />
    </>
  ),
  filter: (
    <>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </>
  ),
};

export function Icon({ name, className = 'w-5 h-5', strokeWidth = 1.6, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
