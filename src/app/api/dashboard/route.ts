import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    // 1. เช็คสิทธิ์และล็อกร้านค้า
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;

    // 2. ดึงข้อมูลออเดอร์เฉพาะร้านตัวเองเท่านั้น
    const orders = await prisma.order.findMany({
      where: {
        shopId: shopId,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "asc" },
    });

    const groupBy = (formatStr: string) => {
      const stats: Record<string, number> = {};
      orders.forEach((order) => {
        const dateKey = format(new Date(order.createdAt), formatStr);
        stats[dateKey] = (stats[dateKey] || 0) + order.totalAmount;
      });
      return Object.keys(stats).map((key) => ({
        label: key,
        amount: stats[key],
      }));
    };

    const dailySales = groupBy("dd/MM");
    const monthlySales = groupBy("MMM yy");
    const yearlySales = groupBy("yyyy");

    const today = new Date().toDateString();
    const salesToday = orders
      .filter((o) => new Date(o.createdAt).toDateString() === today)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      salesToday,
      dailySales,
      monthlySales,
      yearlySales,
      totalRevenue,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 },
    );
  }
}
