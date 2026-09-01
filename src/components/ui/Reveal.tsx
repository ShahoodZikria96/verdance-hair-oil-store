import { createElement } from 'react';
import { cn } from '../../lib/format';
import { useScrollReveal } from '../../hooks/useScrollReveal';

type RevealTag = 'div' | 'li' | 'section' | 'span' | 'ul' | 'article';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  as?: RevealTag;
}

/** Wraps children in a scroll-triggered fade-up. */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const ref = useScrollReveal<HTMLElement>();
  return createElement(
    as,
    {
      ref,
      className: cn('reveal', className),
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  );
}
