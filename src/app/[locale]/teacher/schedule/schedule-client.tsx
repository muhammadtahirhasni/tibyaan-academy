"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Video, Clock, CheckCircle2, XCircle, AlertTriangle, Inbox, UserPlus } from "lucide-react";

type ClassStatus = "scheduled" | "completed" | "cancelled" | "missed";

interface ScheduleItem {
  id: string;
  studentName: string;
  courseName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  meetingLink: string | null;
  notes: string | null;
}

const statusConfig: Record<ClassStatus, { color: string; bgColor: string; borderColor: string; icon: typeof CheckCircle2 }> = {
  scheduled: { color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-200 dark:border-blue-800", icon: Clock },
  completed: { color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30", borderColor: "border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
  cancelled: { color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/30", borderColor: "border-red-200 dark:border-red-800", icon: XCircle },
  missed: { color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30", borderColor: "border-amber-200 dark:border-amber-800", icon: AlertTriangle },
};

interface ScheduleRequest {
  id: string;
  studentName: string;
  courseName: string;
  timezone: string;
  preferredDays: string[];
  preferredTime: { start: string; end: string };
  selectedSlot: { day: string; time: string } | null;
  status: string;
}

export function ScheduleClient({ scheduleItems }: { scheduleItems: ScheduleItem[] }) {
  const t = useTranslations("teacher");
  const [pendingRequests, setPendingRequests] = useState<ScheduleRequest[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/scheduling/request")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setPendingRequests(data.filter((r: ScheduleRequest) => r.status === "confirmed"));
      })
      .catch(() => {});
  }, []);

  const handleRespond = async (id: string, action: "confirmed" | "rejected") => {
    setRespondingId(id);
    try {
      await fetch(`/api/scheduling/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // ignore
    } finally {
      setRespondingId(null);
    }
  };

  // Group by day
  const grouped = scheduleItems.reduce<Record<string, ScheduleItem[]>>((acc, item) => {
    const day = new Date(item.scheduledAt).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("classSchedule")}</h1>
          <p className="text-sm text-muted-foreground">{scheduleItems.length} {t("upcomingClasses")}</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-wrap gap-3">
        {(["scheduled", "completed", "cancelled", "missed"] as const).map((status) => {
          const config = statusConfig[status];
          return (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded-full ${config.bgColor} border ${config.borderColor}`} />
              <span className="text-muted-foreground">{t(status)}</span>
            </div>
          );
        })}
      </motion.div>

      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t("noUpcomingClasses")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([day, classes], dayIndex) => (
            <motion.div key={day} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + dayIndex * 0.05 }} className="rounded-xl border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/50 border-b">
                <h3 className="font-semibold text-foreground text-sm">{day}</h3>
              </div>
              <div className="divide-y">
                {classes.map((cls) => {
                  const config = statusConfig[cls.status as ClassStatus] ?? statusConfig.scheduled;
                  const StatusIcon = config.icon;
                  return (
                    <div key={cls.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${config.bgColor}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-white dark:bg-card flex items-center justify-center border ${config.borderColor}`}>
                          <Video className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{cls.studentName} — {cls.courseName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(cls.scheduledAt)} ({cls.durationMinutes}min)</span>
                            {cls.notes && (<><span className="text-muted-foreground/40">|</span><span>{cls.notes}</span></>)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ms-auto">
                        <Badge variant="outline" className={`${config.color} border-current/30`}>
                          <StatusIcon className="w-3 h-3 me-1" />{t(cls.status)}
                        </Badge>
                        {cls.status === "scheduled" && cls.meetingLink && (
                          <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7">{t("joinClass")}</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pending Schedule Requests */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("pendingScheduleRequests") ?? "Pending Schedule Requests"}
            </h3>
            <Badge variant="outline">{pendingRequests.length}</Badge>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {req.studentName} — {req.courseName}
                  </p>
                  {req.selectedSlot && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("requestedSlot") ?? "Requested"}: {req.selectedSlot.day} {req.selectedSlot.time} ({req.timezone})
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(req.id, "confirmed")}
                    disabled={respondingId === req.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {t("accept") ?? "Accept"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(req.id, "rejected")}
                    disabled={respondingId === req.id}
                    className="text-xs h-7 gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    {t("reject") ?? "Reject"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
