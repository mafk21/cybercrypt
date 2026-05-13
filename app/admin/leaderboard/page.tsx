"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function AdminLeaderboardPanel({ initialData }) {
  const supabase = createBrowserSupabase();
  const [data, setData] = useState(initialData || []);
  const [loading, setLoading] = useState(false);

  // 🟢 UPDATE POINTS (FIXED - prevents affecting all users)
  const updatePoints = async (userId, newPoints) => {
    if (!userId) {
      console.log("Missing userId");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ points: newPoints })
      .eq("id", userId); // 🔥 IMPORTANT FIX

    if (error) {
      console.log(error);
      return;
    }

    // refresh UI
    setData((prev) =>
      prev.map((user) =>
        user.user_id === userId ? { ...user, points: newPoints } : user
      )
    );
  };

  // 🟢 DELETE USER (FIXED UUID ERROR)
  const deleteUser = async (userId) => {
    if (!userId) {
      console.log("Missing userId (undefined prevented)");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId); // 🔥 FIXED

    if (error) {
      console.log(error);
      return;
    }

    setData((prev) => prev.filter((u) => u.user_id !== userId));
  };

  return (
    <div className="rounded-lg border border-cyan-500/20 p-4">
      <table className="w-full text-left text-white">
        <thead>
          <tr className="text-cyan-300 border-b border-cyan-500/20">
            <th>Rank</th>
            <th>Username</th>
            <th>Points</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.user_id} className="border-b border-white/10">
              <td>{row.rank}</td>
              <td>{row.username}</td>
              <td>{row.points}</td>

              <td className="flex gap-2">
                {/* ➕ Increase points */}
                <button
                  onClick={() => updatePoints(row.user_id, row.points + 10)}
                  className="text-green-400"
                >
                  +10
                </button>

                {/* ➖ Decrease points */}
                <button
                  onClick={() => updatePoints(row.user_id, row.points - 10)}
                  className="text-yellow-400"
                >
                  -10
                </button>

                {/* ❌ Delete user */}
                <button
                  onClick={() => deleteUser(row.user_id)}
                  className="text-red-400"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}