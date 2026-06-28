import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { PrismaClient } from "@feedyruby/database/prisma";

export const prisma = mockDeep<PrismaClient>();

vi.mock("@feedyruby/database", () => ({
  __esModule: true,
  prisma,
}));

beforeEach(() => {
  mockReset(prisma);
});
