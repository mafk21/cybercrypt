"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const initialFormState = {
  title: "",
  cipher_type: "",
  description: "",
  ciphertext: "",
  solution: "",
  points: 0,
  difficulty: "medium",
  hints: "",
  tags: "",
  active: true,
};

export default function AdminChallengesPanel({ initialChallenges }: { initialChallenges: any[] }) {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [isCreating, setIsCreating] = useState(false);

  const request = async (payload: object) => {
    setBusy(true);
    const res = await fetch("/api/admin/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok || data.error) {
      toast.error(data.error || "Admin action failed");
      return null;
    }

    return data;
  };

  const handleCreate = async () => {
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const data = await request({
      action: "create-challenge",
      title: form.title,
      cipher_type: form.cipher_type,
      description: form.description,
      ciphertext: form.ciphertext,
      solution: form.solution,
      points: Number(form.points),
      difficulty: form.difficulty,
      hints: form.hints.split("\n").map((hint) => hint.trim()).filter(Boolean),
      tags,
      active: form.active,
    });

    if (!data) return;
    setChallenges((current) => [
      {
        id: `${Date.now()}`,
        title: form.title,
        cipher_type: form.cipher_type,
        points: Number(form.points),
        difficulty: form.difficulty,
        active: form.active,
        tags,
      },
      ...current,
    ]);
    setForm(initialFormState);
    setIsCreating(false);
    toast.success("Challenge created.");
  };

  const toggleActive = async (challengeId: string, active: boolean) => {
    const data = await request({ action: "toggle-active", challengeId, active: !active });
    if (!data) return;
    setChallenges((current) =>
      current.map((item) =>
        item.id === challengeId ? { ...item, active: !active } : item
      )
    );
    toast.success("Status updated.");
  };

  const removeChallenge = async (challengeId: string) => {
    if (!confirm("Remove this challenge permanently?")) return;
    const data = await request({ action: "delete-challenge", challengeId });
    if (!data) return;
    setChallenges((current) => current.filter((item) => item.id !== challengeId));
    toast.success("Challenge deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-purple-400/70 font-medium">Challenges</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Challenge operations</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((current) => !current)}
          className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-500 transition"
        >
          {isCreating ? "Close builder" : "Create challenge"}
        </button>
      </div>

      {isCreating && (
        <div className="cyber-card rounded-3xl border border-purple-500/20 p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
            />
            <input
              placeholder="Cipher type"
              value={form.cipher_type}
              onChange={(event) => setForm({ ...form, cipher_type: event.target.value })}
              className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
            />
            <input
              type="number"
              placeholder="Points"
              value={form.points}
              onChange={(event) => setForm({ ...form, points: Number(event.target.value) })}
              className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
            />
            <select
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
              className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
              <option value="legendary">legendary</option>
            </select>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={4}
              className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
            />
            <textarea
              placeholder="Ciphertext"
              value={form.ciphertext}
              onChange={(event) => setForm({ ...form, ciphertext: event.target.value })}
              rows={4}
              className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <input
              placeholder="Solution"
              value={form.solution}
              onChange={(event) => setForm({ ...form, solution: event.target.value })}
              className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
            />
            <input
              placeholder="Tags (comma-separated)"
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
              className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
            />
          </div>

          <textarea
            placeholder="Hints (one per line)"
            value={form.hints}
            onChange={(event) => setForm({ ...form, hints: event.target.value })}
            rows={3}
            className="mt-4 w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={busy}
              className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-500 transition disabled:cursor-not-allowed disabled:bg-gray-700"
            >
              Deploy challenge
            </button>
            <button
              type="button"
              onClick={() => setForm(initialFormState)}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              Reset form
            </button>
          </div>
        </div>
      )}

      {challenges.length === 0 ? (
        <div className="cyber-card rounded-2xl border border-cyan-500/20 p-12 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-xl font-bold text-white mb-2">No Challenges Found</h3>
          <p className="text-cyan-300/80">Deploy your first cipher challenge to get started.</p>
        </div>
      ) : (
        challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="cyber-card rounded-2xl border border-purple-500/20 hover:border-purple-400/40 p-6 transition-colors"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                <p className="text-cyan-300/80 text-sm">{challenge.cipher_type}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-cyan-300/80">
                  <span>
                    <span className="font-semibold text-white">Points:</span> {challenge.points}
                  </span>
                  <span>
                    <span className="font-semibold text-white">Difficulty:</span> {challenge.difficulty}
                  </span>
                  <span>
                    <span className="font-semibold text-white">Status:</span>{' '}
                    <span className={challenge.active ? 'text-green-400' : 'text-red-400'}>
                      {challenge.active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
                {challenge.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.35em] text-slate-400">
                    {challenge.tags.map((tag: string) => (
                      <span key={tag} className="rounded-full border border-slate-700/60 px-3 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleActive(challenge.id, challenge.active)}
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
                >
                  {challenge.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeChallenge(challenge.id)}
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
