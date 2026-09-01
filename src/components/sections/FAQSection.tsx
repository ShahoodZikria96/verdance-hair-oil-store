import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { FAQAccordion } from './FAQAccordion';
import { faqs } from '../../data/content';

export function FAQSection() {
  return (
    <section id="faq" className="scroll-mt-24 bg-cream-50 py-20 lg:py-28">
      <div className="container-px grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionHeading
          eyebrow="Support"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know before your first ritual."
          align="left"
        />
        <Reveal>
          <FAQAccordion items={faqs} />
        </Reveal>
      </div>
    </section>
  );
}
