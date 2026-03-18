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
