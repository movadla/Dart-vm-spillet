'use client'

import RankList, { RankEntry, FlagEntry } from '@/components/RankList'

export type { FlagEntry }
export type LeaderboardRow = RankEntry

export default function LeaderboardRows({ rows, vmStarted }: { rows: LeaderboardRow[]; vmStarted: boolean }) {
  return <RankList rows={rows} vmStarted={vmStarted} backRef="leaderboard" />
}
