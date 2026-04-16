import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { getPlanLimits } from "@/lib/plans";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orgId = session.user.organizationId;

  if (!orgId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { organizationId: orgId },
    select: { id: true, username: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orgId = session.user.organizationId;
  const plan = session.user.plan;

  if (!orgId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Check plan user limit
  const limits = getPlanLimits(plan);
  const userCount = await prisma.user.count({ where: { organizationId: orgId, active: true } });
  if (userCount >= limits.maxUsers) {
    return NextResponse.json({ error: `Has alcanzado el límite de ${limits.maxUsers} usuarios de tu plan. Actualiza a Plan Completo.` }, { status: 403 });
  }

  const body = await req.json();
  const { username, name, password, role, email } = body;

  if (!username || !name || !password) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  // Validate role against enum
  const VALID_ROLES = new Set(["COLABORADOR", "ADMINISTRADOR"]);
  const resolvedRole = role && VALID_ROLES.has(role) ? role : "COLABORADOR";

  const user = await prisma.user.create({
    data: {
      username,
      name,
      email: email || null,
      password: hashedPassword,
      role: resolvedRole,
      organizationId: orgId,
    },
    select: { id: true, username: true, name: true, email: true, role: true, active: true },
  });

  return NextResponse.json(user);
}
