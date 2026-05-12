export default function LeaderboardCard({
  username,
  points,
  rank
}: {
  username: string;
  points: number;
  rank: number;
}) {
  return (
    <div className="cyber-card p-6 rounded-2xl flex justify-between">
      <div>
        #{rank} {username}
      </div>

      <div>{points} pts</div>
    </div>
  );
}