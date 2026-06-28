import { Prisma } from "@feedyruby/database/prisma";
import type { PrismaClientKnownRequestError } from "@feedyruby/database/prisma";
import { PrismaErrorType } from "@feedyruby/database/types/error";

export const isPrismaKnownRequestError = (error: unknown): error is PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError;

export const isSingleUseIdUniqueConstraintError = (error: PrismaClientKnownRequestError): boolean => {
  if (error.code !== PrismaErrorType.UniqueConstraintViolation) {
    return false;
  }

  return Array.isArray(error.meta?.target) && error.meta.target.includes("singleUseId");
};
