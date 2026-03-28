"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Search, Filter, ChevronRight, Users, Inbox } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  courseName: string;
  courseType: string;
  planType: string;
  status: string;
  enrolledAt: string;
}

const courseFilters = ["all", "nazra", "hifz", "arabic", "aalim"] as const;
const statusFilters = ["all", "active", "trial", "paused"] as const;

export function StudentsClient({ students }: { students: Student[] }) {
  const t = useTranslations("teacher");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = students.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (courseFilter !== "all" && s.courseType !== courseFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const planLabel = (p: string) => p === "human_ai" ? "Human + AI" : "AI Only";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("allStudents")}</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} students</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder={t("searchStudents")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full ps-10 pe-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {courseFilters.map((f) => (<option key={f} value={f}>{f === "all" ? t("filterCourse") : t(f)}</option>))}
          </select>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {statusFilters.map((f) => (<option key={f} value={f}>{f === "all" ? t("filterStatus") : t(f)}</option>))}
        </select>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">{students.length === 0 ? t("noStudentsYet") : t("noMatchingStudents")}</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground uppercase">{t("studentName")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground uppercase">{t("course")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground uppercase">{t("plan")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground uppercase">{t("status")}</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{student.name.split(" ").map(n => n[0]).join("")}</span>
                          </div>
                          <span className="font-medium text-foreground text-sm">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{student.courseName}</td>
                      <td className="p-4"><Badge variant="outline" className="text-xs">{planLabel(student.planType)}</Badge></td>
                      <td className="p-4">
                        <Badge variant="outline" className={`text-xs ${student.status === "active" ? "border-emerald-300 text-emerald-700 dark:text-emerald-400" : student.status === "trial" ? "border-blue-300 text-blue-700 dark:text-blue-400" : "border-red-300 text-red-700 dark:text-red-400"}`}>{t(student.status)}</Badge>
                      </td>
                      <td className="p-4">
                        <Link href={`/teacher/students/${student.id}`}>
                          <Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y">
              {filtered.map((student) => (
                <Link key={student.id} href={`/teacher/students/${student.id}`}>
                  <div className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{student.name.split(" ").map(n => n[0]).join("")}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.courseName}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex items-center gap-2 ps-13">
                      <Badge variant="outline" className="text-xs">{planLabel(student.planType)}</Badge>
                      <Badge variant="outline" className={`text-xs ${student.status === "active" ? "border-emerald-300 text-emerald-700" : "border-blue-300 text-blue-700"}`}>{t(student.status)}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
