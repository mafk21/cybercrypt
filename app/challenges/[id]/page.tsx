"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CooldownTimer from "@/components/cooldown-timer";

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenge();
  }, [params.id]);

  const fetchChallenge = async () => {
    try {
      const res = await fetch(`/api/challenges/${params.id}`);
      if (res.status === 401) {
        router.push("/auth");
        return;
      }
      if (res.status === 404) {
        setError("Challenge not found or inactive.");
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setChallenge(data);
        if (data.cooldown_until) {
          const remaining = Math.max(0, Math.ceil((new Date(data.cooldown_until).getTime() - Date.now()) / 1000));
          setCooldown(remaining);
        }
      } else {
        setError("Failed to load challenge.");
      }
    } catch (err) {
      setError("Failed to load challenge.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const submit = async () => {
    if (loading || cooldown > 0) return;

    setLoading(true);
    const res = await fetch(
      `/api/challenges/${params.id}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      }
    );

    const data = await res.json();
    setLoading(false);

    if (data.correct) {
      toast.success("Challenge solved!");
      setChallenge({ ...challenge, solved: true });
      setAnswer("");
    } else {
      toast.error("Incorrect answer.");
      if (data.cooldown_until) {
        const remaining = Math.max(0, Math.ceil((new Date(data.cooldown_until).getTime() - Date.now()) / 1000));
        setCooldown(remaining);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="cyber-card rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-cyan-300">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="cyber-card rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="cyber-card rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">Not Found</h3>
          <p className="text-cyan-300">Challenge not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="cyber-card rounded-2xl p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {challenge.title}
              </h1>
              <p className="text-cyan-400 text-lg font-medium mt-2">
                {challenge.cipher_type}
              </p>
            </div>

            <p className="text-cyan-200/80 leading-relaxed">
              {challenge.description}
            </p>

            {challenge.hints && challenge.hints.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-cyan-300">Hints:</h3>
                <ul className="space-y-2">
                  {challenge.hints.map((hint: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span className="text-cyan-200">{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:min-w-[200px]">
            <div className="cyber-card rounded-xl p-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
                Points
              </p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {challenge.points}
              </p>
            </div>
            <div className="cyber-card rounded-xl p-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
                Difficulty
              </p>
              <p className="text-lg font-semibold text-cyan-400 mt-1 capitalize">
                {challenge.difficulty}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ciphertext Section */}
      <div className="cyber-card rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-4">Ciphertext</h2>
        <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 md:p-6">
          <code className="text-green-400 block whitespace-pre-wrap font-mono text-sm md:text-base leading-relaxed">
            {challenge.ciphertext}
          </code>
        </div>
      </div>

      {/* Submission Section */}
      {challenge.solved ? (
        <div className="cyber-card rounded-2xl p-6 md:p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-400 mb-2">SOLVED!</h3>
          <p className="text-cyan-300">
            Congratulations! You've successfully cracked this cipher.
          </p>
        </div>
      ) : (
        <div className="cyber-card rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white">Submit Your Answer</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Your Decrypted Answer
              </label>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the decrypted plaintext..."
                className="w-full bg-black/50 border border-cyan-500/50 rounded-lg px-4 py-3 text-white placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors"
                disabled={cooldown > 0}
              />
            </div>

            {cooldown > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-red-400">⏱️</div>
                  <div>
                    <p className="text-red-400 font-medium">Cooldown Active</p>
                    <p className="text-red-300/80 text-sm">Try again in {cooldown} seconds</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading || cooldown > 0 || !answer.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Submitting...
                </span>
              ) : cooldown > 0 ? (
                `Cooldown: ${cooldown}s`
              ) : (
                "Submit Answer"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}