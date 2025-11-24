import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  slug: string;
  memberSlug: string;
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<RouteParams> } // Next 16: params can be a Promise
) {
  const { slug, memberSlug } = await context.params;

  try {
    const body = await req.json();
    const content = (body?.content ?? "").toString();

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Invalid content" },
        { status: 400 }
      );
    }

    // 1) Find family by slug
    const family = await prisma.familyGroup.findUnique({
      where: { slug },
    });

    if (!family) {
      return NextResponse.json(
        { error: "Family not found" },
        { status: 404 }
      );
    }

    // 2) Find member by (familyGroupId, slug)
    const member = await prisma.member.findUnique({
      where: {
        familyGroupId_slug: {
          familyGroupId: family.id,
          slug: memberSlug,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // 3) Upsert wishlist for this member
    const wishlist = await prisma.wishlist.upsert({
      where: { memberId: member.id },
      update: { content },
      create: {
        memberId: member.id,
        content,
      },
    });

    return NextResponse.json(
      { success: true, wishlist },
      { status: 200 }
    );
  } catch (err) {
    console.error("Wishlist save error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
