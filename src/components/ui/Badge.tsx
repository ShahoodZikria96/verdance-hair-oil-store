import { cn } from '../../lib/format';

type Tone = 'forest' | 'gold' | 'cream' | 'outline';

const tones: Record<Tone, string> = {
  forest: 'bg-forest-800 text-cream-50',
  gold: 'bg-gold text-white',
  cream: 'bg-cream-100 text-forest-800',
  outline: 'border border-forest-300 text-forest-700 bg-transparent',
};

export function Badge({
  children,
  tone = 'forest',
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
