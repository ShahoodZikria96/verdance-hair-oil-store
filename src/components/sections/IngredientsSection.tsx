import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { IngredientCard } from './IngredientCard';
import { ingredients } from '../../data/content';

export function IngredientsSection() {
  return (
    <section id="ingredients" className="scroll-mt-24 bg-ivory py-20 lg:py-28">
      <div className="container-px">
        <SectionHeading
          eyebrow="Ingredients"
          title="Powered by Nature"
          subtitle="Six botanical actives, each chosen for a clear purpose — and nothing else along for the ride."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ing, i) => (
            <Reveal key={ing.id} delay={(i % 3) * 70}>
              <IngredientCard ingredient={ing} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
