import { useState } from 'react';
import { Icon } from '../ui/Icon';

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative bg-forest-900 text-cream-100">
      <div className="container-px flex h-9 items-center justify-center">
        <p className="font-sans text-[11px] font-medium uppercase tracking-eyebrow">
          Complimentary shipping on orders over $50
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-4 p-1 text-cream-100/60 transition-colors hover:text-cream-50"
          aria-label="Dismiss announcement"
        >
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
