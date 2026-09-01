import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { howToUseSteps } from '../../data/content';

export function HowToUse() {
  return (
    <section className="bg-cream-50 py-20 lg:py-28">
      <div className="container-px">
        <SectionHeading
          eyebrow="The Ritual"
          title="How To Use"
          subtitle="Three simple steps, two or three evenings a week."
        />

        <ol className="relative mt-16 grid gap-12 lg:grid-cols-3 lg:gap-8">
          {/* connecting line — desktop */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-cream-300 lg:block"
          />
          {howToUseSteps.map((step, i) => (
            <Reveal
              as="li"
              key={step.step}
              delay={i * 90}
              className="relative flex gap-5 lg:flex-col lg:gap-6"
            >
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-forest-800 bg-cream-50 font-display text-xl text-forest-900">
                {step.step}
              </span>
              <div className="lg:pr-6">
                <h3 className="font-display text-xl text-forest-900">{step.title}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal-light">
                  {step.text}
                </p>
              </div>
              {/* connecting line — mobile */}
              {i < howToUseSteps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-7 top-14 h-full w-px bg-cream-300 lg:hidden"
                />
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
