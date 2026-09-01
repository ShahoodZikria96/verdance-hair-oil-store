import { prisma } from '../lib/prisma';
import { toNumber } from '../utils/money';

const PAID = { paymentStatus: 'PAID' as const };

export const dashboardService = {
  async overview() {
    const [
      revenueAgg,
      orderCount,
      pendingOrders,
      completedOrders,
      customerCount,
      productCount,
      lowStock,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({ where: PAID, _sum: { total: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true, stockQuantity: { lte: prisma.product.fields.lowStockThreshold } },
        select: { id: true, name: true, sku: true, stockQuantity: true, lowStockThreshold: true },
        orderBy: { stockQuantity: 'asc' },
        take: 10,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          currency: true,
          customerEmail: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalRevenue: toNumber(revenueAgg._sum.total) ?? 0,
      totalOrders: orderCount,
      pendingOrders,
      completedOrders,
      totalCustomers: customerCount,
      totalProducts: productCount,
      lowStockCount: lowStock.length,
      lowStockProducts: lowStock,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: toNumber(o.total)!,
        createdAt: o.createdAt.toISOString(),
      })),
    };
  },

  async analytics(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [orders, bestSellers, statusBreakdown] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: since }, paymentStatus: 'PAID' },
        select: { total: true, createdAt: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: { order: { createdAt: { gte: since } } },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 8,
      }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
    ]);

    const salesByDate = new Map<string, { orders: number; revenue: number }>();
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      const entry = salesByDate.get(key) ?? { orders: 0, revenue: 0 };
      entry.orders += 1;
      entry.revenue += toNumber(o.total)!;
      salesByDate.set(key, entry);
    }

    return {
      rangeDays: days,
      revenueSummary: {
        total: orders.reduce((s, o) => s + toNumber(o.total)!, 0),
        orderCount: orders.length,
        averageOrderValue:
          orders.length > 0
            ? orders.reduce((s, o) => s + toNumber(o.total)!, 0) / orders.length
            : 0,
      },
      salesByDate: [...salesByDate.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v })),
      bestSellingProducts: bestSellers.map((b) => ({
        productId: b.productId,
        productName: b.productName,
        unitsSold: b._sum.quantity ?? 0,
        revenue: toNumber(b._sum.totalPrice) ?? 0,
      })),
      ordersByStatus: statusBreakdown.map((s) => ({ status: s.status, count: s._count })),
    };
  },
};
