import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Rating } from '../ui/Rating';
import { ProductArt } from '../product/ProductArt';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory">
      {/* soft botanical wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-[520px] w-[520px] rounded-full bg-cream-100/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-forest-50 blur-3xl"
      />

      <div className="container-px relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-8 lg:py-24">
        <div className="max-w-xl">
          <p className="eyebrow animate-fade-up">Pure Care. Healthy Hair.</p>
          <h1
            className="mt-5 text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem] animate-fade-up"
            style={{ animationDelay: '60ms' }}
          >
            Nature&apos;s Ritual for Stronger, Healthier Hair
          </h1>
          <p
            className="mt-6 max-w-md font-sans text-base leading-relaxed text-charcoal-light animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            Premium hair oil crafted with carefully selected natural ingredients to nourish
            your scalp, strengthen your roots and bring your hair back to life.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row animate-fade-up"
            style={{ animationDelay: '180ms' }}
          >
            <Button as="link" to="/shop" size="lg">
              Shop Hair Oil
              <Icon name="arrow-right" className="h-4 w-4" />
            </Button>
            <Button as="link" to="/#benefits" size="lg" variant="secondary">
              Explore Benefits
            </Button>
          </div>

          <div
            className="mt-10 flex items-center gap-4 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <Rating value={4.8} size="md" />
            <span className="font-sans text-sm text-charcoal-light">
              <span className="font-semibold text-charcoal">4.8</span> from 2,600+ reviews
            </span>
          </div>
        </div>

        <div className="relative animate-fade-in" style={{ animationDelay: '160ms' }}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl bg-gradient-to-b from-cream-100 to-cream-50 shadow-soft">
            <ProductArt artKey="signature-front" scene className="h-full w-full p-8" />
          </div>

          <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-lg border border-cream-200 bg-ivory px-4 py-3 shadow-lift sm:left-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-50 text-forest-700">
              <Icon name="leaf" className="h-4 w-4" />
            </span>
            <div>
              <p className="font-sans text-xs font-semibold text-charcoal">100% Natural Blend</p>
              <p className="font-sans text-[11px] text-charcoal-muted">Six botanical actives</p>
            </div>
          </div>

          <div className="absolute -right-2 top-6 hidden items-center gap-3 rounded-lg border border-cream-200 bg-ivory px-4 py-3 shadow-lift sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
              <Icon name="rabbit" className="h-4 w-4" />
            </span>
            <div>
              <p className="font-sans text-xs font-semibold text-charcoal">Cruelty-Free</p>
              <p className="font-sans text-[11px] text-charcoal-muted">Always vegan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px relative">
        <Link
          to="/#benefits"
          className="mx-auto flex w-fit flex-col items-center gap-1 pb-6 text-charcoal-muted transition-colors hover:text-forest-800"
        >
          <span className="font-sans text-[10px] uppercase tracking-eyebrow">Scroll</span>
          <Icon name="chevron-down" className="h-4 w-4 animate-bounce" />
        </Link>
      </div>
    </section>
  );
}
