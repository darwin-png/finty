import { prisma } from "./prisma";
import type { ExpenseAction } from "@/generated/prisma/client";

export async function logExpenseAction(
  expenseId: string,
  action: ExpenseAction,
  userId: string
) {
  await prisma.expenseLog.create({
    data: { expenseId, action, userId },
  });
}
