import { Icon } from '../ui/Icon';
import { Rating } from '../ui/Rating';
import type { Testimonial } from '../../types';

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-lg border border-cream-200 bg-ivory p-7">
      <Rating value={testimonial.rating} size="md" />
      <blockquote className="mt-4 flex-1 font-sans text-[15px] leading-relaxed text-charcoal-light">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-cream-100 pt-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-800 font-display text-sm text-cream-50">
          {testimonial.author.charAt(0)}
        </span>
        <div>
          <p className="font-sans text-sm font-semibold text-charcoal">{testimonial.author}</p>
          <p className="font-sans text-xs text-charcoal-muted">{testimonial.location}</p>
        </div>
        {testimonial.verified && (
          <span className="ml-auto flex items-center gap-1 font-sans text-[11px] font-medium text-forest-700">
            <Icon name="check-circle" className="h-3.5 w-3.5" />
            Verified
          </span>
        )}
      </figcaption>
    </figure>
  );
}
