-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "finty";

-- CreateEnum
CREATE TYPE "finty"."Role" AS ENUM ('COLABORADOR', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "finty"."ExpenseStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'PAGADO');

-- CreateEnum
CREATE TYPE "finty"."Plan" AS ENUM ('FREE', 'FULL');

-- CreateEnum
CREATE TYPE "finty"."ExpenseAction" AS ENUM ('CREATED', 'UPDATED', 'APPROVED', 'REJECTED', 'PAID');

-- CreateTable
CREATE TABLE "finty"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "finty"."Plan" NOT NULL DEFAULT 'FREE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finty"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" "finty"."Role" NOT NULL DEFAULT 'COLABORADOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finty"."Expense" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "receipt" TEXT,
    "status" "finty"."ExpenseStatus" NOT NULL DEFAULT 'PENDIENTE',
    "comment" TEXT,
    "lineaNegocio" TEXT NOT NULL DEFAULT 'Público',
    "tipoDocumento" TEXT,
    "proveedor" TEXT,
    "numeroDocumento" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'CLP',
    "paidAt" TIMESTAMP(3),
    "paymentRef" TEXT,
    "approvedById" TEXT,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finty"."ExpenseLog" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "action" "finty"."ExpenseAction" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "finty"."Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "finty"."User"("username");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "finty"."User"("organizationId");

-- CreateIndex
CREATE INDEX "Expense_userId_idx" ON "finty"."Expense"("userId");

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "finty"."Expense"("status");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "finty"."Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_organizationId_idx" ON "finty"."Expense"("organizationId");

-- CreateIndex
CREATE INDEX "ExpenseLog_expenseId_idx" ON "finty"."ExpenseLog"("expenseId");

-- AddForeignKey
ALTER TABLE "finty"."User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "finty"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finty"."Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "finty"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finty"."Expense" ADD CONSTRAINT "Expense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "finty"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finty"."ExpenseLog" ADD CONSTRAINT "ExpenseLog_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "finty"."Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
