import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminLogsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/404");
  }

  const { data: logs } = await supabase
    .from("security_logs")
    .select("id,action,details,ip_address,created_at,user_id")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          administration
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          SECURITY LOGS
        </h1>
        <p className="text-cyan-300/80 text-lg mt-4">
          Latest audit records and administrative events
        </p>
      </div>

      {/* Logs Grid */}
      <div className="space-y-4">
        {logs?.length ? (
          logs.map((log: any) => (
            <div key={log.id} className="cyber-card rounded-2xl border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-[0.35em] text-purple-400 font-medium">
                    {log.action}
                  </p>
                  <p className="text-white text-base mt-2">{log.details}</p>
                </div>
                <div className="lg:text-right text-sm text-cyan-300/70 whitespace-nowrap">
                  <p className="font-mono text-xs text-cyan-400/80 mb-1">{log.ip_address}</p>
                  <p>{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="cyber-card rounded-2xl border border-cyan-500/20 p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No Logs Available</h3>
            <p className="text-cyan-300/80">Security events will appear here as they happen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
