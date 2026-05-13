import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminChallengesPanel from "@/components/admin-challenges-panel";

export const dynamic = 'force-dynamic';

export default async function AdminChallengesPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/404");
  }

  const { data: challenges } = await supabase
    .from("challenges")
    .select("id,title,cipher_type,points,difficulty,active,tags")
    .order("points", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          administration
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          CHALLENGE MANAGEMENT
        </h1>
        <p className="text-cyan-300/80 text-lg mt-4">
          Deploy, activate, and configure cryptography challenges
        </p>
      </div>

      <AdminChallengesPanel initialChallenges={challenges || []} />
    </div>
  );
}
