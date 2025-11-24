// components/MyWishlist.tsx
type MyWishlistProps = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSaving?: boolean;
};

export function MyWishlist({ value, onChange, onSave, isSaving }: MyWishlistProps) {
  return (
    <section className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Your Wishlist</h3>
      <textarea
        className="border rounded-md p-2 min-h-[150px] resize-vertical"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write down ideas, links, or general preferences..."
      />
      <button
        onClick={onSave}
        disabled={isSaving}
        className="self-start px-4 py-2 rounded-md border text-sm disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </section>
  );
}
