/* eslint-disable no-console */
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─────────────────────────────  Reference data  ─────────────────────────────

const ingredients = [
  { name: 'Coconut Oil', benefit: 'Carries lightweight moisture deep into the hair shaft.' },
  { name: 'Rosemary', benefit: 'Invigorates the scalp and supports a fresh, balanced feel.' },
  { name: 'Amla', benefit: 'Traditionally used to strengthen the look of hair.' },
  { name: 'Argan Oil', benefit: 'Softens, smooths and adds a natural, non-greasy shine.' },
  { name: 'Black Seed', benefit: 'Helps comfort and rebalance the scalp.' },
  { name: 'Vitamin E', benefit: 'Antioxidant support that helps protect the lengths.' },
  { name: 'Peppermint', benefit: 'A cooling tingle that refreshes the scalp.' },
  { name: 'Castor Oil', benefit: 'Rich conditioning agent for the appearance of density.' },
  { name: 'Aloe Vera', benefit: 'Soothes and hydrates a tight, dry scalp.' },
  { name: 'Tea Tree', benefit: 'Helps keep the scalp feeling clean and clear.' },
  { name: 'Jojoba Oil', benefit: 'Closely mirrors skin’s own oils for balanced moisture.' },
  { name: 'Marula Oil', benefit: 'Fast-absorbing oil that floods dry lengths with moisture.' },
  { name: 'Shea', benefit: 'Buttery richness for brittle, over-processed ends.' },
  { name: 'Grapeseed Oil', benefit: 'Featherlight slip with a clean, dry finish.' },
  { name: 'Lavender', benefit: 'A calming aroma for an evening ritual.' },
  { name: 'Camellia', benefit: 'Japanese beauty oil prized for glassy shine.' },
];

const categories = [
  { name: 'Hair Oils', description: 'Cold-pressed botanical oils for scalp and lengths.' },
  { name: 'Scalp Care', description: 'Lighter formulas focused on scalp comfort.' },
  { name: 'Hair Nourishment', description: 'Rich treatments for dry, damaged hair.' },
  { name: 'Best Sellers', description: 'The routines our community reaches for most.' },
];

interface SeedProduct {
  name: string;
  art: string;
  sku: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  shortDescription: string;
  description: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  createdDaysAgo: number;
  categories: string[];
  ingredients: string[];
  benefits: [string, string][];
  usage: [string, string][];
}

