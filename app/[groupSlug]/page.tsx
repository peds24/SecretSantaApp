// app/[groupSlug]/page.tsx
import { prisma } from '@/lib/prisma';
import EditableWishlist from './EditableWishList';

type PageProps = {
  params: { groupSlug: string };
  searchParams: { user?: string };
};

export default async function GroupPage({ params, searchParams }: PageProps) {
  const memberName = searchParams.user;

  if (!memberName) {
    return (
      <main>
        <h1>Secret Santa</h1>
        <p>Missing "user" query parameter in URL.</p>
      </main>
    );
  }

  // Fetch the current member, their assignment, and both wishlists
  const member = await prisma.member.findFirst({
    where: {
      name: memberName,
      familyGroup: { slug: params.groupSlug },
    },
    include: {
      wishlist: true,
      familyGroup: true,
      givingAssignments: {
        include: {
          receiver: {
            include: {
              wishlist: true,
            },
          },
        },
      },
    },
  });

  if (!member) {
    return (
      <main>
        <h1>Secret Santa</h1>
        <p>No member named "{memberName}" found in this family group.</p>
      </main>
    );
  }

  const assignment = member.givingAssignments[0] ?? null;
  const receiver = assignment?.receiver ?? null;

  const userWishlistContent = member.wishlist?.content ?? '';
  const receiverWishlistContent = receiver?.wishlist?.content ?? '';

  return (
    <main>
      {/* 1. Welcome message */}
      <section>
        <h1>Welcome, {member.name}</h1>
        {receiver ? (
          <p>
            You are the Secret Santa for <strong>{receiver.name}</strong>.
          </p>
        ) : (
          <p>No receiver assignment found for you in this group.</p>
        )}
      </section>

      {/* 2. Editable user wishlist */}
      <section>
        <h2>Your wishlist</h2>
        <EditableWishlist
          memberId={member.id}
          initialValue={userWishlistContent}
        />
      </section>

      {/* 3. Receiver wishlist display */}
      <section>
        <h2>{receiver ? `${receiver.name}'s wishlist` : 'Receiver wishlist'}</h2>
        {receiver ? (
          receiverWishlistContent ? (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{receiverWishlistContent}</pre>
          ) : (
            <p>Your receiver has not filled out a wishlist yet.</p>
          )
        ) : (
          <p>No receiver assigned.</p>
        )}
      </section>
    </main>
  );
}
