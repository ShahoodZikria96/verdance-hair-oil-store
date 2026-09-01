import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';

export function PromoBanner() {
  return (
    <section className="relative overflow-hidden bg-forest-950 py-24 text-center lg:py-32">
      {/* subtle botanical texture */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 800 400"
      >
        <g stroke="#c9a96a" strokeWidth="1.5" fill="none">
          <path d="M-20 340 C 120 200 120 120 60 20" />
          <path d="M80 360 C 220 220 220 140 160 40" />
          <path d="M760 60 C 620 200 620 280 680 380" />
          <path d="M860 80 C 720 220 720 300 780 400" />
        </g>
        <g fill="#8daf98">
          <ellipse cx="70" cy="60" rx="22" ry="9" transform="rotate(-30 70 60)" />
          <ellipse cx="150" cy="120" rx="20" ry="8" transform="rotate(-20 150 120)" />
          <ellipse cx="700" cy="360" rx="22" ry="9" transform="rotate(30 700 360)" />
          <ellipse cx="640" cy="290" rx="20" ry="8" transform="rotate(20 640 290)" />
        </g>
      </svg>

      <Reveal className="container-px relative">
        <span className="font-sans text-xs font-semibold uppercase tracking-eyebrow text-gold-light">
          A Better Routine
        </span>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl leading-tight text-cream-50 sm:text-4xl lg:text-[3rem]">
          Healthy Hair Starts With the Right Ritual.
        </h2>
        <p className="mx-auto mt-5 max-w-lg font-sans text-base leading-relaxed text-cream-100/70">
          Join over 40,000 people who have made Verdance part of their weekly self-care.
        </p>
        <Button as="link" to="/shop" size="lg" className="mt-9 bg-cream-50 text-forest-900 hover:bg-white">
          Shop Now
        </Button>
      </Reveal>
    </section>
  );
}
