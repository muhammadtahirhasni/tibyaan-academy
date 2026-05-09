"use client";

import { useState, useEffect } from "react";
import { Video, Inbox, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type Recording = {
  id: string;
  title: string;
  recordingUrl: string;
  classDate: string;
  notes: string | null;
};

export default function StudentClassRecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/class-recordings")
      .then((r) => r.json())
      .then((d) => setRecordings(d.recordings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
          <Video className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Class Recordings</h1>
          <p className="text-sm text-muted-foreground">Recordings uploaded by admin for your classes</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No class recordings available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordings.map((rec) => (
            <div key={rec.id} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 h-32 flex items-center justify-center">
                <Video className="w-12 h-12 text-white/80" />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-foreground text-sm line-clamp-1">{rec.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(rec.classDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                {rec.notes && <p className="text-xs text-muted-foreground line-clamp-2">{rec.notes}</p>}
                <a href={rec.recordingUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white">
                    <ExternalLink className="w-3.5 h-3.5 me-1.5" />
                    Watch Recording
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
