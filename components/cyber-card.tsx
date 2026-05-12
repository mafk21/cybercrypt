export default function CyberCard({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cyber-card rounded-2xl p-6">
      {children}
    </div>
  );
}