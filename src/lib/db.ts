import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPragmasApplied: boolean | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// SQLite resilience for local/dev use, where Prisma Studio or a second dev
// server may hold the database open at the same time. WAL mode (which lets
// reads and writes proceed concurrently) is set persistently on the database
// file itself, so it only needs busy_timeout here: a transient lock then waits
// up to 5s instead of failing a write with "database is locked" (which
// surfaced to users as "Failed to create account" on signup).
// queryRawUnsafe is used because PRAGMA returns a result row; runs once per
// process and is non-fatal on failure.
if (!globalForPrisma.prismaPragmasApplied) {
  globalForPrisma.prismaPragmasApplied = true;
  void (async () => {
    try {
      await db.$queryRawUnsafe("PRAGMA busy_timeout=5000;");
    } catch (err) {
      console.warn("Could not apply SQLite busy_timeout pragma:", err);
    }
  })();
}
