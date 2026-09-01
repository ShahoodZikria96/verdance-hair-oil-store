export interface Review {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  size: string;
  category: string;
  badges: string[];
  images: string[];
  ingredients: string[];
  benefits: string[];
  howToUse: string[];
  inStock: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  reviews: Review[];
}

export type ProductCategory = 'Hair Oil' | 'Scalp Care' | 'Treatment' | 'Kits';

export interface Ingredient {
  id: string;
  name: string;
  benefit: string;
  description: string;
  icon: IconName;
}

export interface HairBenefit {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface Testimonial {
  id: string;
  author: string;
  location: string;
  rating: number;
  quote: string;
  verified: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface CartLine {
  /** Server cart-item id (present only for authenticated carts). */
  lineId?: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
  /** Max units available (server carts only). */
  maxAvailable?: number;
}

export type IconName =
  | 'search'
  | 'user'
  | 'bag'
  | 'menu'
  | 'close'
  | 'star'
  | 'star-half'
  | 'heart'
  | 'heart-filled'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'chevron-down'
  | 'chevron-right'
  | 'arrow-right'
  | 'arrow-left'
  | 'leaf'
  | 'droplet'
  | 'shield'
  | 'rabbit'
  | 'sparkle'
  | 'check'
  | 'check-circle'
  | 'truck'
  | 'refresh'
  | 'flask'
  | 'sun'
  | 'wind'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'filter';
