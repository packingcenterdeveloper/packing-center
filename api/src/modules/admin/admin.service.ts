import type { Order, OrderStatus } from '../../db/schema/index.js';
import * as repo from './admin.repository.js';

export interface AdminDashboard {
  statusCounts: Record<OrderStatus, number>;
  unseenOrders: number;
  revenue: {
    today: number;
    month: number;
    allTime: number;
  };
  orders: {
    today: number;
    month: number;
  };
  latestOrders: Order[];
  lowStock: repo.LowStockItem[];
}

const LOW_STOCK_THRESHOLD = 10;
const LOW_STOCK_LIMIT = 20;
const LATEST_ORDERS_LIMIT = 10;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function startOfTime(): Date {
  // Fecha suficientemente antigua para representar "todo".
  return new Date(2000, 0, 1);
}

export async function getDashboard(): Promise<AdminDashboard> {
  const today = startOfToday();
  const month = startOfMonth();
  const allTime = startOfTime();

  const [
    statusCounts,
    unseenOrders,
    revenueToday,
    revenueMonth,
    revenueAllTime,
    ordersToday,
    ordersMonth,
    latest,
    lowStockItems,
  ] = await Promise.all([
    repo.countByStatus(),
    repo.countUnseen(),
    repo.sumRevenueSince(today),
    repo.sumRevenueSince(month),
    repo.sumRevenueSince(allTime),
    repo.countOrdersSince(today),
    repo.countOrdersSince(month),
    repo.latestOrders(LATEST_ORDERS_LIMIT),
    repo.lowStock(LOW_STOCK_THRESHOLD, LOW_STOCK_LIMIT),
  ]);

  return {
    statusCounts,
    unseenOrders,
    revenue: {
      today: revenueToday,
      month: revenueMonth,
      allTime: revenueAllTime,
    },
    orders: {
      today: ordersToday,
      month: ordersMonth,
    },
    latestOrders: latest,
    lowStock: lowStockItems,
  };
}