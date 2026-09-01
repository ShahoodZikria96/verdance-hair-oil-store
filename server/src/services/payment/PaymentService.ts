import type { PaymentMethod } from '@prisma/client';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';

export interface PaymentIntentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface PaymentIntentResult {
  provider: string;
  reference: string;
  /**
   * PENDING  — awaiting collection (COD) or an async gateway callback
   * PAID     — funds captured
   * FAILED   — declined
   */
  status: 'PENDING' | 'PAID' | 'FAILED';
  /** URL to redirect the customer to, when the provider is redirect-based. */
  redirectUrl?: string;
  raw?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  /** Does this provider settle at checkout (CARD) or later (COD)? */
  readonly capturesAtCheckout: boolean;
  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verifyWebhook(
    payload: unknown,
    signature?: string,
  ): Promise<{ reference: string; status: 'PAID' | 'FAILED' }>;
}

/**
 * Cash on Delivery — no money moves online. The order is confirmed immediately
 * and the payment sits PENDING until the courier collects cash on delivery
 * (an admin marks it PAID, or it flips automatically when the order is
 * marked DELIVERED — see order.service.adminUpdateStatus).
 */
class CashOnDeliveryProvider implements PaymentProvider {
  readonly name = 'cod';
  readonly capturesAtCheckout = false;

  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    logger.info(
      { orderNumber: input.orderNumber, amount: input.amount },
      '[payment:cod] order placed — cash to be collected on delivery',
    );
    return {
      provider: this.name,
      reference: `cod_${input.orderId}`,
      status: 'PENDING',
      raw: { method: 'COD', collectOnDelivery: true, amount: input.amount },
    };
  }

  async verifyWebhook(): Promise<{ reference: string; status: 'PAID' | 'FAILED' }> {
    // COD has no gateway webhook; settlement is recorded by staff.
    return { reference: 'cod', status: 'PAID' };
  }
}

/**
 * Development card provider — simulates an online capture so the full flow is
 * visible. Swap for Stripe / PayFast / JazzCash / Easypaisa by implementing
 * PaymentProvider and registering it below under its own key.
 */
class MockCardProvider implements PaymentProvider {
  readonly name = 'mock';
  readonly capturesAtCheckout = true;
  private static AUTO_COMPLETE = true;

  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    logger.info({ orderNumber: input.orderNumber }, '[payment:mock] card intent created');
    return {
      provider: this.name,
      reference: `mock_${input.orderId}`,
      status: MockCardProvider.AUTO_COMPLETE ? 'PAID' : 'PENDING',
      raw: { simulated: true },
    };
  }

  async verifyWebhook(): Promise<{ reference: string; status: 'PAID' | 'FAILED' }> {
    return { reference: 'mock', status: 'PAID' };
  }
}

const cod = new CashOnDeliveryProvider();
const providers: Record<string, PaymentProvider> = {
  cod,
  mock: new MockCardProvider(),
  // stripe: new StripeProvider(),
  // payfast: new PayfastProvider(),
};

/** The online/card provider configured via PAYMENT_PROVIDER. */
export function getPaymentProvider(): PaymentProvider {
  return providers[env.PAYMENT_PROVIDER] ?? providers.mock;
}

/** Resolve the provider for a chosen checkout method. */
export function getPaymentProviderForMethod(method: PaymentMethod): PaymentProvider {
  return method === 'COD' ? cod : getPaymentProvider();
}

export const isCodEnabled = () => env.COD_ENABLED;
export const codMaxOrder = () => env.COD_MAX_ORDER;
export const codFee = () => env.COD_FEE;
