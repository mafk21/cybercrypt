'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface LeaderboardUser {
  id: string
  username: string
  points: number
  banned: boolean
}

export function AdminLeaderboardPanel({ initialData }: { initialData: LeaderboardUser[] }) {
  const [users, setUsers] = useState(initialData)
  const [editing, setEditing] = useState<string | null>(null)
  const [newPoints, setNewPoints] = useState('')

  const handleAction = async (action: string, userId: string, points?: number) => {
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
      setUsers(users.filter(u => u.id !== userId))
    } else if (action === 'update_score') {
      setUsers(users.map(u => u.id === userId ? { ...u, points: points ?? u.points } : u))
      setEditing(null)
    } else if (action === 'recalculate') {
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Leaderboard Management</h2>
        <button
          onClick={() => handleAction('recalculate', '')}
          className="cyber-button px-4 py-2 rounded-lg"
        >
          Recalculate Rankings
        </button>
      </div>

      <div className="cyber-card rounded-2xl border border-cyan-500/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-cyan-500/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">Points</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/20">
            {users.map((user, index) => (
              <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {editing === user.id ? (
                    <input
                      type="number"
                      value={newPoints}
                      onChange={(e) => setNewPoints(e.target.value)}
                      className="bg-gray-800 border border-cyan-500/50 rounded px-2 py-1 text-white"
                    />
                  ) : (
                    user.points
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {editing === user.id ? (
                    <>
                      <button
                        onClick={() => handleAction('update_score', user.id, parseInt(newPoints))}
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
                          setEditing(user.id)
                          setNewPoints(user.points.toString())
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit Score
                      </button>
                      <button
                        onClick={() => handleAction('remove_user', user.id)}
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