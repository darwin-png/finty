import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
    select: { receiptData: true, receiptMime: true, organizationId: true, userId: true },
  });

  if (!expense || expense.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // COLABORADOR can only access their own receipts; ADMINISTRADOR sees all org receipts
  if (
    session.user.role !== "ADMINISTRADOR" &&
    expense.userId !== session.user.id
  ) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (!expense.receiptData || !expense.receiptMime) {
    return NextResponse.json({ error: "Sin archivo" }, { status: 404 });
  }

  return new NextResponse(expense.receiptData, {
    headers: {
      "Content-Type": expense.receiptMime,
      "Cache-Control": "private, max-age=86400",
    },
  });
}
