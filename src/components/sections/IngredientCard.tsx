import { Icon } from '../ui/Icon';
import type { Ingredient } from '../../types';

export function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  return (
    <article className="group flex h-full flex-col rounded-lg border border-cream-200 bg-ivory p-6 transition-all duration-300 ease-premium hover:border-forest-300 hover:shadow-soft">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-700 transition-colors duration-300 group-hover:bg-forest-800 group-hover:text-cream-50">
        <Icon name={ingredient.icon} className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <h3 className="mt-5 font-display text-xl text-forest-900">{ingredient.name}</h3>
      <p className="mt-1.5 font-sans text-sm leading-relaxed text-charcoal-light">
        {ingredient.benefit}
      </p>
    </article>
  );
}
