import { cn } from '../../lib/format';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h2' | 'h3';
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <Tag className="text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">{title}</Tag>
      {subtitle && (
        <p
          className={cn(
            'font-sans text-base leading-relaxed text-charcoal-light',
            align === 'center' ? 'max-w-xl' : 'max-w-lg',
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
