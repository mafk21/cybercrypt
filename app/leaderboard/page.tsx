import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeaderboardPanel from "@/components/leaderboard-panel";

export default async function LeaderboardPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  const { data: users } = await supabase
    .from("profiles")
    .select("id,username,points")
    .order("points", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          rankings
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          LEADERBOARD
        </h1>
        <p className="text-cyan-300/80 text-lg mt-4 max-w-2xl">
          The elite hackers who have conquered the most challenging ciphers.
          Can you claim the top spot?
        </p>
      </div>

      {/* Leaderboard */}
      <LeaderboardPanel initialUsers={users || []} />
    </div>
  );
}