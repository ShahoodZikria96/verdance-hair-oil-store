import type {
  FAQ,
  HairBenefit,
  Ingredient,
  NavLink,
  Testimonial,
} from '../types';

export const primaryNav: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/#about' },
  { label: 'Ingredients', href: '/#ingredients' },
  { label: 'Benefits', href: '/#benefits' },
  { label: 'Contact', href: '/#contact' },
];

export const trustPoints: { label: string; icon: Ingredient['icon'] }[] = [
  { label: '100% Quality Ingredients', icon: 'leaf' },
  { label: 'Deep Nourishment', icon: 'droplet' },
  { label: 'Suitable for Regular Use', icon: 'refresh' },
  { label: 'Cruelty-Free', icon: 'rabbit' },
];

export const ingredients: Ingredient[] = [
  {
    id: 'coconut',
    name: 'Coconut Oil',
    benefit: 'Carries lightweight moisture deep into the hair shaft.',
    description:
      'Cold-pressed and rich in lauric acid, coconut oil penetrates the strand rather than sitting on top, helping reduce moisture loss.',
    icon: 'droplet',
  },
  {
    id: 'rosemary',
    name: 'Rosemary',
    benefit: 'Invigorates the scalp and supports a fresh, balanced feel.',
    description:
      'A classic hair botanical, rosemary leaf extract brings a clean herbal aroma and a gentle stimulating quality to the scalp.',
    icon: 'leaf',
  },
  {
    id: 'amla',
    name: 'Amla',
    benefit: 'Traditionally used to strengthen the look of hair.',
    description:
      'Indian gooseberry has been used in hair care for centuries and is prized for supporting strength, body and a healthy shine.',
    icon: 'sparkle',
  },
  {
    id: 'argan',
    name: 'Argan Oil',
    benefit: 'Softens, smooths and adds a natural, non-greasy shine.',
    description:
      'High in vitamin E and fatty acids, Moroccan argan oil conditions the lengths and improves manageability without weight.',
    icon: 'sun',
  },
  {
    id: 'blackseed',
    name: 'Black Seed',
    benefit: 'Helps comfort and rebalance the scalp.',
    description:
      'Nigella sativa oil is a soothing, time-honoured ingredient that supports scalp comfort between washes.',
    icon: 'flask',
  },
  {
    id: 'vitamin-e',
    name: 'Vitamin E',
    benefit: 'Antioxidant support that helps protect the lengths.',
    description:
      'A naturally derived antioxidant that helps defend hair against the everyday stress of heat, sun and pollution.',
    icon: 'shield',
  },
];

export const hairBenefits: HairBenefit[] = [
  {
    id: 'nourishment',
    title: 'Hair Nourishment',
    description: 'Replenishes dry, thirsty strands with lightweight botanical moisture.',
    icon: 'droplet',
  },
  {
    id: 'scalp-care',
    title: 'Scalp Care',
    description: 'Soothes and comforts the scalp for a healthier foundation.',
    icon: 'leaf',
  },
  {
    id: 'stronger',
    title: 'Stronger-Looking Hair',
    description: 'Supports the appearance of strength from root to tip.',
    icon: 'shield',
  },
  {
    id: 'shine',
    title: 'Smooth & Shiny Hair',
    description: 'Tames frizz and brings back a soft, natural sheen.',
    icon: 'sparkle',
  },
  {
    id: 'dry-hair',
    title: 'Dry Hair Care',
    description: 'A weekly ritual for brittle ends and over-processed lengths.',
    icon: 'wind',
  },
  {
    id: 'routine',
    title: 'Healthy Hair Routine',
    description: 'An easy, repeatable habit that fits into any week.',
    icon: 'refresh',
  },
];

export const howToUseSteps: { step: string; title: string; text: string }[] = [
  {
    step: '01',
    title: 'Apply',
    text: 'Apply a small amount of oil directly to your scalp and through the lengths of dry or damp hair.',
  },
  {
    step: '02',
    title: 'Massage',
    text: 'Gently massage your scalp with fingertips for a few minutes to help the oil settle in.',
  },
  {
    step: '03',
    title: 'Rinse',
    text: 'Leave it on for at least 30 minutes, or overnight, then wash out with a gentle shampoo.',
  },
];

