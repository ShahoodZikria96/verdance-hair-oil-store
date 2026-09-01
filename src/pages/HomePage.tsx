import { Hero } from '../components/sections/Hero';
import { TrustStrip } from '../components/sections/TrustStrip';
import { FeaturedProduct } from '../components/sections/FeaturedProduct';
import { WhyChooseUs } from '../components/sections/WhyChooseUs';
import { IngredientsSection } from '../components/sections/IngredientsSection';
import { HairBenefits } from '../components/sections/HairBenefits';
import { HowToUse } from '../components/sections/HowToUse';
import { Testimonials } from '../components/sections/Testimonials';
import { PromoBanner } from '../components/sections/PromoBanner';
import { FAQSection } from '../components/sections/FAQSection';
import { Newsletter } from '../components/sections/Newsletter';
import { CollectionPreview } from '../components/sections/CollectionPreview';

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FeaturedProduct />
      <WhyChooseUs />
      <CollectionPreview />
      <IngredientsSection />
      <HairBenefits />
      <HowToUse />
      <Testimonials />
      <PromoBanner />
      <FAQSection />
      <Newsletter />
    </>
  );
}
