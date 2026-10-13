import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";

const ORDER_INCLUDE = {
  items: {
    include: {
      variant: { include: { product: { include: { images: true } } } },
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof ORDER_INCLUDE;
}>;

export async function getOrdersForUser(userId: string): Promise<OrderWithItems[]> {
  return db.order.findMany({
    where: { userId },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(
  id: string,
  options?: { userId?: string },
): Promise<OrderWithItems | null> {
  return db.order.findFirst({
    where: { id, ...(options?.userId ? { userId: options.userId } : {}) },
    include: ORDER_INCLUDE,
  });
}

export async function getOrderWithItems(id: string): Promise<OrderWithItems | null> {
  return db.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
}

export async function getOrderByStripeSessionId(
  stripeSessionId: string,
): Promise<OrderWithItems | null> {
  return db.order.findUnique({
    where: { stripeSessionId },
    include: ORDER_INCLUDE,
  });
}

export async function getAllOrders(params?: {
  status?: string;
  page?: number;
  perPage?: number;
}): Promise<{ orders: OrderWithItems[]; total: number }> {
  const perPage = params?.perPage ?? 20;
  const page = Math.max(1, params?.page ?? 1);
  const where: Prisma.OrderWhereInput = params?.status
    ? { status: params.status }
    : {};

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.order.count({ where }),
  ]);

  return { orders, total };
}
