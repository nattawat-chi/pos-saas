// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // ดึงการตั้งค่า Login มาใช้

export async function GET() {
  try {
    // 1. ตรวจสอบว่าใครล็อกอินอยู่ และอยู่ร้านไหน
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shopId = (session.user as any).shopId;

    // 2. ดึงข้อมูล "เฉพาะของร้านตัวเอง"
    const products = await prisma.product.findMany({
      where: { shopId: shopId }, // <-- SaaS Magic: กรองเอาเฉพาะสินค้าของร้านนี้!
      include: { category: true },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. เช็คสิทธิ์และร้านค้า
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shopId = (session.user as any).shopId;
    const data = await req.json();

    // 2. สร้างสินค้าใหม่ โดยผูกติดกับร้านของคนที่กดสร้าง
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        price: Number(data.price),
        categoryId: data.categoryId,
        shopId: shopId, // <-- SaaS Magic: แปะป้ายว่าสินค้านี้เป็นของร้านไหน!
      },
    });
    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