const products: SeedProduct[] = [
  {
    name: 'Signature Hair Oil',
    art: 'signature',
    sku: 'VD-SIG-100',
    size: '100 ml',
    price: 38,
    compareAtPrice: 46,
    stock: 120,
    isBestSeller: true,
    createdDaysAgo: 220,
    shortDescription:
      'A lightweight daily oil that absorbs quickly to nourish the scalp and smooth strands from root to tip.',
    description:
      'Our Signature Hair Oil is a considered blend of cold-pressed botanicals chosen for how they work together. Coconut and argan oils carry lightweight moisture deep into the hair shaft, rosemary and black seed support a balanced scalp, and vitamin E helps protect the lengths from daily stress. The result is hair that feels softer, looks glossier and behaves better — without weight or residue.',
    categories: ['Hair Oils', 'Hair Nourishment', 'Best Sellers'],
    ingredients: ['Coconut Oil', 'Rosemary', 'Amla', 'Argan Oil', 'Black Seed', 'Vitamin E'],
    benefits: [
      ['Nourishes and comforts the scalp', 'A calm scalp is where healthy-looking hair begins.'],
      ['Strengthens the look of hair roots', 'Botanical oils support resilience at the root.'],
      ['Adds smoothness and natural shine', 'Argan and camellia leave a soft, glassy finish.'],
      ['Helps tame frizz and flyaways', 'Seals the surface so hair looks polished.'],
    ],
    usage: [
      ['Apply', 'Apply a small amount of oil directly to your scalp and through the lengths.'],
      ['Massage', 'Gently massage your scalp for two to three minutes.'],
      ['Rinse', 'Leave on for at least 30 minutes, or overnight, then wash with a gentle shampoo.'],
    ],
  },
  {
    name: 'Rosemary Growth Oil',
    art: 'rosemary',
    sku: 'VD-ROS-100',
    size: '100 ml',
    price: 42,
    stock: 80,
    createdDaysAgo: 12,
    shortDescription:
      'Rosemary and peppermint invigorate the scalp while nourishing oils support the appearance of density.',
    description:
      'A more concentrated treatment for anyone focused on the look of thickness and density. Rosemary and peppermint create a gentle tingle that signals circulation at the scalp, while castor and argan oils condition without heaviness. Best used two to three times a week as a pre-wash massage.',
    categories: ['Hair Oils', 'Scalp Care'],
    ingredients: ['Rosemary', 'Peppermint', 'Castor Oil', 'Argan Oil', 'Amla', 'Vitamin E'],
    benefits: [
      ['Invigorates and refreshes the scalp', 'A cooling tingle you can feel on contact.'],
      ['Supports the appearance of fuller hair', 'A focused pre-wash ritual for density.'],
      ['Conditions without heaviness', 'Castor oil richness, balanced by argan.'],
      ['Leaves a clean, herbal finish', 'Washes out without residue.'],
    ],
    usage: [
      ['Apply', 'Section dry hair and apply directly to the scalp.'],
      ['Massage', 'Massage for three to five minutes using fingertips.'],
      ['Rinse', 'Leave for 30–60 minutes, then cleanse thoroughly.'],
    ],
  },
  {
    name: 'Balancing Scalp Serum',
    art: 'scalp',
    sku: 'VD-SCP-075',
    size: '75 ml',
    price: 34,
    stock: 65,
    createdDaysAgo: 90,
    shortDescription:
      'A soothing water-light serum with black seed and aloe to calm and rebalance the scalp between washes.',
    description:
      'Not every scalp wants a rich oil. This lighter serum uses black seed, aloe and a touch of tea tree to comfort tightness, flaking and itch without leaving hair looking oily. Apply to the scalp only, on wash day or in between.',
    categories: ['Scalp Care'],
    ingredients: ['Black Seed', 'Aloe Vera', 'Tea Tree', 'Jojoba Oil', 'Vitamin E', 'Rosemary'],
    benefits: [
      ['Soothes dryness and tightness', 'Comfort for a sensitive, reactive scalp.'],
      ['Helps reduce the look of flaking', 'Tea tree keeps the scalp feeling clear.'],
      ['Absorbs quickly, no residue', 'A water-light texture that disappears.'],
      ['Suitable for frequent use', 'Gentle enough for daily application.'],
    ],
    usage: [
      ['Apply', 'Part hair and apply a few drops along the scalp.'],
      ['Massage', 'Massage gently until absorbed.'],
      ['Leave', 'No need to rinse — use daily or as needed.'],
    ],
  },
  {
    name: 'Intensive Repair Oil',
    art: 'repair',
    sku: 'VD-REP-100',
    size: '100 ml',
    price: 46,
    compareAtPrice: 52,
    stock: 90,
    createdDaysAgo: 160,
    shortDescription:
      'Argan, marula and amla deeply condition over-processed hair, restoring softness, slip and shine.',
    description:
      'A richer formula for hair that has been through colour, heat or years of styling. Marula and argan oils flood the lengths with moisture, amla supports strength, and the whole blend melts in as a 30-minute or overnight mask. Focus on mid-lengths and ends.',
    categories: ['Hair Nourishment', 'Hair Oils'],
    ingredients: ['Argan Oil', 'Marula Oil', 'Amla', 'Coconut Oil', 'Shea', 'Vitamin E'],
    benefits: [
      ['Deeply conditions dry, damaged hair', 'Marula and argan restore lost moisture.'],
      ['Restores softness and slip', 'Detangling becomes effortless.'],
      ['Boosts shine and manageability', 'Dull lengths look revived.'],
      ['Helps reduce breakage from styling', 'A weekly buffer against heat and colour.'],
    ],
    usage: [
      ['Apply', 'Apply generously to damp mid-lengths and ends.'],
      ['Comb', 'Comb through and leave for 30 minutes or overnight.'],
      ['Rinse', 'Shampoo twice to remove, condition as usual.'],
    ],
  },
  {
    name: 'Featherlight Finishing Oil',
    art: 'light',
    sku: 'VD-FIN-050',
    size: '50 ml',
    price: 30,
    stock: 140,
    createdDaysAgo: 40,
    shortDescription:
      'A fast-absorbing finishing oil that smooths frizz and adds gloss without any greasy weight.',
    description:
      'The lightest oil in the range, made for finishing rather than treating. Two or three drops smoothed over dry hair tame flyaways, add a soft sheen and protect against humidity. Ideal for fine hair that other oils overwhelm.',
    categories: ['Hair Oils'],
    ingredients: ['Argan Oil', 'Jojoba Oil', 'Grapeseed Oil', 'Vitamin E', 'Rosemary', 'Camellia'],
    benefits: [
      ['Smooths frizz and flyaways', 'A polished finish in seconds.'],
      ['Adds shine without weight', 'No greasy residue, ever.'],
      ['Helps resist humidity', 'Holds a smooth finish through the day.'],
      ['Great for fine hair types', 'Light enough not to flatten.'],
    ],
    usage: [
      ['Warm', 'Warm two to three drops between palms.'],
      ['Smooth', 'Smooth over dry mid-lengths and ends.'],
      ['Refresh', 'Reapply through the day as needed.'],
    ],
  },
  {
    name: 'Signature Oil — Travel Size',
    art: 'travel',
    sku: 'VD-SIG-030',
    size: '30 ml',
    price: 16,
    stock: 200,
    createdDaysAgo: 70,
    shortDescription:
      'A 30 ml version of our best-selling Signature Hair Oil — perfect for travel or a first trial.',
    description:
      'Same formula as the full-size Signature Hair Oil in a cabin-friendly 30 ml bottle. A low-commitment way to start the ritual, or to keep the routine going away from home.',
    categories: ['Hair Oils', 'Best Sellers'],
    ingredients: ['Coconut Oil', 'Rosemary', 'Amla', 'Argan Oil', 'Black Seed', 'Vitamin E'],
    benefits: [
      ['Full-size formula, travel format', 'Nothing changes but the bottle.'],
      ['Cabin-bag friendly', 'Under the 100 ml liquid limit.'],
      ['Ideal for first-time use', 'Try the ritual before committing.'],
      ['Nourishes scalp and lengths', 'The complete Signature blend.'],
    ],
    usage: [
      ['Apply', 'Apply a small amount to scalp and lengths.'],
      ['Massage', 'Massage the scalp for a few minutes.'],
      ['Rinse', 'Leave on as recommended, then wash out.'],
    ],
  },
  {
    name: 'The Complete Ritual Kit',
    art: 'kit',
    sku: 'VD-KIT-001',
    size: 'Set of 3',
    price: 84,
    compareAtPrice: 102,
    stock: 40,
    isBestSeller: true,
    createdDaysAgo: 55,
    shortDescription:
      'Signature Hair Oil, Rosemary Growth Oil and a wooden scalp massager in one considered set.',
    description:
      'Our full ritual in a single box: the daily Signature Hair Oil, the focused Rosemary Growth Oil for pre-wash treatments, and a smooth wooden scalp massager to make every application feel deliberate. Saves 18% versus buying separately.',
    categories: ['Best Sellers', 'Hair Nourishment'],
    ingredients: ['Coconut Oil', 'Rosemary', 'Amla', 'Argan Oil', 'Black Seed', 'Peppermint'],
    benefits: [
      ['A complete weekly routine', 'Daily care plus a focused treatment.'],
      ['Daily care plus focused treatment', 'Two oils for two jobs.'],
      ['Wooden scalp massager included', 'Makes every application deliberate.'],
      ['Better value than buying separately', 'Save 18% versus individual sizes.'],
    ],
    usage: [
      ['Treat', 'Use Rosemary Growth Oil as a pre-wash scalp treatment twice a week.'],
      ['Maintain', 'Use Signature Hair Oil on other days, scalp to ends.'],
      ['Massage', 'Massage with the wooden applicator for a few minutes each time.'],
    ],
  },
  {
    name: 'Overnight Nourish Treatment',
    art: 'overnight',
    sku: 'VD-OVN-100',
    size: '100 ml',
    price: 40,
    stock: 0,
    isFeatured: true,
    createdDaysAgo: 20,
    shortDescription:
      'A slow-release overnight oil with amla and shea that works while you sleep and rinses clean.',
    description:
      'Designed to be left on overnight, this treatment uses a blend of amla, shea and coconut oils that condition slowly over several hours and wash out cleanly in the morning. Use a silk pillowcase or wrap for best results.',
    categories: ['Hair Nourishment'],
    ingredients: ['Amla', 'Shea', 'Coconut Oil', 'Argan Oil', 'Lavender', 'Vitamin E'],
    benefits: [
      ['Conditions slowly overnight', 'Hours of slow-release moisture.'],
      ['Softer hair by morning', 'Wake up to manageable lengths.'],
      ['Calming lavender scent', 'A restful part of an evening routine.'],
      ['Rinses out cleanly', 'No heavy residue in the morning.'],
    ],
    usage: [
      ['Apply', 'Work through dry lengths before bed.'],
      ['Protect', 'Protect your pillow with a wrap or silk case.'],
      ['Rinse', 'Shampoo out in the morning.'],
    ],
  },
];

