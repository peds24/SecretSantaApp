// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { memberId, content } = await req.json();

    if (!memberId || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'memberId and content are required' },
        { status: 400 }
      );
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { memberId },
      update: { content },
      create: { memberId, content },
    });

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error('Error saving wishlist', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
