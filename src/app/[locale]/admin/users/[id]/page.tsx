"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, User, BookOpen, CreditCard, MessageSquare } from "lucide-react";

interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isBanned: boolean;
  preferredLanguage: string;
  createdAt: string;
  enrollments: { id: string; courseName: string; status: string; planType: string; createdAt: string }[];
  subscriptions: { id: string; planType: string; status: string; amountUsd: string; courseName: string }[];
  chatSessions: { sessionId: string; messageCount: number; lastMessage: string }[];
  teacherProfile: { specializations: string[] | null; bio: string | null; yearsExperience: number | null } | null;
  parentWhatsapp: string | null;
}

export default function AdminUserDetailPage() {
  const t = useTranslations("admin");
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then((res) => res.json())
      .then((d) => setUser(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const tabs = [
    { key: "overview", label: t("overviewTab"), icon: User },
    { key: "enrollments", label: t("enrollmentsTab"), icon: BookOpen },
    { key: "subscriptions", label: t("subscriptionsTab"), icon: CreditCard },
    { key: "chats", label: t("chatsTab"), icon: MessageSquare },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">{t("noResults")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">{user.fullName}</h1>
        {user.isBanned && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full dark:bg-red-900/30 dark:text-red-400">
            Banned
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("email")}</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("role")}</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("joined")}</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Language</p>
              <p className="font-medium uppercase">{user.preferredLanguage}</p>
            </div>
            {user.role === "student" && (
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-mono font-medium text-primary">
                  TBA-{user.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            )}
            {user.role === "student" && (
              <div>
                <p className="text-sm text-muted-foreground">Parent WhatsApp</p>
                <p className="font-medium">
                  {user.parentWhatsapp || (
                    <span className="text-muted-foreground text-sm">Not provided</span>
                  )}
                </p>
              </div>
            )}
            {user.role === "teacher" && user.teacherProfile && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Teaching Specializations</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.teacherProfile.specializations && user.teacherProfile.specializations.length > 0 ? (
                    user.teacherProfile.specializations.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Not specified</span>
                  )}
                </div>
              </div>
            )}
            {user.role === "teacher" && user.teacherProfile?.yearsExperience != null && (
              <div>
                <p className="text-sm text-muted-foreground">Years of Experience</p>
                <p className="font-medium">{user.teacherProfile.yearsExperience} years</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "enrollments" && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start px-4 py-3 font-medium">Course</th>
                <th className="text-start px-4 py-3 font-medium">Plan</th>
                <th className="text-start px-4 py-3 font-medium">{t("status")}</th>
                <th className="text-start px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {user.enrollments.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3">{e.courseName}</td>
                  <td className="px-4 py-3 capitalize">{e.planType.replace("_", " + ")}</td>
                  <td className="px-4 py-3 capitalize">{e.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!user.enrollments.length && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">{t("noResults")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start px-4 py-3 font-medium">Course</th>
                <th className="text-start px-4 py-3 font-medium">Plan</th>
                <th className="text-start px-4 py-3 font-medium">Amount</th>
                <th className="text-start px-4 py-3 font-medium">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {user.subscriptions.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.courseName}</td>
                  <td className="px-4 py-3 capitalize">{s.planType.replace("_", " + ")}</td>
                  <td className="px-4 py-3">${s.amountUsd}</td>
                  <td className="px-4 py-3 capitalize">{s.status}</td>
                </tr>
              ))}
              {!user.subscriptions.length && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">{t("noResults")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "chats" && (
        <div className="bg-card border rounded-xl p-6 space-y-3">
          {user.chatSessions.map((session) => (
            <div key={session.sessionId} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Session: {session.sessionId.slice(0, 8)}...</span>
                <span className="text-xs text-muted-foreground">{session.messageCount} messages</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{session.lastMessage}</p>
            </div>
          ))}
          {!user.chatSessions.length && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("noResults")}</p>
          )}
        </div>
      )}
    </div>
  );
}
