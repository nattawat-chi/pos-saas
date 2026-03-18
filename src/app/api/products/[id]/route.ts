// src/app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    // แกะค่า params ด้วย await เพื่อรองรับ Next.js เวอร์ชันใหม่
    const params = await context.params;

    await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    // แกะค่า params ด้วย await เพื่อรองรับ Next.js เวอร์ชันใหม่
    const params = await context.params;

    const body = await req.json();
    const { name, price, categoryId } = body;

    // ใช้คำสั่ง update ของ Prisma เพื่อแก้ไขข้อมูลตาม ID
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        price: Number(price),
        categoryId,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Update Product Error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}
