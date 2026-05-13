import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminSettingsPanel from "@/components/admin-settings-panel";

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/404");
  }

  const { data: settings } = await supabase.from("admin_settings").select("key,value");
  const settingsMap = (settings || []).reduce<Record<string, string>>((acc, item: any) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          administration
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          PLATFORM SETTINGS
        </h1>
        <p className="text-cyan-300/80 text-lg mt-4">
          Control global competition behavior, announcements, and submission flow.
        </p>
      </div>

      <AdminSettingsPanel
        initialAnnouncement={settingsMap["announcement"] || ""}
        initialLocked={settingsMap["submissions_locked"] === "true"}
      />
    </div>
  );
}
