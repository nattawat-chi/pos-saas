// src/app/api/superadmin/shops/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

async function checkIsSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role?.toUpperCase() !== "SUPERADMIN")
    return false;
  return true;
}

export async function GET() {
  if (!(await checkIsSuperAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const shops = await prisma.shop.findMany({
      include: {
        users: {
          orderBy: { createdAt: "asc" }, // 🛑 ดึงบัญชีแรกที่ถูกสร้าง (เจ้าของร้าน) มาโชว์เสมอ
          take: 1,
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(shops);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch shops" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!(await checkIsSuperAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { shopName, adminName, adminEmail, adminPassword } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (existingUser)
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานในระบบแล้ว" },
        { status: 400 },
      );

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newShop = await tx.shop.create({ data: { name: shopName } });
      const newUser = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          shopId: newShop.id,
        },
      });
      return { shop: newShop, user: newUser };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create shop" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  if (!(await checkIsSuperAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { shopId, shopName, userId, adminName, adminEmail, adminPassword } =
      body;

    if (!shopId)
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });

    // 🛑 ใช้ Transaction เพื่ออัปเดตทั้งตาราง Shop และ User พร้อมกัน
    await prisma.$transaction(async (tx) => {
      // 1. อัปเดตชื่อร้าน
      if (shopName) {
        await tx.shop.update({
          where: { id: shopId },
          data: { name: shopName },
        });
      }

      // 2. อัปเดตข้อมูลผู้ใช้งาน (ถ้ามีการส่ง userId มาให้แก้)
      if (userId) {
        const userDataToUpdate: any = {};
        if (adminName) userDataToUpdate.name = adminName;
        if (adminEmail) userDataToUpdate.email = adminEmail;
        // ถ้ามีการพิมพ์รหัสผ่านใหม่มา ให้เข้ารหัสก่อนบันทึก
        if (adminPassword)
          userDataToUpdate.password = await bcrypt.hash(adminPassword, 10);

        if (Object.keys(userDataToUpdate).length > 0) {
          await tx.user.update({
            where: { id: userId },
            data: userDataToUpdate,
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update shop or user" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await checkIsSuperAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      await tx.user.deleteMany({ where: { shopId: id } });
      await tx.shop.delete({ where: { id: id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete shop" },
      { status: 500 },
    );
  }
}
