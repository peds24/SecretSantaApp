// app/[groupSlug]/EditableWishlist.tsx
'use client';

import { useState, FormEvent } from 'react';

type EditableWishlistProps = {
  memberId: string;
  initialValue: string;
};

export default function EditableWishlist({
  memberId,
  initialValue,
}: EditableWishlistProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, content: value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus(data.error || 'Failed to save wishlist');
      } else {
        setStatus('Wishlist saved.');
      }
    } catch (error) {
      console.error(error);
      setStatus('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        rows={8}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: '100%' }}
      />
      <div>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save wishlist'}
        </button>
      </div>
      {status && <p>{status}</p>}
    </form>
  );
}