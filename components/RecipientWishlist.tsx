// components/RecipientWishlist.tsx
type RecipientWishlistProps = {
  recipientName: string;
  content: string;
};

export function RecipientWishlist({ recipientName, content }: RecipientWishlistProps) {
  return (
    <section className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold">{recipientName}&apos;s Wishlist</h3>
      <p className="text-sm text-gray-600 mb-2">
        This is what your Secret Santa recipient would like to receive.
      </p>
      <div className="border rounded-md p-2 min-h-[150px] bg-gray-50 whitespace-pre-wrap">
        {content || <span className="text-gray-400 text-sm">No wishlist yet.</span>}
      </div>
    </section>
  );
}
