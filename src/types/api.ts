/** Shapes returned by the backend API (see server/src/services/*.mapper.ts). */

export interface ApiImage {
  id?: string;
  imageUrl: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ApiProductCard {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  size: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  inStock: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  badges: string[];
  categories: { name: string; slug: string }[];
  images: ApiImage[];
  createdAt: string;
}

export interface ApiReview {
  id: string;
  author: string;
  rating: number;
  title?: string | null;
  body: string;
  date: string;
  verified: boolean;
}

export interface ApiProductDetail extends Omit<ApiProductCard, 'categories'> {
  description: string;
  isActive: boolean;
  categories: { id: string; name: string; slug: string }[];
  ingredients: { id: string; name: string; slug: string; benefit: string }[];
  benefits: { id: string; title: string; description: string; icon: string | null }[];
  usageSteps: { stepNumber: number; title: string; description: string }[];
  reviews: ApiReview[];
  updatedAt: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  productCount: number;
}

export interface ApiCartLine {
  id: string;
  productId: string;
  slug: string;
  name: string;
  sku: string;
  size: string | null;
  image: string | null;
  unitPrice: number;
  priceAtAddition: number;
  quantity: number;
  lineTotal: number;
  inStock: boolean;
  stockQuantity: number;
  maxAvailable: number;
}

export interface ApiCart {
  id: string;
  items: ApiCartLine[];
  itemCount: number;
  currency: string;
  freeShippingThreshold: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface ApiOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type PaymentMethod = 'COD' | 'CARD';

export interface ApiPaymentOption {
  code: PaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
  fee: number;
  maxOrderAmount: number | null;
}

export interface ApiPaymentOptions {
  currency: string;
  methods: ApiPaymentOption[];
}

export interface ApiCurrency {
  code: string;
  name: string;
  symbol: string;
  /** Units of this currency per 1 unit of the base currency. */
  rate: number;
}

export interface ApiCurrencyList {
  base: string;
  currencies: ApiCurrency[];
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  isGuest: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: PaymentMethod;
  currency: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode: string | null;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  shippingAddress: Omit<ApiAddress, 'id' | 'isDefault'>;
  items: ApiOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiCouponPreview {
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discount: number;
  newSubtotal: number;
}

export interface ApiWishlistEntry {
  id: string;
  addedAt: string;
  product: ApiProductCard;
}

// ── Admin ───────────────────────────────────────────────────────────────

export interface AdminDashboard {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    lowStockThreshold: number;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    status: ApiOrder['status'];
    paymentStatus: ApiOrder['paymentStatus'];
    total: number;
    currency: string;
    customerEmail: string;
    createdAt: string;
  }[];
}

export interface AdminAnalytics {
  rangeDays: number;
  revenueSummary: { total: number; orderCount: number; averageOrderValue: number };
  salesByDate: { date: string; orders: number; revenue: number }[];
  bestSellingProducts: {
    productId: string | null;
    productName: string;
    unitsSold: number;
    revenue: number;
  }[];
  ordersByStatus: { status: ApiOrder['status']; count: number }[];
}

export interface AdminCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  _count: { orders: number; reviews: number };
  addresses?: ApiAddress[];
}

export interface AdminReview {
  id: string;
  productId: string;
  product?: { name: string; slug: string };
  author: string;
  rating: number;
  title?: string | null;
  body: string;
  verified: boolean;
  approved: boolean;
  date: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isSubscribed: boolean;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
}
