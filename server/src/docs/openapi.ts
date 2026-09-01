import { env } from '../config/env';

/**
 * Hand-maintained OpenAPI 3.0 description of the public surface.
 * Served at GET /api/docs (Swagger UI) and GET /api/docs.json.
 */
export const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Verdance Store API',
    version: '1.0.0',
    description:
      'REST API for the Verdance premium hair oil store. Auth uses a short-lived ' +
      'JWT access token (Bearer header or `accessToken` cookie) plus an httpOnly ' +
      'refresh cookie scoped to `/api/auth`.',
  },
  servers: [{ url: `http://localhost:${env.PORT}/api` }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' },
    },
    schemas: {
      SuccessEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {},
          meta: { type: 'object', nullable: true },
        },
      },
      ErrorEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: {} },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/health': { get: { tags: ['Meta'], summary: 'Liveness probe', security: [], responses: { 200: { description: 'OK' } } } },

    '/auth/register': { post: { tags: ['Auth'], summary: 'Create a customer account', security: [] } },
    '/auth/login': { post: { tags: ['Auth'], summary: 'Sign in', security: [] } },
    '/auth/logout': { post: { tags: ['Auth'], summary: 'Sign out (revoke refresh token)' } },
    '/auth/refresh': { post: { tags: ['Auth'], summary: 'Rotate tokens', security: [] } },
    '/auth/me': { get: { tags: ['Auth'], summary: 'Current user' }, put: { tags: ['Auth'], summary: 'Update profile' } },
    '/auth/change-password': { post: { tags: ['Auth'], summary: 'Change password' } },
    '/auth/forgot-password': { post: { tags: ['Auth'], summary: 'Request a reset link', security: [] } },
    '/auth/reset-password': { post: { tags: ['Auth'], summary: 'Reset password with token', security: [] } },

    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        security: [],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'ingredient', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'minRating', in: 'query', schema: { type: 'number' } },
          { name: 'bestSeller', in: 'query', schema: { type: 'boolean' } },
          { name: 'featured', in: 'query', schema: { type: 'boolean' } },
          {
            name: 'sort',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['featured', 'newest', 'price_asc', 'price_desc', 'rating', 'popularity', 'best_selling'],
            },
          },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
      },
      post: { tags: ['Products', 'Admin'], summary: 'Create a product (admin)' },
    },
    '/products/best-seller': { get: { tags: ['Products'], summary: 'Best-selling product', security: [] } },
    '/products/featured': { get: { tags: ['Products'], summary: 'Featured products', security: [] } },
    '/products/{slug}': {
      get: { tags: ['Products'], summary: 'Product detail', security: [] },
    },
    '/products/{slug}/related': { get: { tags: ['Products'], summary: 'Related products', security: [] } },
    '/products/{slug}/reviews': {
      get: { tags: ['Reviews'], summary: 'Approved reviews for a product', security: [] },
      post: { tags: ['Reviews'], summary: 'Submit a review (customer)' },
    },
    '/products/{id}': {
      put: { tags: ['Products', 'Admin'], summary: 'Update a product (admin)' },
      delete: { tags: ['Products', 'Admin'], summary: 'Delete/deactivate a product (admin)' },
    },
    '/products/{id}/stock': { patch: { tags: ['Products', 'Admin'], summary: 'Set stock quantity (admin)' } },

    '/categories': {
      get: { tags: ['Categories'], summary: 'List categories', security: [] },
      post: { tags: ['Categories', 'Admin'], summary: 'Create (admin)' },
    },
    '/categories/{slug}': { get: { tags: ['Categories'], summary: 'Category detail', security: [] } },
    '/categories/{id}': {
      put: { tags: ['Categories', 'Admin'], summary: 'Update (admin)' },
      delete: { tags: ['Categories', 'Admin'], summary: 'Delete/deactivate (admin)' },
    },

    '/ingredients': {
      get: { tags: ['Ingredients'], summary: 'List ingredients', security: [] },
      post: { tags: ['Ingredients', 'Admin'], summary: 'Create (admin)' },
    },
    '/ingredients/{slug}': { get: { tags: ['Ingredients'], summary: 'Ingredient detail', security: [] } },
    '/ingredients/{id}': {
      put: { tags: ['Ingredients', 'Admin'], summary: 'Update (admin)' },
      delete: { tags: ['Ingredients', 'Admin'], summary: 'Delete (admin)' },
    },

    '/cart': {
      get: { tags: ['Cart'], summary: 'Get the current cart (server-calculated totals)' },
      delete: { tags: ['Cart'], summary: 'Clear the cart' },
    },
    '/cart/items': { post: { tags: ['Cart'], summary: 'Add an item' } },
    '/cart/items/{itemId}': {
      put: { tags: ['Cart'], summary: 'Update item quantity' },
      delete: { tags: ['Cart'], summary: 'Remove an item' },
    },
    '/cart/merge': { post: { tags: ['Cart'], summary: 'Merge a guest cart on login' } },

    '/wishlist': { get: { tags: ['Wishlist'], summary: 'List wishlist' } },
    '/wishlist/{productId}': {
      post: { tags: ['Wishlist'], summary: 'Add to wishlist' },
      delete: { tags: ['Wishlist'], summary: 'Remove from wishlist' },
    },

    '/addresses': {
      get: { tags: ['Addresses'], summary: 'List addresses' },
      post: { tags: ['Addresses'], summary: 'Create an address' },
    },
    '/addresses/{id}': {
      put: { tags: ['Addresses'], summary: 'Update an address' },
      delete: { tags: ['Addresses'], summary: 'Delete an address' },
    },
    '/addresses/{id}/default': { patch: { tags: ['Addresses'], summary: 'Set as default' } },

    '/orders/payment-options': {
      get: {
        tags: ['Orders'],
        summary: 'Available payment methods (Cash on Delivery / Card) and their rules',
      },
    },
    '/orders': {
      get: { tags: ['Orders'], summary: 'List my orders' },
      post: {
        tags: ['Orders'],
        summary:
          'Place an order. `paymentMethod` is COD (default) or CARD. Server recalculates every total; COD is validated against COD_MAX_ORDER.',
      },
    },
    '/orders/{id}': { get: { tags: ['Orders'], summary: 'Order detail' } },
    '/orders/by-number/{orderNumber}': { get: { tags: ['Orders'], summary: 'Order detail by number' } },
    '/orders/{id}/cancel': { post: { tags: ['Orders'], summary: 'Cancel an order (restores stock)' } },

    '/coupons/validate': { post: { tags: ['Coupons'], summary: 'Validate a code + preview discount', security: [] } },

    '/newsletter/subscribe': { post: { tags: ['Newsletter'], summary: 'Subscribe', security: [] } },
    '/newsletter/unsubscribe': { post: { tags: ['Newsletter'], summary: 'Unsubscribe', security: [] } },

    '/admin/dashboard': { get: { tags: ['Admin'], summary: 'Dashboard statistics' } },
    '/admin/analytics': { get: { tags: ['Admin'], summary: 'Sales analytics' } },
    '/admin/orders': { get: { tags: ['Admin'], summary: 'List all orders' } },
    '/admin/orders/{id}': { get: { tags: ['Admin'], summary: 'Order detail' } },
    '/admin/orders/{id}/status': { patch: { tags: ['Admin'], summary: 'Update order status' } },
    '/admin/orders/{id}/payment-status': { patch: { tags: ['Admin'], summary: 'Update payment status' } },
    '/admin/customers': { get: { tags: ['Admin'], summary: 'List customers' } },
    '/admin/customers/{id}': { get: { tags: ['Admin'], summary: 'Customer detail' } },
    '/admin/customers/{id}/status': { patch: { tags: ['Admin'], summary: 'Activate / deactivate' } },
    '/admin/reviews': { get: { tags: ['Admin'], summary: 'List reviews for moderation' } },
    '/admin/reviews/{id}/approve': { patch: { tags: ['Admin'], summary: 'Approve a review' } },
    '/admin/reviews/{id}/reject': { patch: { tags: ['Admin'], summary: 'Unpublish a review' } },
    '/admin/coupons': {
      get: { tags: ['Admin'], summary: 'List coupons' },
      post: { tags: ['Admin'], summary: 'Create a coupon' },
    },
    '/admin/coupons/{id}': {
      put: { tags: ['Admin'], summary: 'Update a coupon' },
      delete: { tags: ['Admin'], summary: 'Deactivate a coupon' },
    },
    '/admin/newsletter': { get: { tags: ['Admin'], summary: 'List subscribers' } },
  },
} as const;
