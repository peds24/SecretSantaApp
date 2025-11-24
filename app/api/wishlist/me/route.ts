// app/api/wishlist/me/route.ts
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
        { error: "Invalid or missing token" },
        { status: 400 }
      );
    }

    // "Your wishlist" is keyed by your own ID as receiverId
    const wl = await prisma.wishlist.findUnique({
      where: { receiverId: giverId },
    });

    return NextResponse.json({
      content: wl?.wishlist ?? "",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Error loading your wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const giverId = await getGiverIdFromRequest(request);

    if (!giverId) {
      return NextResponse.json(
        { error: "Invalid or missing token" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const content = String(body.content ?? "");

    await prisma.wishlist.upsert({
      where: { receiverId: giverId },
      update: { wishlist: content },
      create: {
        receiverId: giverId,
        wishlist: content,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Error saving your wishlist" },
      { status: 500 }
    );
  }
}
