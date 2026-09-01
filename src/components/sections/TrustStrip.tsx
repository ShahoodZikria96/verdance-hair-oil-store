import { Icon } from '../ui/Icon';
import { trustPoints } from '../../data/content';

export function TrustStrip() {
  return (
    <section className="border-y border-cream-200 bg-cream-50" aria-label="Why customers trust Verdance">
      <div className="container-px">
        <ul className="grid grid-cols-2 divide-cream-200 lg:grid-cols-4 lg:divide-x">
          {trustPoints.map((point, i) => (
            <li
              key={point.label}
              className={`flex items-center gap-3 py-6 lg:justify-center lg:px-6 ${
                i < 2 ? 'border-b border-cream-200 lg:border-b-0' : ''
              } ${i % 2 === 0 ? 'pr-4' : 'pl-4 lg:pl-6'}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forest-200 text-forest-700">
                <Icon name={point.icon} className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="font-sans text-[13px] font-medium leading-tight text-charcoal">
                {point.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
