import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [{ data: profile }, { data: challenges }] = await Promise.all([
    supabase.from("profiles").select("id,username,points").eq("id", user.id).single(),
    supabase
      .from("challenges")
      .select("id,title,cipher_type,points,difficulty,active")
      .eq("active", true)
      .order("points", { ascending: false }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
            dashboard
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow">
            DASHBOARD
          </h1>
          <p className="text-cyan-300/80 text-lg">
            Welcome back, {profile?.username || 'hacker'}
          </p>
        </div>

        <div className="cyber-card rounded-2xl border border-cyan-500/20 bg-black/70 px-6 py-4 min-w-[200px]">
          <div className="text-center space-y-1">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
              Your Score
            </p>
            <p className="text-2xl font-bold text-cyan-300">{profile?.username}</p>
            <p className="text-xl font-semibold text-purple-400">{profile?.points ?? 0} pts</p>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Active Challenges</h2>
          <Link
            href="/challenges"
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            View All →
          </Link>
        </div>

        {challenges && challenges.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {challenges.slice(0, 6).map((challenge: any) => (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.id}`}
                className="group cyber-card p-6 rounded-2xl hover:scale-[1.02] transition-all duration-200 border border-cyan-500/20 hover:border-cyan-500/40"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {challenge.title}
                    </h3>
                    <p className="text-cyan-400 text-sm mt-1">{challenge.cipher_type}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-cyan-500/20">
                    <div className="flex items-center gap-4">
                      <span className="text-purple-400 font-semibold">{challenge.points} pts</span>
                      <span className="text-cyan-300 text-sm capitalize">{challenge.difficulty}</span>
                    </div>
                    <div className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="cyber-card rounded-2xl p-8 text-center">
            <p className="text-cyan-300 text-lg">No active challenges available.</p>
            <p className="text-cyan-400/70 text-sm mt-2">Check back later for new challenges!</p>
          </div>
        )}
      </div>
    </div>
  );
}