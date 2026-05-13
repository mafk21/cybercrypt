import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminUsersPanel from "@/components/admin-users-panel";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/404");
  }

  const [profiles, roles] = await Promise.all([
    supabase.from("profiles").select("id,username,points,banned,created_at"),
    supabase.from("user_roles").select("user_id,role"),
  ]);

  const users = (profiles.data || []).map((profile: any) => ({
    ...profile,
    role: roles.data?.find((entry: any) => entry.user_id === profile.id)?.role || "user",
  }));

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          administration
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          USER MANAGEMENT
        </h1>
        <p className="text-cyan-300/80 text-lg mt-4">
          Manage player accounts, roles, and access permissions
        </p>
      </div>

      <AdminUsersPanel initialUsers={users} />
    </div>
  );
}
