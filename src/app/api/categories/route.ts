// src/app/api/categories/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

// 1. ดึงข้อมูล (Read)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const categories = await prisma.category.findMany({
      where: { shopId: (session.user as any).shopId },
      orderBy: { name: "asc" }, // เรียงตามตัวอักษรให้ด้วย
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// 2. สร้างใหม่ (Create)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const newCategory = await prisma.category.create({
      data: {
        name: body.name,
        shopId: (session.user as any).shopId,
      },
    });
    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

// 3. แก้ไข (Update)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // updateMany เพื่อบังคับเช็คว่าต้องเป็น id นี้ และต้องเป็นของ shopId นี้เท่านั้น
    await prisma.category.updateMany({
      where: {
        id: body.id,
        shopId: (session.user as any).shopId,
      },
      data: { name: body.name },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// 4. ลบ (Delete)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.category.deleteMany({
      where: {
        id: id,
        shopId: (session.user as any).shopId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    // ถ้าลบไม่ได้ มักจะเกิดจากมี "สินค้า" ผูกติดอยู่กับหมวดหมู่นี้
    return NextResponse.json(
      { error: "Cannot delete category because it has products linked to it." },
      { status: 500 },
    );
  }
}
