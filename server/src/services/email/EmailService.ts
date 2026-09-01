import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Thin abstraction over the mail transport so controllers never touch SMTP.
 * With no SMTP_HOST configured it logs the message (dev-friendly) instead.
 */
class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (!env.SMTP_HOST) return null;
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
      });
    }
    return this.transporter;
  }

  async send(message: EmailMessage): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      logger.info(
        { to: message.to, subject: message.subject },
        '[email:dev] message not sent (no SMTP configured)',
      );
      return;
    }
    await transporter.sendMail({ from: env.SMTP_FROM, ...message });
  }

  // ─── Templated helpers ───────────────────────────────────────────────

  welcome(to: string, firstName: string) {
    return this.send({
      to,
      subject: 'Welcome to Verdance',
      html: `<p>Hi ${firstName},</p><p>Welcome to Verdance. Your hair ritual starts here.</p>`,
    });
  }

  orderConfirmation(
    to: string,
    orderNumber: string,
    total: number,
    currency: string,
    paymentMethod: string = 'CARD',
  ) {
    const payLine =
      paymentMethod === 'COD'
        ? `<p>Payment method: <strong>Cash on Delivery</strong> — please have ${currency} ${total.toFixed(2)} ready for the courier.</p>`
        : `<p>Payment received: ${currency} ${total.toFixed(2)}.</p>`;
    return this.send({
      to,
      subject: `Your Verdance order ${orderNumber} is confirmed`,
      html: `<p>Thank you for your order.</p><p><strong>${orderNumber}</strong> — total ${currency} ${total.toFixed(2)}.</p>${payLine}`,
    });
  }

  orderStatusUpdate(to: string, orderNumber: string, status: string) {
    return this.send({
      to,
      subject: `Update on your Verdance order ${orderNumber}`,
      html: `<p>Your order <strong>${orderNumber}</strong> is now <strong>${status}</strong>.</p>`,
    });
  }

  passwordReset(to: string, resetUrl: string) {
    return this.send({
      to,
      subject: 'Reset your Verdance password',
      html: `<p>Use the link below to reset your password. It expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }
}

export const emailService = new EmailService();
