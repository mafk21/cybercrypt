import Link from "next/link";

export const metadata = {
  title: "Congratulations - CyberCrypt",
  description: "Final challenge success page for CyberCrypt users.",
};

export default function CongratulationsPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12">
      <div className="w-full max-w-3xl">
        <div className="cyber-card rounded-3xl border border-cyan-500/30 bg-black/85 p-10 shadow-glow">
          <div className="text-center space-y-6">
            <div className="inline-flex rounded-full bg-cyan-500/10 px-4 py-2 text-cyan-200 text-sm uppercase tracking-[0.35em]">
              Final Cipher Solved
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white glow">
              مبرمجين طويق يهنئونكم بالعيد ✨
            </h1>

            <p className="max-w-2xl mx-auto text-cyan-300/85 text-lg leading-relaxed">
              You've completed the final challenge in CyberCrypt. Your skills, speed, and strategy have earned you a place among the elite.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/dashboard"
                className="btn-primary w-full text-center"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="btn-outline w-full text-center"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
