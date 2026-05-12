import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/20 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              CYBERCRYPT
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-cyan-300 hover:text-cyan-100 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/challenges"
              className="text-cyan-300 hover:text-cyan-100 px-3 py-2 text-sm font-medium transition-colors"
            >
              Challenges
            </Link>
            <Link
              href="/leaderboard"
              className="text-cyan-300 hover:text-cyan-100 px-3 py-2 text-sm font-medium transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/profile"
              className="text-cyan-300 hover:text-cyan-100 px-3 py-2 text-sm font-medium transition-colors"
            >
              Profile
            </Link>
          </div>

          {/* Mobile menu button - simplified for now */}
          <div className="md:hidden">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-cyan-300 hover:text-cyan-100 text-sm font-medium">
                DASH
              </Link>
              <Link href="/challenges" className="text-cyan-300 hover:text-cyan-100 text-sm font-medium">
                CHALL
              </Link>
              <Link href="/leaderboard" className="text-cyan-300 hover:text-cyan-100 text-sm font-medium">
                LEADER
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}