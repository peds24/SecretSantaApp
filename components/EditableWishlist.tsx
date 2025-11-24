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
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        style={{ width: "100%" }}
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save wishlist"}
      </button>
      {saved && <span>Saved!</span>}
    </div>
  );
}
