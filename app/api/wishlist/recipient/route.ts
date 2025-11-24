// app/api/wishlist/recipient/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getGiverIdFromRequest(request: Request): Promise<number | null> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) return null;

  const tokenRow = await prisma.authToken.findUnique({
    where: { token },
  });

  if (!tokenRow) return null;

  return tokenRow.giverId;
}

export async function GET(request: Request) {
  try {
    const giverId = await getGiverIdFromRequest(request);

    if (!giverId) {
      return NextResponse.json(
        {
          recipientName: "(unknown)",
          content: "",
          error: "Invalid or missing token",
        },
        { status: 400 }
      );
    }

    const pair = await prisma.pair.findUnique({
      where: { giverId },
    });

    if (!pair) {
      return NextResponse.json(
        {
          recipientName: "(no assignment yet)",
          content: "",
          error: "No pair found for this giverId",
        },
        { status: 404 }
      );
    }

    const recipientWishlist = await prisma.wishlist.findUnique({
      where: { receiverId: pair.receiverId },
    });

    return NextResponse.json({
      recipientName: pair.receiverName,
      content: recipientWishlist?.wishlist ?? "",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Error loading recipient wishlist" },
      { status: 500 }
    );
  }
}
