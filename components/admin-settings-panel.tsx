"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminSettingsPanel({
  initialAnnouncement,
  initialLocked,
}: {
  initialAnnouncement: string;
  initialLocked: boolean;
}) {
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [submissionsLocked, setSubmissionsLocked] = useState(initialLocked);
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save-settings",
        settings: {
          announcement: announcement.trim(),
          submissions_locked: submissionsLocked ? "true" : "false",
        },
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok || data.error) {
      toast.error(data.error || "Failed to save settings");
      return;
    }

    toast.success("Platform settings updated.");
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card rounded-3xl border border-cyan-500/20 p-8">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Global announcement</p>
            <textarea
              value={announcement}
              onChange={(event) => setAnnouncement(event.target.value)}
              rows={5}
              className="mt-3 w-full rounded-3xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
              placeholder="Post a live event message for all players."
            />
          </div>

          <div className="rounded-3xl border border-slate-700/60 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-orange-300/70">Submission flow</p>
                <p className="mt-2 text-white text-sm">
                  Pause or reopen the challenge submission pipeline for all users.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionsLocked((current) => !current)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  submissionsLocked ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"
                } text-white`}
              >
                {submissionsLocked ? "PAUSED" : "OPEN"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-500 transition disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              Save settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
