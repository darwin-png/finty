import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orgId = session.user.organizationId;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = { organizationId: orgId };
  if (userId) where.userId = userId;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, Date>).gte = new Date(from);
    if (to) (where.date as Record<string, Date>).lte = new Date(to + "T23:59:59");
  }

  const [byUser, byCategory, expenses, paidExpenses, summaryByStatus] = await Promise.all([
    prisma.expense.groupBy({
      by: ["userId"],
      where,
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where,
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.findMany({
      where,
      include: { user: { select: { name: true, username: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { ...where, status: "PAGADO" },
      include: { user: { select: { name: true, username: true } } },
      orderBy: { paidAt: "desc" },
    }),
    prisma.expense.groupBy({
      by: ["status"],
      where,
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const users = await prisma.user.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, username: true },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const byUserWithNames = byUser.map((item) => ({
    ...item,
    user: userMap[item.userId],
  }));

  // Group by month
  const byMonth: Record<string, { total: number; count: number }> = {};
  expenses.forEach((exp) => {
    const key = new Date(exp.date).toISOString().slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 };
    byMonth[key].total += exp.amount;
    byMonth[key].count += 1;
  });

  // Group paid expenses by paymentRef
  const paymentsMap = new Map<string, { ref: string; paidAt: string; userId: string; userName: string; total: number; count: number; expenses: typeof paidExpenses }>();
  paidExpenses.forEach((exp) => {
    const ref = exp.paymentRef || "sin-ref";
    const existing = paymentsMap.get(ref);
    if (existing) {
      existing.total += exp.amount;
      existing.count += 1;
      existing.expenses.push(exp);
    } else {
      paymentsMap.set(ref, {
        ref,
        paidAt: exp.paidAt?.toISOString() || "",
        userId: exp.userId,
        userName: exp.user.name,
        total: exp.amount,
        count: 1,
        expenses: [exp],
      });
    }
  });

  const payments = Array.from(paymentsMap.values()).sort((a, b) => b.paidAt.localeCompare(a.paidAt));

  // Build summary totals
  const totalMes = expenses.reduce((s, e) => s + e.amount, 0);
  const statusTotals = Object.fromEntries(
    summaryByStatus.map((s) => [s.status, { total: s._sum.amount || 0, count: s._count }])
  );

  return NextResponse.json({
    summary: {
      totalMes,
      pendiente: statusTotals.PENDIENTE || { total: 0, count: 0 },
      aprobado: statusTotals.APROBADO || { total: 0, count: 0 },
      rechazado: statusTotals.RECHAZADO || { total: 0, count: 0 },
      pagado: statusTotals.PAGADO || { total: 0, count: 0 },
    },
    users,
    byUser: byUserWithNames,
    byCategory,
    byMonth: Object.entries(byMonth)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month)),
    expenses,
    payments,
  });
}
