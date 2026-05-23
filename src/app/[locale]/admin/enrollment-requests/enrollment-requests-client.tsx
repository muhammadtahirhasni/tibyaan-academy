"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Users, RefreshCw } from "lucide-react";

interface Request {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  course: string;
  plan: string;
  message: string | null;
  locale: string;
  status: string;
  created_at: string;
}

export default function EnrollmentRequestsClient() {
  const t = useTranslations("admin");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = () => {
    setLoading(true);
    fetch("/api/enrollment-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch_(); }, []);

  const markContacted = async (id: string) => {
    await fetch(`/api/enrollment-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "contacted" }) });
    fetch_();
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  const pending = requests.filter((r) => r.status === "pending");
  const contacted = requests.filter((r) => r.status !== "pending");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{t("sidebarEnrollmentRequests")}</h1>
          {pending.length > 0 && (
            <Badge className="bg-accent text-white">{pending.length} new</Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={fetch_}>
          <RefreshCw className="w-4 h-4 me-2" /> Refresh
        </Button>
      </div>

      {requests.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No enrollment requests yet.</p>
      )}

      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="border rounded-xl p-5 bg-card hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{req.name}</span>
                  <Badge variant="secondary" className="text-xs">{req.country}</Badge>
                  <Badge variant="outline" className="text-xs">{req.locale?.toUpperCase()}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <a href={`mailto:${req.email}`} className="hover:underline text-primary">{req.email}</a>
                  {" · "}
                  <a href={`https://wa.me/${req.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent">{req.whatsapp}</a>
                </div>
                <div className="text-sm text-foreground">
                  <span className="font-medium">{req.course}</span>
                  {" · "}
                  <span className="text-muted-foreground">{req.plan === "plan1" ? "Human Teacher + AI" : "AI Only"}</span>
                </div>
                {req.message && (
                  <p className="text-xs text-muted-foreground italic mt-1">&ldquo;{req.message}&rdquo;</p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(req.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {req.status === "pending" ? (
                  <Button size="sm" variant="outline" onClick={() => markContacted(req.id)}>
                    <CheckCircle2 className="w-4 h-4 me-1 text-accent" /> Mark Contacted
                  </Button>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Contacted</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {pending.length > 0 && contacted.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {pending.length} pending · {contacted.length} contacted
        </p>
      )}
    </div>
  );
}
