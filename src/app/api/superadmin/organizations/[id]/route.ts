import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { name, plan, active } = await req.json();

  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (plan !== undefined && (plan === "FREE" || plan === "FULL")) data.plan = plan;
  if (active !== undefined) data.active = active;

  const updated = await prisma.organization.update({
    where: { id },
    data,
    include: { _count: { select: { users: true, expenses: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const org = await prisma.organization.findUnique({
    where: { id },
    include: { _count: { select: { users: true, expenses: true } } },
  });
  if (!org) return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });

  if (org._count.expenses > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${org._count.expenses} rendiciones. Elimínalas primero.` },
      { status: 400 }
    );
  }

  // Delete users first, then org
  await prisma.user.deleteMany({ where: { organizationId: id } });
  await prisma.organization.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
