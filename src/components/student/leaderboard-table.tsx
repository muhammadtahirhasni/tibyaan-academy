"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  studentId: string;
  fullName: string;
  avatarUrl: string | null;
  totalPoints: number;
  rank: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

export function LeaderboardTable({
  entries,
  currentUserId,
}: LeaderboardTableProps) {
  const t = useTranslations("gamification");

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2)
      return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3)
      return <Award className="w-5 h-5 text-amber-600" />;
    return (
      <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">
        {rank}
      </span>
    );
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t("leaderboard")}
      </h3>
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const isCurrentUser = entry.studentId === currentUserId;
          return (
            <motion.div
              key={entry.studentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrentUser
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-muted-foreground">
                  {entry.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isCurrentUser ? "text-primary" : "text-foreground"
                  }`}
                >
                  {entry.fullName}
                  {isCurrentUser && (
                    <span className="ms-1 text-xs text-muted-foreground">
                      ({t("you")})
                    </span>
                  )}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground">
                {entry.totalPoints.toLocaleString()} {t("xp")}
              </p>
            </motion.div>
          );
        })}
        {entries.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            {t("noLeaderboardData")}
          </p>
        )}
      </div>
    </div>
  );
}
