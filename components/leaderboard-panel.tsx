"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

export default function LeaderboardPanel({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers || []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("leaderboard_cache")
        .select("user_id,username,points")
        .order("points", { ascending: false });
      setUsers(data || []);
    };

    load();

    const channel = supabase
      .channel("leaderboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard_cache",
        },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="cyber-card rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
          <p className="text-cyan-300/80">
            Be the first to solve challenges and claim your spot on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`cyber-card rounded-2xl p-6 border transition-all duration-200 ${
                index === 0
                  ? "border-yellow-400/50 bg-gradient-to-r from-yellow-500/5 to-transparent shadow-lg shadow-yellow-500/10"
                  : index === 1
                  ? "border-gray-400/50 bg-gradient-to-r from-gray-500/5 to-transparent"
                  : index === 2
                  ? "border-orange-400/50 bg-gradient-to-r from-orange-500/5 to-transparent"
                  : "border-cyan-500/20 hover:border-cyan-500/40"
              }`}
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                    index === 0
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/50"
                      : index === 1
                      ? "bg-gray-500/20 text-gray-400 border border-gray-400/50"
                      : index === 2
                      ? "bg-orange-500/20 text-orange-400 border border-orange-400/50"
                      : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {user.username}
                    </h3>
                    <p className="text-cyan-400/70 text-sm">
                      {user.points} points
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">
                    {user.points}
                  </div>
                  <div className="text-purple-400/70 text-sm">
                    pts
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