const reviewSeeds: { productSku: string; author: [string, string]; rating: number; title?: string; comment: string }[] = [
  { productSku: 'VD-SIG-100', author: ['Amara', 'Sesay'], rating: 5, title: 'My hair finally feels healthy', comment: 'Three months of weekly use and my ends are noticeably less dry. It smells subtle and herbal, never greasy.' },
  { productSku: 'VD-SIG-100', author: ['Priya', 'Nair'], rating: 5, title: 'A calm, grounding ritual', comment: 'I use it as a scalp massage on Sunday evenings. Absorbs well and my hair looks glossier by Monday.' },
  { productSku: 'VD-SIG-100', author: ['Daniel', 'Roth'], rating: 4, title: 'Light and effective', comment: 'A little goes a long way. Would love a larger size option, otherwise no complaints.' },
  { productSku: 'VD-REP-100', author: ['Yasmin', 'Ali'], rating: 5, title: 'Bleached ends, revived', comment: 'My bleached ends feel like real hair again. A bottle lasts me about two months.' },
  { productSku: 'VD-REP-100', author: ['Chloe', 'Baker'], rating: 5, comment: 'Rich but not impossible to wash out. Hair is visibly shinier the next day.' },
  { productSku: 'VD-ROS-100', author: ['Leila', 'Kaya'], rating: 5, comment: 'The tingle is lovely and my hairline looks a little fuller after two months.' },
  { productSku: 'VD-ROS-100', author: ['Marcus', 'Tan'], rating: 4, comment: 'Strong rosemary scent that fades after washing. Works well as a pre-wash treatment.' },
  { productSku: 'VD-SCP-075', author: ['Sana', 'Mir'], rating: 5, comment: 'The only thing that has calmed my itchy scalp in winter. Barely-there texture.' },
  { productSku: 'VD-FIN-050', author: ['Nadia', 'Farah'], rating: 5, comment: 'Finally an oil my fine hair can handle. Shiny, never limp.' },
  { productSku: 'VD-KIT-001', author: ['Ola', 'Dahl'], rating: 5, comment: 'Bought as a gift and ended up ordering one for myself. Feels genuinely premium.' },
];

