// src/app/api/setup-inventory/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. สร้างวัตถุดิบลงคลัง: เมล็ดกาแฟ 1000g (1kg) และ แก้ว 100 ใบ
    const coffeeBeans = await prisma.inventoryItem.create({
      data: { name: "เมล็ดกาแฟคั่วกลาง", quantity: 1000, unit: "g" },
    });
    const cups = await prisma.inventoryItem.create({
      data: { name: "แก้วพลาสติก 16oz", quantity: 100, unit: "ใบ" },
    });

    // 2. หาเมนู Espresso (ดึงเมนูแรกในร้านมาใช้ทดสอบ)
    const firstProduct = await prisma.product.findFirst();
    if (!firstProduct)
      return NextResponse.json({ error: "ไม่พบเมนูในร้าน กรุณาสร้างเมนูก่อน" });

    // 3. ผูกสูตร: 1 แก้ว ใช้เมล็ดกาแฟ 18g และใช้แก้ว 1 ใบ
    await prisma.recipeItem.createMany({
      data: [
        {
          productId: firstProduct.id,
          inventoryItemId: coffeeBeans.id,
          amountRequired: 18,
        },
        {
          productId: firstProduct.id,
          inventoryItemId: cups.id,
          amountRequired: 1,
        },
      ],
    });

    return NextResponse.json({
      message: "สร้างคลังสินค้าและผูกสูตรสำเร็จ!",
      product: firstProduct.name,
    });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
