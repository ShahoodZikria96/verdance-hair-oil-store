import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { buildPageMeta } from '../utils/pagination';

export const newsletterService = {
  async subscribe(email: string) {
    const row = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, isSubscribed: true, subscribedAt: new Date() },
      update: { isSubscribed: true, subscribedAt: new Date(), unsubscribedAt: null },
    });
    return { email: row.email, isSubscribed: row.isSubscribed };
  },

  async unsubscribe(email: string) {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (!existing) return { email, isSubscribed: false };
    const row = await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isSubscribed: false, unsubscribedAt: new Date() },
    });
    return { email: row.email, isSubscribed: row.isSubscribed };
  },

  async list(query: { subscribed?: 'true' | 'false'; page: number; limit: number }) {
    const where: Prisma.NewsletterSubscriberWhereInput = {};
    if (query.subscribed) where.isSubscribed = query.subscribed === 'true';
    const [rows, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);
    return { subscribers: rows, meta: buildPageMeta(total, query.page, query.limit) };
  },
};