export const whyChooseUs: { number: string; title: string; text: string }[] = [
  {
    number: '01',
    title: 'Nourishes the Scalp',
    text: 'A comfortable, well-cared-for scalp is where healthy-looking hair begins.',
  },
  {
    number: '02',
    title: 'Strengthens Hair Roots',
    text: 'Botanical oils support the look and feel of resilience at the root.',
  },
  {
    number: '03',
    title: 'Helps Maintain Healthy-Looking Hair',
    text: 'Used weekly, it keeps strands soft, glossy and easier to manage.',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    author: 'Amara S.',
    location: 'London, UK',
    rating: 5,
    quote:
      'I have used a lot of hair oils and this is the first one that never feels heavy. My ends look healthier and the scent is subtle and calming.',
    verified: true,
  },
  {
    id: 't2',
    author: 'Priya N.',
    location: 'Toronto, CA',
    rating: 5,
    quote:
      'The Sunday scalp massage has become my favourite part of the week. My hair looks glossier and my scalp feels far less dry.',
    verified: true,
  },
  {
    id: 't3',
    author: 'Yasmin A.',
    location: 'Dubai, AE',
    rating: 5,
    quote:
      'My bleached lengths finally feel like hair again. A little goes a long way and the bottle lasts for months.',
    verified: true,
  },
  {
    id: 't4',
    author: 'Daniel R.',
    location: 'Berlin, DE',
    rating: 4,
    quote:
      'Clean formula, elegant bottle, and it actually does what it says. Would recommend to anyone starting a hair routine.',
    verified: true,
  },
];

export const faqs: FAQ[] = [
  {
    id: 'f1',
    question: 'How often should I use the hair oil?',
    answer:
      'For most hair types, two to three times a week is ideal. If your hair is very dry or damaged you can use it more often; if it is fine or oil-prone, once a week as a pre-wash treatment is usually enough.',
  },
  {
    id: 'f2',
    question: 'Is it suitable for all hair types?',
    answer:
      'Yes. The Signature Hair Oil is formulated to be lightweight enough for fine hair while still nourishing for thick, curly or coily hair. Adjust the amount you use to suit your hair — a few drops for fine hair, more for dense or long hair.',
  },
  {
    id: 'f3',
    question: 'How long should I leave the oil on?',
    answer:
      'A minimum of 30 minutes allows the oils to absorb. For a deeper treatment, leave it on overnight and wash out in the morning. Always finish with a gentle shampoo.',
  },
  {
    id: 'f4',
    question: 'Can I use it on my scalp?',
    answer:
      'Absolutely — the scalp is the best place to start. Apply directly to the scalp and massage with your fingertips for a few minutes before working the oil through the lengths.',
  },
  {
    id: 'f5',
    question: 'How should I store the product?',
    answer:
      'Keep the bottle tightly closed, away from direct sunlight and heat. A cool bathroom cabinet or bedroom drawer is perfect. Used this way, the oil stays fresh for 12 months after opening.',
  },
  {
    id: 'f6',
    question: 'When can I expect visible results?',
    answer:
      'Hair feels softer and looks shinier from the first use. For changes in the look of strength, smoothness and scalp comfort, most people notice a difference after four to six weeks of consistent use.',
  },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Hair Oil', href: '/shop' },
      { label: 'Best Sellers', href: '/shop?sort=best-selling' },
      { label: 'New Arrivals', href: '/shop?sort=newest' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/#about' },
      { label: 'Ingredients', href: '/#ingredients' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQs', href: '/#faq' },
      { label: 'Shipping & Delivery', href: '/#contact' },
      { label: 'Returns & Refunds', href: '/#contact' },
      { label: 'Privacy Policy', href: '/#contact' },
    ],
  },
];

export const socialLinks: { label: string; href: string; icon: Ingredient['icon'] }[] = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { label: 'TikTok', href: 'https://tiktok.com', icon: 'tiktok' },
];
