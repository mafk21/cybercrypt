"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CooldownTimer from "@/components/cooldown-timer";

interface Challenge {
  id: string;
  title: string;
  cipher_type: string;
  description: string;
  ciphertext: string;
  points: number;
  difficulty: string;
  hints: string[];
  solved: boolean;
  is_final?: boolean;
}

interface ChallengeClientProps {
  challenge: Challenge;
  cooldownUntil: string | null;
}

export default function ChallengeClient({ challenge, cooldownUntil }: ChallengeClientProps) {
  const [answer, setAnswer] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldownUntil) {
      const remaining = Math.max(0, Math.ceil((new Date(cooldownUntil).getTime() - Date.now()) / 1000));
      setCooldown(remaining);
    }
  }, [cooldownUntil]);

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

  const router = useRouter();

  const submit = async () => {
    if (loading || cooldown > 0) return;

    setLoading(true);
    const res = await fetch(
      `/api/challenges/${challenge.id}/submit`,
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
      setAnswer("");
      if (challenge.is_final) {
        router.push("/congratulations");
        return;
      }
      window.location.reload();
    } else {
      toast.error("Incorrect answer.");
      if (data.cooldown_until) {
        const remaining = Math.max(0, Math.ceil((new Date(data.cooldown_until).getTime() - Date.now()) / 1000));
        setCooldown(remaining);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="cyber-card p-8 rounded-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold">{challenge.title}</h1>
            <p className="mt-2 text-cyan-300">{challenge.cipher_type}</p>
          </div>
          <div className="text-right">
            <div className="text-cyan-400">{challenge.points} pts</div>
            <div className="text-purple-400">{challenge.difficulty}</div>
          </div>
        </div>

        <p className="mb-6">{challenge.description}</p>

        <div className="bg-black p-4 rounded-lg border border-cyan-500 mb-6">
          <code className="text-green-400 block whitespace-pre-wrap">{challenge.ciphertext}</code>
        </div>

        {challenge.hints && challenge.hints.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-cyan-300">Hints:</h3>
            <ul className="list-disc list-inside text-cyan-200">
              {challenge.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {challenge.solved ? (
          <div className="text-green-400 text-xl font-bold mb-4">✅ SOLVED</div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-sm uppercase tracking-[0.35em] text-cyan-400/70">Your Answer</label>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter decrypted text..."
                className="w-full bg-black border border-cyan-500 p-3 rounded-lg"
                disabled={cooldown > 0}
              />
            </div>

            {cooldown > 0 && (
              <div className="mb-4">
                <CooldownTimer seconds={cooldown} />
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading || cooldown > 0 || !answer.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? "Submitting..." : cooldown > 0 ? `Cooldown: ${cooldown}s` : "Submit Answer"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}