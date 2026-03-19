import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;

    const orders = await prisma.order.findMany({
      where: { shopId: shopId },
      include: {
        items: { include: { product: true } },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;
    const { orderId, status } = await req.json();

    // ป้องกันความปลอดภัย: อัปเดตได้เฉพาะออเดอร์ที่เป็นของร้านตัวเองเท่านั้น
    const updatedOrder = await prisma.order.updateMany({
      where: {
        id: orderId,
        shopId: shopId,
      },
      data: { status: status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 },
    );
  }
}

// 🛑 ลบออเดอร์ (Void Bill)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;

    const url = new URL(req.url);
    const orderId = url.searchParams.get("id");

    if (!orderId)
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );

    // เช็คความปลอดภัย: ต้องเป็นออเดอร์ของร้านตัวเองเท่านั้น
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.shopId !== shopId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ใช้ Transaction: ลบรายการสินค้าข้างในบิลทิ้งก่อน แล้วค่อยลบตัวบิลหลัก (ไม่งั้น Database จะ Error)
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: orderId } }),
      prisma.order.delete({ where: { id: orderId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 },
    );
  }
}
