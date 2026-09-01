import { Reveal } from '../ui/Reveal';
import { Button } from '../ui/Button';
import { ProductArt } from '../product/ProductArt';
import { whyChooseUs } from '../../data/content';

export function WhyChooseUs() {
  return (
    <section id="about" className="scroll-mt-24 bg-cream-50 py-20 lg:py-28">
      <div className="container-px grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-forest-800 to-forest-950 shadow-soft">
            <ProductArt artKey="repair-angle" scene className="aspect-[4/5] w-full p-10" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/70 to-transparent p-6">
              <p className="font-display text-lg text-cream-50">
                &ldquo;A few honest ingredients, thoughtfully combined.&rdquo;
              </p>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <span className="eyebrow">Why Choose Us</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">Simple Ingredients. Thoughtful Care.</h2>
            <p className="mt-4 max-w-lg font-sans text-base leading-relaxed text-charcoal-light">
              We believe good hair care should be uncomplicated. Every Verdance oil is built
              around a short list of botanical actives — each one chosen for a clear reason,
              nothing added for show. No silicones, no mineral oil, no synthetic fragrance.
              Just a considered blend that respects your hair and your routine.
            </p>
          </Reveal>

          <ul className="mt-10 space-y-8">
            {whyChooseUs.map((item, i) => (
              <Reveal as="li" key={item.number} delay={i * 80} className="flex gap-5">
                <span className="font-display text-3xl text-gold">{item.number}</span>
                <div className="border-l border-cream-300 pl-5">
                  <h3 className="font-display text-xl text-forest-900">{item.title}</h3>
                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-charcoal-light">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={120}>
            <Button as="link" to="/shop" className="mt-10">
              Discover the Range
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
