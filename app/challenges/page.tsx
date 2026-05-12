import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChallengeCard from "@/components/challenge-card";

export default async function ChallengesPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: challenges, error } = await supabase
    .from("challenges")
    .select("id,title,cipher_type,points,difficulty,active")
    .eq("active", true)
    .order("points", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-red-400">
        Failed to load challenges.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          active cipher challenges
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          CHALLENGES
        </h1>
        <p className="text-cyan-300/80 text-lg mt-4 max-w-2xl">
          Test your cryptography skills against live challenges. Each solved cipher earns you points and glory.
        </p>
      </div>

      {/* Challenges Grid */}
      {challenges?.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {challenges.map((challenge: any) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      ) : (
        <div className="cyber-card rounded-2xl p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl">🔐</div>
            <h3 className="text-xl font-bold text-white">No Active Challenges</h3>
            <p className="text-cyan-300/80">
              New challenges will be deployed soon. Stay tuned for the next cipher battle!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
