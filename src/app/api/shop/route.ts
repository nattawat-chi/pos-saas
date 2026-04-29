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
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { name: true },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch shop" },
      { status: 500 },
    );
  }
}
