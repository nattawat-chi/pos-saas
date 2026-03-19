import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// 1. ดึงข้อมูลสินค้าทั้งหมด (พร้อมสูตรเดิม) และ คลังวัตถุดิบทั้งหมด (เฉพาะของร้านตัวเอง)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;

    const products = await prisma.product.findMany({
      where: { shopId: shopId }, // 🛑 ล็อกให้ดึงเฉพาะเมนูของร้านตัวเอง
      include: {
        category: true,
        recipeItems: { include: { inventoryItem: true } },
      },
    });

    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { shopId: shopId }, // 🛑 ล็อกให้ดึงเฉพาะวัตถุดิบของร้านตัวเอง
    });

    return NextResponse.json({ products, inventoryItems });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

// 2. บันทึกสูตรใหม่
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;
    const { productId, recipes } = await req.json();

    // 🛑 เช็คความปลอดภัยขั้นสูงสุด: ตรวจสอบว่าสินค้านี้เป็นของร้านตัวเองจริงๆ (ป้องกันการแฮ็กแก้สูตรร้านอื่น)
    const targetProduct = await prisma.product.findFirst({
      where: { id: productId, shopId: shopId },
    });

    if (!targetProduct) {
      return NextResponse.json(
        { error: "Forbidden: ไม่พบเมนูนี้ในร้านของคุณ" },
        { status: 403 },
      );
    }

    // ลบสูตรเดิมของสินค้านี้ทิ้งก่อน
    await prisma.recipeItem.deleteMany({
      where: { productId: productId },
    });

    // บันทึกสูตรใหม่เข้าไป (ถ้ามี)
    if (recipes && recipes.length > 0) {
      await prisma.recipeItem.createMany({
        data: recipes.map((r: any) => ({
          productId: productId,
          inventoryItemId: r.inventoryItemId,
          amountRequired: Number(r.amountRequired),
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500 },
    );
  }
}
