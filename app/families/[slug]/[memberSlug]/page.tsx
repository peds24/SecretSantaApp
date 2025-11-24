import { prisma } from "@/lib/prisma";
import { EditableWishlist } from "@/components/EditableWishlist";

type PageParams = {
  slug: string;
  memberSlug: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

export default async function MemberPage(props: PageProps) {
  const { slug, memberSlug } = await props.params;

  const family = await prisma.familyGroup.findUnique({
    where: { slug },
  });

  if (!family) {
    return <div>Family not found</div>;
  }

  const member = await prisma.member.findUnique({
    where: {
      familyGroupId_slug: {
        familyGroupId: family.id,
        slug: memberSlug,
      },
    },
    include: { wishlist: true },
  });

  if (!member) {
    return <div>Participant not found</div>;
  }

  const assignment = await prisma.assignment.findFirst({
    where: {
      familyGroupId: family.id,
      giverId: member.id,
    },
  });

  const receiver = assignment
    ? await prisma.member.findUnique({
        where: { id: assignment.receiverId },
        include: { wishlist: true },
      })
    : null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem" }}>
      <h1>{family.name}</h1>
      <p>
        You are: <strong>{member.name}</strong>
      </p>
      {receiver && (
        <p>
          You are Secret Santa for: <strong>{receiver.name}</strong>
        </p>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>Your wishlist</h2>
        <EditableWishlist
          initialContent={member.wishlist?.content ?? ""}
          familySlug={slug}
          memberSlug={memberSlug}
        />
      </section>

      {receiver && (
        <section style={{ marginTop: "2rem" }}>
          <h2>{receiver.name}'s wishlist</h2>
          <pre>{receiver.wishlist?.content || "No wishlist yet."}</pre>
        </section>
      )}
    </div>
  );
}
