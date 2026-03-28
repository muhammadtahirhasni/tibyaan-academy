"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Users, DollarSign, CreditCard, UserPlus, TrendingUp } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  newUsersThisMonth: number;
  revenueByMonth: { month: string; amount: number }[];
  popularCourses: { name: string; enrollments: number }[];
  userGrowth: { month: string; count: number }[];
  countries: { country: string; count: number }[];
  conversionRate: number;
}

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: t("totalUsers"), value: data?.totalUsers ?? 0, icon: Users, color: "bg-blue-500" },
    { label: t("totalRevenue"), value: `$${data?.totalRevenue ?? 0}`, icon: DollarSign, color: "bg-green-500" },
    { label: t("activeSubscriptions"), value: data?.activeSubscriptions ?? 0, icon: CreditCard, color: "bg-purple-500" },
    { label: t("newUsersThisMonth"), value: data?.newUsersThisMonth ?? 0, icon: UserPlus, color: "bg-orange-500" },
  ];

  const maxRevenue = Math.max(...(data?.revenueByMonth?.map((r) => r.amount) ?? [1]));
  const maxGrowth = Math.max(...(data?.userGrowth?.map((g) => g.count) ?? [1]));
  const maxCountry = Math.max(...(data?.countries?.map((c) => c.count) ?? [1]));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">{t("revenueChart")}</h3>
          <div className="flex items-end gap-2 h-48">
            {(data?.revenueByMonth ?? Array(6).fill({ month: "...", amount: 0 })).map(
              (item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-green-500 rounded-t-md transition-all duration-500"
                    style={{
                      height: `${maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0}%`,
                      minHeight: "4px",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">{t("popularCourses")}</h3>
          <div className="space-y-3">
            {(data?.popularCourses ?? []).map((course, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{course.name}</span>
                    <span className="text-muted-foreground">{course.enrollments}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          5,
                          (course.enrollments / Math.max(...(data?.popularCourses?.map((c) => c.enrollments) ?? [1]))) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {!data?.popularCourses?.length && !loading && (
              <p className="text-sm text-muted-foreground">{t("noResults")}</p>
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">{t("userGrowth")}</h3>
          <div className="flex items-end gap-2 h-48">
            {(data?.userGrowth ?? Array(6).fill({ month: "...", count: 0 })).map(
              (item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                    style={{
                      height: `${maxGrowth > 0 ? (item.count / maxGrowth) * 100 : 0}%`,
                      minHeight: "4px",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Country Distribution + Conversion */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">{t("countryDistribution")}</h3>
          <div className="space-y-2 mb-6">
            {(data?.countries ?? []).slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm w-20 truncate">{c.country || "Unknown"}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 rounded-full h-2"
                    style={{ width: `${maxCountry > 0 ? (c.count / maxCountry) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">{c.count}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("conversionRate")}</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold">
                  {loading ? "..." : `${data?.conversionRate ?? 0}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
