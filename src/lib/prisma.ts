// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
  // 1. ดึง URL ของฐานข้อมูล
  const connectionString = process.env.DATABASE_URL;

  // 2. สร้าง Connection Pool ด้วยไลบรารี pg
  const pool = new Pool({ connectionString });

  // 3. นำ Pool ไปแปลงเป็น Prisma Adapter
  const adapter = new PrismaPg(pool as any);

  // 4. โยน adapter เข้าไปตอนสร้าง Client (ไม่ต้องใช้ datasources แล้ว)
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
