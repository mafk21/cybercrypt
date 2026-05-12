"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="w-full rounded-2xl bg-red-600 hover:bg-red-500 px-4 py-3 font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
    >
      <span>🔓</span>
      <span>Sign Out</span>
    </button>
  );
}
