import Link from "next/link";

export default function ChallengeCard({
  challenge
}: {
  challenge: any;
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="group cyber-card p-6 rounded-2xl block hover:scale-[1.02] transition-all duration-200 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
            {challenge.title}
          </h3>
          <p className="text-cyan-400 text-sm mt-1 font-medium">
            {challenge.cipher_type}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-cyan-500/20">
          <div className="flex items-center gap-3">
            <span className="text-purple-400 font-bold text-lg">{challenge.points}</span>
            <span className="text-purple-400/70 text-sm">pts</span>
          </div>
          <span className={`text-sm font-semibold capitalize ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
        </div>

        <div className="flex justify-end">
          <div className="text-cyan-400 group-hover:translate-x-1 transition-transform text-sm font-medium">
            Attempt →
          </div>
        </div>
      </div>
    </Link>
  );
}