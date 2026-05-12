export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="cyber-card rounded-3xl p-8 text-center text-cyan-200">
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
}
