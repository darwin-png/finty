import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendStatusNotification } from "@/lib/mailer";
import { logExpenseAction } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const isAdmin = session.user.role === "ADMINISTRADOR";
  const orgId = session.user.organizationId;

  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense || expense.organizationId !== orgId) {
    return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
  }

  // Admin: can change status and comment
  if (isAdmin) {
    const { status, comment } = body;

    // State transition validations
    if (status) {
      if (expense.status === "PAGADO") {
        return NextResponse.json({ error: "No se puede modificar un gasto ya pagado" }, { status: 400 });
      }
      if (expense.status === "RECHAZADO" && status === "APROBADO") {
        return NextResponse.json({ error: "No se puede aprobar un gasto rechazado" }, { status: 400 });
      }
      if (expense.status === "APROBADO" && status === "PENDIENTE") {
        return NextResponse.json({ error: "No se puede devolver a pendiente un gasto aprobado" }, { status: 400 });
      }
      if (status === "PAGADO" && expense.status !== "APROBADO") {
        return NextResponse.json({ error: "Solo se pueden marcar como pagados los gastos aprobados" }, { status: 400 });
      }
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (comment !== undefined) data.comment = comment;
    if (status === "APROBADO" || status === "RECHAZADO") {
      data.approvedById = session.user.id;
    }
    if (status === "PAGADO") {
      data.paidAt = new Date();
      data.paymentRef = `PAG-MANUAL-${Date.now()}`;
    }

    const updated = await prisma.expense.update({ where: { id }, data });

    // Audit log
    if (status === "APROBADO") logExpenseAction(id, "APPROVED", session.user.id);
    if (status === "RECHAZADO") logExpenseAction(id, "REJECTED", session.user.id);
    if (status === "PAGADO") logExpenseAction(id, "PAID", session.user.id);

    // Send email notification on approve/reject (fire-and-forget)
    if (status === "APROBADO" || status === "RECHAZADO") {
      const user = await prisma.user.findUnique({ where: { id: expense.userId }, select: { email: true, name: true } });
      if (user?.email) {
        sendStatusNotification(user.email, user.name, status, expense, comment);
      }
    }

    return NextResponse.json(updated);
  }

  // Collaborator: can only edit their own PENDIENTE expenses
  if (expense.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (expense.status !== "PENDIENTE") {
    return NextResponse.json({ error: "Solo se pueden editar gastos pendientes" }, { status: 400 });
  }

  const { date, category, description, amount, receipt, tipoDocumento, proveedor, numeroDocumento } = body;
  const data: Record<string, unknown> = {};
  if (date) data.date = new Date(date);
  if (category) data.category = category;
  if (description !== undefined) data.description = description || null;
  if (amount) data.amount = parseFloat(amount);
  if (receipt !== undefined) data.receipt = receipt || null;
  if (tipoDocumento !== undefined) data.tipoDocumento = tipoDocumento || null;
  if (proveedor !== undefined) data.proveedor = proveedor || null;
  if (numeroDocumento !== undefined) data.numeroDocumento = numeroDocumento || null;

  const updated = await prisma.expense.update({ where: { id }, data });
  logExpenseAction(id, "UPDATED", session.user.id);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const orgId = session.user.organizationId;

  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense || expense.organizationId !== orgId) {
    return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
  }

  if (session.user.role !== "ADMINISTRADOR" && expense.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (expense.status !== "PENDIENTE" && session.user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "Solo se pueden eliminar gastos pendientes" }, { status: 400 });
  }

  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
