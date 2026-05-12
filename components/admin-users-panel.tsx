"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function AdminUsersPanel({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const normalized = `${user.username || user.id} ${user.role || "user"}`.toLowerCase();
        return normalized.includes(query.trim().toLowerCase());
      }),
    [query, users]
  );

  const action = async (payload: Record<string, unknown>) => {
    setBusy(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok || data.error) {
      toast.error(data.error || "Failed to update user");
      return null;
    }

    return data;
  };

  const toggleRole = async (userId: string, role: string) => {
    const data = await action({ action: "toggle-role", userId, role });
    if (!data) return;

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, role: data.role } : user
      )
    );
    toast.success("Role updated.");
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user and all associated progress?")) return;
    const data = await action({ action: "delete-user", userId });
    if (!data) return;

    setUsers((current) => current.filter((user) => user.id !== userId));
    toast.success("User removed.");
  };

  const toggleBan = async (userId: string, banned: boolean) => {
    const data = await action({ action: "ban-user", userId, banned: !banned });
    if (!data) return;

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, banned: data.banned } : user
      )
    );
    toast.success(data.banned ? "User suspended." : "User restored.");
  };

  const resetPoints = async (userId: string) => {
    if (!confirm("Reset this user's points to zero?")) return;
    const data = await action({ action: "reset-points", userId });
    if (!data) return;

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, points: 0 } : user
      )
    );
    toast.success("Points reset.");
  };

  const resetProgress = async (userId: string) => {
    if (!confirm("Clear progress and reset points for this user?")) return;
    const data = await action({ action: "reset-progress", userId });
    if (!data) return;

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, points: 0 } : user
      )
    );
    toast.success("User progress reset.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">Users</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Player accounts</h2>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by username or role"
          className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 sm:max-w-xs"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="cyber-card rounded-2xl border border-cyan-500/20 p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-white mb-2">No matching users</h3>
          <p className="text-cyan-300/80">Try a different query or refresh the user list.</p>
        </div>
      ) : (
        filteredUsers.map((profile) => (
          <div
            key={profile.id}
            className="cyber-card rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 p-6 transition-colors"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{profile.username || profile.id}</h3>
                  {profile.banned ? (
                    <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-red-300">
                      Suspended
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-cyan-300/80">
                  <span>
                    <span className="font-semibold text-white">Role:</span> {profile.role || "user"}
                  </span>
                  <span>
                    <span className="font-semibold text-white">Points:</span> {profile.points ?? 0}
                  </span>
                  <span>
                    <span className="font-semibold text-white">Joined:</span>{' '}
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:auto-cols-max lg:grid-flow-col">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleRole(profile.id, profile.role || "user")}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
                >
                  {profile.role === "admin" ? "Demote" : "Promote"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleBan(profile.id, profile.banned)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed ${profile.banned ? "bg-green-600 hover:bg-green-500 disabled:bg-gray-600" : "bg-red-600 hover:bg-red-500 disabled:bg-gray-600"}`}
                >
                  {profile.banned ? "Restore" : "Suspend"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => resetPoints(profile.id)}
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
                >
                  Reset Points
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => resetProgress(profile.id)}
                  className="rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
                >
                  Reset Progress
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => deleteUser(profile.id)}
                  className="rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
