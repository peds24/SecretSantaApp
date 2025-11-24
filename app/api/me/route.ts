// app/api/me/route.ts
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
      // Missing/invalid token: return demo values, but with an error flag
      return NextResponse.json(
        {
          userName: "Demo User",
          recipientName: "Demo Recipient",
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
          userName: "Unknown",
          recipientName: "(no assignment yet)",
          error: "No pair found for this giverId",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userName: pair.giverName,
      recipientName: pair.receiverName,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Error loading user info" },
      { status: 500 }
    );
  }
}
