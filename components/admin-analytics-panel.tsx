'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AnalyticsData {
  totalUsers: number
  totalSubmissions: number
  correctSubmissions: number
  solveRate: string
  difficultyStats: Record<string, number>
  activeUsers: number
}

export function AdminAnalyticsPanel({ initialData }: { initialData?: AnalyticsData }) {
  const [data, setData] = useState<AnalyticsData | null>(initialData || null)

  useEffect(() => {
    if (!initialData) {
      fetch('/api/admin/analytics')
        .then(res => res.json())
        .then(setData)
    }
  }, [initialData])

  if (!data) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card rounded-2xl border border-cyan-500/20 p-6"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-white">{data.totalUsers}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="cyber-card rounded-2xl border border-cyan-500/20 p-6"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Total Submissions</h3>
        <p className="text-3xl font-bold text-white">{data.totalSubmissions}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="cyber-card rounded-2xl border border-cyan-500/20 p-6"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Solve Rate</h3>
        <p className="text-3xl font-bold text-white">{data.solveRate}%</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="cyber-card rounded-2xl border border-cyan-500/20 p-6"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Active Users (7d)</h3>
        <p className="text-3xl font-bold text-white">{data.activeUsers}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="cyber-card rounded-2xl border border-cyan-500/20 p-6 col-span-full md:col-span-2"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Difficulty Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.difficultyStats).map(([diff, count]) => (
            <div key={diff} className="text-center">
              <p className="text-sm text-cyan-300">{diff}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}