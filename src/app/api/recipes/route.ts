import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. ดึงข้อมูลสินค้าทั้งหมด (พร้อมสูตรเดิม) และ คลังวัตถุดิบทั้งหมด
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        recipeItems: { include: { inventoryItem: true } },
      },
    });
    const inventoryItems = await prisma.inventoryItem.findMany();

    return NextResponse.json({ products, inventoryItems });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

// 2. บันทึกสูตรใหม่ (ลบของเก่าทิ้งแล้วสร้างใหม่ เพื่อป้องกันข้อมูลซ้ำซ้อน)
export async function POST(req: Request) {
  try {
    const { productId, recipes } = await req.json();

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
