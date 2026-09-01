import { Reveal } from '../ui/Reveal';
import { Icon } from '../ui/Icon';
import { hairBenefits } from '../../data/content';

export function HairBenefits() {
  return (
    <section id="benefits" className="scroll-mt-24 bg-forest-900 py-20 text-cream-100 lg:py-28">
      <div className="container-px">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <span className="font-sans text-xs font-semibold uppercase tracking-eyebrow text-gold-light">
            Benefits
          </span>
          <h2 className="text-3xl text-cream-50 sm:text-4xl lg:text-[2.75rem]">
            Made for Your Hair Goals
          </h2>
          <p className="max-w-xl font-sans text-base leading-relaxed text-cream-100/70">
            Whatever you&apos;re working towards, there&apos;s a place for oil in the routine.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-cream-100/10 bg-cream-100/10 sm:grid-cols-2 lg:grid-cols-3">
          {hairBenefits.map((b, i) => (
            <Reveal
              key={b.id}
              delay={(i % 3) * 70}
              className="group bg-forest-900 p-8 transition-colors duration-300 hover:bg-forest-800"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-light/40 text-gold-light">
                <Icon name={b.icon} className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 font-display text-xl text-cream-50">{b.title}</h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-cream-100/70">
                {b.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