// ─────────────────────────────────  Run  ─────────────────────────────────

async function main() {
  console.log('\u{1F331}  Seeding hair_oil_store…');

  // Clean (child → parent). Safe for a dev database.
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.review.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.productUsageStep.deleteMany(),
    prisma.productBenefit.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productIngredient.deleteMany(),
    prisma.productCategory.deleteMany(),
    prisma.product.deleteMany(),
    prisma.ingredient.deleteMany(),
    prisma.category.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.address.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@verdance.test';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe_Admin123';
  await prisma.user.create({
    data: {
      firstName: process.env.SEED_ADMIN_FIRST_NAME ?? 'Store',
      lastName: process.env.SEED_ADMIN_LAST_NAME ?? 'Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
    },
  });
  console.log(`   admin: ${adminEmail}`);

  // Demo customer
  const customer = await prisma.user.create({
    data: {
      firstName: 'Sam',
      lastName: 'Rivera',
      email: 'customer@verdance.test',
      phone: '+1 555 0100',
      passwordHash: await bcrypt.hash('Customer123', 12),
      role: 'CUSTOMER',
      addresses: {
        create: {
          firstName: 'Sam',
          lastName: 'Rivera',
          phone: '+1 555 0100',
          addressLine1: '24 Botanical Way',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'United States',
          isDefault: true,
        },
      },
    },
  });
  console.log('   customer: customer@verdance.test / Customer123');

  // Ingredients
  const ingredientMap = new Map<string, string>();
  for (const ing of ingredients) {
    const row = await prisma.ingredient.create({
      data: { name: ing.name, slug: slugify(ing.name), benefit: ing.benefit, description: ing.benefit, imageUrl: `ingredient-${slugify(ing.name)}` },
    });
    ingredientMap.set(ing.name, row.id);
  }

  // Categories
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const row = await prisma.category.create({
      data: { name: cat.name, slug: slugify(cat.name), description: cat.description, imageUrl: `category-${slugify(cat.name)}` },
    });
    categoryMap.set(cat.name, row.id);
  }

  // Products
  const skuToId = new Map<string, string>();
  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name),
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        size: p.size,
        price: new Prisma.Decimal(p.price),
        compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice) : null,
        currency: 'USD',
        stockQuantity: p.stock,
        lowStockThreshold: 15,
        isActive: true,
        isFeatured: p.isFeatured ?? false,
        isBestSeller: p.isBestSeller ?? false,
        createdAt: new Date(Date.now() - p.createdDaysAgo * 86_400_000),
        categories: {
          create: p.categories.map((c) => ({ categoryId: categoryMap.get(c)! })),
        },
        ingredients: {
          create: p.ingredients
            .filter((i) => ingredientMap.has(i))
            .map((i) => ({ ingredientId: ingredientMap.get(i)! })),
        },
        benefits: {
          create: p.benefits.map(([title, description], idx) => ({
            title,
            description,
            icon: ['droplet', 'shield', 'sparkle', 'wind'][idx % 4],
            sortOrder: idx,
          })),
        },
        usageSteps: {
          create: p.usage.map(([title, description], idx) => ({
            stepNumber: idx + 1,
            title,
            description,
          })),
        },
        images: {
          create: ['front', 'angle', 'detail', 'botanical'].map((shot, idx) => ({
            imageUrl: `${p.art}-${shot}`,
            altText: `${p.name} — ${shot}`,
            sortOrder: idx,
            isPrimary: idx === 0,
          })),
        },
      },
    });
    skuToId.set(p.sku, created.id);
  }
  console.log(`   ${products.length} products`);

  // A delivered order for the demo customer (enables verified reviews)
  const sigId = skuToId.get('VD-SIG-100')!;
  const repId = skuToId.get('VD-REP-100')!;
  const [sig, rep] = await Promise.all([
    prisma.product.findUniqueOrThrow({ where: { id: sigId } }),
    prisma.product.findUniqueOrThrow({ where: { id: repId } }),
  ]);
  const subtotal = Number(sig.price) + Number(rep.price);
  await prisma.order.create({
    data: {
      orderNumber: 'VD-20260710-SEED01',
      userId: customer.id,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      subtotal: new Prisma.Decimal(subtotal),
      shippingFee: new Prisma.Decimal(0),
      discount: new Prisma.Decimal(0),
      total: new Prisma.Decimal(subtotal),
      currency: 'USD',
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddressSnapshot: JSON.stringify({
        firstName: 'Sam',
        lastName: 'Rivera',
        phone: '+1 555 0100',
        addressLine1: '24 Botanical Way',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'United States',
      }),
      createdAt: new Date(Date.now() - 40 * 86_400_000),
      items: {
        create: [
          { productId: sig.id, productName: sig.name, sku: sig.sku, quantity: 1, unitPrice: sig.price, totalPrice: sig.price },
          { productId: rep.id, productName: rep.name, sku: rep.sku, quantity: 1, unitPrice: rep.price, totalPrice: rep.price },
        ],
      },
      payments: {
        create: {
          provider: 'mock',
          providerRef: 'seed-paid',
          amount: new Prisma.Decimal(subtotal),
          currency: 'USD',
          status: 'PAID',
        },
      },
    },
  });

  // Reviews — one reviewer account per review (respects the one-per-user rule)
  let approvedCount = 0;
  for (const r of reviewSeeds) {
    const productId = skuToId.get(r.productSku);
    if (!productId) continue;
    const email = `${slugify(r.author.join('.'))}@reviews.verdance.test`;
    const reviewer = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        firstName: r.author[0],
        lastName: r.author[1],
        email,
        passwordHash: await bcrypt.hash('Reviewer123', 12),
        role: 'CUSTOMER',
      },
    });
    await prisma.review.create({
      data: {
        productId,
        userId: reviewer.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerified: true,
        isApproved: true,
      },
    });
    approvedCount += 1;
  }

  // Denormalised rating / reviewCount
  for (const [, id] of skuToId) {
    const agg = await prisma.review.aggregate({
      where: { productId: id, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id },
      data: {
        rating: new Prisma.Decimal(agg._avg.rating ?? 0),
        reviewCount: agg._count,
      },
    });
  }
  console.log(`   ${approvedCount} approved reviews`);

  // Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: '10% off your first order',
        discountType: 'PERCENTAGE',
        discountValue: new Prisma.Decimal(10),
        minimumOrderAmount: new Prisma.Decimal(30),
        maximumDiscount: new Prisma.Decimal(20),
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: 'RITUAL5',
        description: '$5 off orders over $40',
        discountType: 'FIXED',
        discountValue: new Prisma.Decimal(5),
        minimumOrderAmount: new Prisma.Decimal(40),
        isActive: true,
      },
    ],
  });
  console.log('   2 coupons (WELCOME10, RITUAL5)');

  await prisma.newsletterSubscriber.create({
    data: { email: 'friend@verdance.test', isSubscribed: true, subscribedAt: new Date() },
  });

  console.log('✅  Seed complete.\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
