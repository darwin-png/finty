import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { name, username, password, email, role, active } = await req.json();

  // Even SuperAdmin should validate user exists via proper query (defense in depth)
  const user = await prisma.user.findFirst({ where: { id } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (username !== undefined && username !== user.username) {
    // Check username unique within organization
    const taken = await prisma.user.findFirst({
      where: { username, organizationId: user.organizationId }
    });
    if (taken) return NextResponse.json({ error: "Username en uso en esta organización" }, { status: 400 });
    data.username = username;
  }
  if (email !== undefined) data.email = email || null;
  if (role !== undefined && ["COLABORADOR", "ADMINISTRADOR", "SUPERADMIN"].includes(role)) {
    data.role = role;
  }
  if (active !== undefined) data.active = active;
  if (password && password.length >= 6) {
    data.password = await bcryptjs.hash(password, 10);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      active: true,
      organizationId: true,
      organization: { select: { name: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  // Validate user exists via proper query (defense in depth)
  const user = await prisma.user.findFirst({ where: { id } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Don't allow deleting if they're the last admin of an org
  if (user.role === "ADMINISTRADOR" && user.organizationId) {
    const adminCount = await prisma.user.count({
      where: { organizationId: user.organizationId, role: "ADMINISTRADOR", active: true },
    });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "No se puede eliminar: es el único admin de esa organización" },
        { status: 400 }
      );
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
