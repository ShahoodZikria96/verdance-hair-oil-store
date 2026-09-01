import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { TestimonialCard } from './TestimonialCard';
import { testimonials } from '../../data/content';

export function Testimonials() {
  return (
    <section className="bg-ivory py-20 lg:py-28" aria-labelledby="reviews-heading">
      <div className="container-px">
        <SectionHeading
          eyebrow="Reviews"
          title="What Our Customers Say"
          subtitle="Thousands of considered routines, one honest oil."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={(i % 4) * 70}>
              <TestimonialCard testimonial={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
