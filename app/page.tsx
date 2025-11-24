// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { WelcomeCard } from "@/components/WelcomeCard";
import { MyWishlist } from "@/components/MyWishlist";
import { RecipientWishlist } from "@/components/RecipientWishlist";

type MeResponse = {
  userName: string;
  recipientName: string;
  error?: string;
};

type WishlistResponse = {
  content: string;
  error?: string;
};

type RecipientWishlistResponse = {
  recipientName: string;
  content: string;
  error?: string;
};

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);

  const [userName, setUserName] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [myWishlist, setMyWishlist] = useState<string>("");
  const [recipientWishlist, setRecipientWishlist] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Read token from URL on client side
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);

    if (!t) {
      setErrorMessage(
        "Invalid or missing access link. Please use the personal Secret Santa link you received."
      );
      setIsLoading(false);
      return;
    }

    async function loadData() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const query = `?token=${encodeURIComponent(t)}`;

        // 1) Who am I and who did I get?
        const meRes = await fetch(`/api/me${query}`);
        if (!meRes.ok) {
          const text = await meRes.text();
          throw new Error(`Failed to load user info: ${text}`);
        }
        const meData = (await meRes.json()) as MeResponse;
        setUserName(meData.userName);
        setRecipientName(meData.recipientName);

        // 2) My wishlist
        const myRes = await fetch(`/api/wishlist/me${query}`);
        if (!myRes.ok) {
          const text = await myRes.text();
          throw new Error(`Failed to load your wishlist: ${text}`);
        }
        const myData = (await myRes.json()) as WishlistResponse;
        setMyWishlist(myData.content ?? "");

        // 3) Recipient wishlist
        const recRes = await fetch(`/api/wishlist/recipient${query}`);
        if (!recRes.ok) {
          const text = await recRes.text();
          throw new Error(`Failed to load recipient wishlist: ${text}`);
        }
        const recData = (await recRes.json()) as RecipientWishlistResponse;
        setRecipientName(recData.recipientName || meData.recipientName);
        setRecipientWishlist(recData.content ?? "");
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Something went wrong loading data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSaveWishlist() {
    if (!token) {
      setErrorMessage(
        "Missing access token. Please open this page using your personal Secret Santa link."
      );
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage("");
      setErrorMessage("");

      const query = `?token=${encodeURIComponent(token)}`;

      const res = await fetch(`/api/wishlist/me${query}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: myWishlist }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save wishlist: ${text}`);
      }

      setSaveMessage("Wishlist saved.");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong saving your wishlist.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-600">Loading your Secret Santa dashboard...</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Secret Santa Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Invalid or missing access link. Please open this page using the
            personal Secret Santa URL that was shared with you.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <header className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Secret Santa Dashboard
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            See who you got, update your wishlist, and view your recipient&apos;s wishlist.
          </p>
        </header>

        {errorMessage && (
          <div className="border border-red-300 bg-red-50 text-red-800 rounded-md px-3 py-2 text-sm">
            {errorMessage}
          </div>
        )}

        <WelcomeCard userName={userName} recipientName={recipientName} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <MyWishlist
              value={myWishlist}
              onChange={setMyWishlist}
              onSave={handleSaveWishlist}
              isSaving={isSaving}
            />
            {saveMessage && (
              <p className="text-xs text-green-700 mt-1">{saveMessage}</p>
            )}
          </div>

          <RecipientWishlist
            recipientName={recipientName}
            content={recipientWishlist}
          />
        </div>
      </div>
    </main>
  );
}
