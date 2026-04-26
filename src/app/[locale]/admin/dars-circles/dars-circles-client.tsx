"use client";

import { motion } from "framer-motion";
import { Users2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Circle {
  id: string;
  title: string;
  category: string;
  teacherName: string;
  scheduledAt: string | null;
  status: string;
  maxStudents: number;
  currentStudents: number;
}

const categoryColor: Record<string, string> = {
  quran: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  hadith: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  fiqh: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  seerah: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  dua: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

const statusColor: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  live: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function AdminDarsCirclesClient({ circles }: { circles: Circle[] }) {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Dars Circles</h1>
        <p className="text-sm text-muted-foreground">
          Manage all Dars Circles across the platform. Students receive notifications for all circles.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card overflow-hidden"
      >
        {circles.length === 0 ? (
          <div className="text-center py-16">
            <Users2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No Dars Circles created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-start px-4 py-3 font-medium">Title</th>
                  <th className="text-start px-4 py-3 font-medium">Category</th>
                  <th className="text-start px-4 py-3 font-medium">Teacher</th>
                  <th className="text-start px-4 py-3 font-medium">Scheduled</th>
                  <th className="text-start px-4 py-3 font-medium">Students</th>
                  <th className="text-start px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {circles.map((circle) => (
                  <tr key={circle.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{circle.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[circle.category] ?? "bg-muted text-muted-foreground"}`}>
                        {circle.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{circle.teacherName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {circle.scheduledAt ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(circle.scheduledAt).toLocaleDateString()}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {circle.currentStudents} / {circle.maxStudents}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${statusColor[circle.status] ?? "bg-muted text-muted-foreground"}`}>
                        {circle.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
