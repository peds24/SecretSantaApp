"use client";

import { useState } from "react";

type EditableWishlistProps = {
  initialContent: string;
  familySlug: string;
  memberSlug: string;
};

export function EditableWishlist({
  initialContent,
  familySlug,
  memberSlug,
}: EditableWishlistProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(
        `/api/families/${familySlug}/${memberSlug}/wishlist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save wishlist");
      }

      setSaved(true);
    } catch (err) {
      console.error(err);
      alert("Error saving wishlist");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="
          w-full p-3 rounded-xl border border-slate-300 
          shadow-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400
        "
      />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="
          px-4 py-2 rounded-xl font-semibold 
          text-white 
          bg-red-600 hover:bg-red-700 
          disabled:bg-red-300 disabled:cursor-not-allowed
          transition-all shadow
        "
      >
        {saving ? "Guardando..." : "Guardar Wishlist"}
      </button>

      {/* Saved message */}
      {saved && (
        <span className="text-green-600 font-medium text-sm">
          Guardado!
        </span>
      )}
    </div>
  );
}
