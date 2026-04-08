import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const orgId = session.user.organizationId;

  // Verify user belongs to same org
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser || existingUser.organizationId !== orgId) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const { name, username, password, role, active, email } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (username !== undefined && username !== existingUser.username) {
    const taken = await prisma.user.findUnique({ where: { username } });
    if (taken) {
      return NextResponse.json({ error: "Ese nombre de usuario ya está en uso" }, { status: 400 });
    }
    data.username = username;
  }
  if (email !== undefined) data.email = email || null;
  if (role !== undefined) {
    const VALID_ROLES = new Set(["COLABORADOR", "ADMINISTRADOR"]);
    if (!VALID_ROLES.has(role)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }
    data.role = role;
  }
  if (active !== undefined) data.active = active;
  if (password) data.password = await bcryptjs.hash(password, 10);

  // Prevent removing the last admin
  const isDemoting = role === "COLABORADOR" && existingUser.role === "ADMINISTRADOR";
  const isDeactivating = active === false && existingUser.active === true && existingUser.role === "ADMINISTRADOR";

  if (isDemoting || isDeactivating) {
    const adminCount = await prisma.user.count({
      where: {
        organizationId: orgId,
        role: "ADMINISTRADOR",
        active: true,
      },
    });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "No se puede eliminar o degradar al único administrador de la organización" },
        { status: 400 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, username: true, name: true, email: true, role: true, active: true },
  });

  return NextResponse.json(user);
}
