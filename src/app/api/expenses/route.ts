import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanLimits } from "@/lib/plans";
import { logExpenseAction } from "@/lib/audit";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const isAdmin = session.user.role === "ADMINISTRADOR";
  const orgId = session.user.organizationId;

  const where: Record<string, unknown> = { organizationId: orgId };

  if (!isAdmin) {
    where.userId = session.user.id;
  }

  const userId = searchParams.get("userId");
  if (isAdmin && userId) {
    where.userId = userId;
  }

  const status = searchParams.get("status");
  if (status) {
    where.status = status;
  }

  const category = searchParams.get("category");
  if (category) {
    where.category = category;
  }

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, Date>).gte = new Date(from);
    if (to) (where.date as Record<string, Date>).lte = new Date(to + "T23:59:59");
  }

  const expenses = await prisma.expense.findMany({
    where,
    omit: { receiptData: true },
    include: { user: { select: { name: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const orgId = session.user.organizationId;
  const plan = session.user.plan;

  // Check plan limits
  const limits = getPlanLimits(plan);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthCount = await prisma.expense.count({
    where: { organizationId: orgId, createdAt: { gte: startOfMonth } },
  });
  if (monthCount >= limits.maxExpensesPerMonth) {
    return NextResponse.json({ error: "Has alcanzado el límite de rendiciones de tu plan. Actualiza a Plan Completo para continuar." }, { status: 403 });
  }

  const body = await req.json();
  const { date, category, description, amount, receipt, receiptBase64, receiptMime, tipoDocumento, proveedor, numeroDocumento } = body;

  if (!date || !category || !amount) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  if (receiptMime && !ALLOWED_MIME_TYPES.has(receiptMime)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido" },
      { status: 400 }
    );
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        category,
        description: description || null,
        amount: parseFloat(amount),
        receipt: receipt || null,
        receiptData: receiptBase64 ? Buffer.from(receiptBase64, "base64") : null,
        receiptMime: receiptMime || null,
        tipoDocumento: tipoDocumento || null,
        proveedor: proveedor || null,
        numeroDocumento: numeroDocumento || null,
        userId: session.user.id,
        organizationId: orgId,
      },
    });

    logExpenseAction(expense.id, "CREATED", session.user.id);

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Error al crear rendición" }, { status: 500 });
  }
}
