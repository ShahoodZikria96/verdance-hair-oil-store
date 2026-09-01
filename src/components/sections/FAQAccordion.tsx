import { useId, useState } from 'react';
import { Icon } from '../ui/Icon';
import { cn } from '../../lib/format';
import type { FAQ } from '../../types';

interface FAQAccordionProps {
  items: FAQ[];
  /** Index open by default, or null for all closed. */
  defaultOpen?: number | null;
  allowMultiple?: boolean;
}

export function FAQAccordion({
  items,
  defaultOpen = 0,
  allowMultiple = false,
}: FAQAccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<number>>(
    () => new Set(defaultOpen === null ? [] : [defaultOpen]),
  );

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="divide-y divide-cream-200 border-y border-cream-200">
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const btnId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-forest-700"
              >
                <span className="font-display text-lg text-forest-900">{item.question}</span>
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-forest-200 text-forest-700 transition-transform duration-300 ease-premium',
                    isOpen && 'rotate-180 border-forest-800 bg-forest-800 text-cream-50',
                  )}
                >
                  <Icon name="chevron-down" className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={cn(
                'grid transition-all duration-300 ease-premium',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pr-12 font-sans text-sm leading-relaxed text-charcoal-light">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
