import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orgId = req.nextUrl.searchParams.get("organizationId");
  const where = orgId ? { organizationId: orgId } : {};

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      active: true,
      organizationId: true,
      organization: { select: { name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { username, name, password, email, role, organizationId } = await req.json();

  if (!username?.trim() || !name?.trim() || !password || !organizationId) {
    return NextResponse.json(
      { error: "Campos requeridos: username, name, password, organizationId" },
      { status: 400 }
    );
  }

  // Verify org exists
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) {
    return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
  }

  // Check username unique within organization
  const existing = await prisma.user.findFirst({
    where: { username: username.trim(), organizationId }
  });
  if (existing) {
    return NextResponse.json({ error: "Ese nombre de usuario ya existe en esta organización" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const validRoles = new Set(["COLABORADOR", "ADMINISTRADOR"]);
  const userRole = validRoles.has(role) ? role : "COLABORADOR";

  const hashedPassword = await bcryptjs.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username: username.trim(),
      name: name.trim(),
      password: hashedPassword,
      email: email || null,
      role: userRole,
      organizationId,
      active: true,
    },
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

  return NextResponse.json(user, { status: 201 });
}
