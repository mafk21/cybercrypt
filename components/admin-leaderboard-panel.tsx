'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface LeaderboardRow {
  user_id: string
  username: string
  points: number
}

export function AdminLeaderboardPanel({ initialData }: { initialData: LeaderboardRow[] }) {
  const [users, setUsers] = useState(initialData || [])
  const [editing, setEditing] = useState<string | null>(null)
  const [newPoints, setNewPoints] = useState('')

  const refreshLeaderboard = async () => {
    const res = await fetch('/api/admin/leaderboard')
    const payload = await res.json()

    if (!res.ok) {
      toast.error(payload.error || 'Failed to refresh leaderboard')
      return
    }

    setUsers(payload.leaderboard || [])
  }

  const handleAction = async (action: string, userId: string, points?: number) => {
    if (action !== 'recalculate' && !userId) {
      toast.error('Missing user id for this action.')
      return
    }

    if (action === 'update_score' && (points === undefined || !Number.isFinite(points))) {
      toast.error('Enter a valid score before saving.')
      return
    }

    const res = await fetch('/api/admin/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId, newPoints: points }),
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      toast.error(data.error || 'Action failed')
      return
    }

    toast.success('Action completed')

    if (action === 'remove_user') {
      setUsers((prev) => prev.filter((u) => u.user_id !== userId))
    } else if (action === 'update_score') {
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, points: points ?? u.points } : u)))
      setEditing(null)
    } else if (action === 'recalculate') {
      await refreshLeaderboard()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Leaderboard Management</h2>
          <p className="text-sm text-slate-400">Edit cache entries, remove invalid rows, or refresh the ranking table.</p>
        </div>
        <button
          onClick={() => handleAction('recalculate', '')}
          className="cyber-button px-4 py-2 rounded-lg"
        >
          Recalculate Rankings
        </button>
      </div>

      <div className="cyber-card rounded-2xl border border-cyan-500/20 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-cyan-500/10">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-cyan-400 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-xs font-medium text-cyan-400 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-xs font-medium text-cyan-400 uppercase tracking-wider">Points</th>
              <th className="px-6 py-3 text-xs font-medium text-cyan-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/20">
            {users.map((user, index) => (
              <motion.tr
                key={user.user_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {editing === user.user_id ? (
                    <input
                      type="number"
                      value={newPoints}
                      onChange={(e) => setNewPoints(e.target.value)}
                      className="w-24 rounded border border-cyan-500/40 bg-slate-950 px-2 py-1 text-white"
                    />
                  ) : (
                    user.points
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {editing === user.user_id ? (
                    <>
                      <button
                        onClick={() => handleAction('update_score', user.user_id, parseInt(newPoints))}
                        className="text-green-400 hover:text-green-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditing(user.user_id)
                          setNewPoints(user.points.toString())
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit Score
                      </button>
                      <button
                        onClick={() => handleAction('remove_user', user.user_id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
