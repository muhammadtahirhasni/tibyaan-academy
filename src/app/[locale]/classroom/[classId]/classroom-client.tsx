"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Video, Clock, BookOpen, Users, PhoneOff,
  Wifi, WifiOff, Loader2, AlertCircle, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClassData {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  meetingLink: string | null;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseNameEn: string;
  courseNameUr: string | null;
  courseNameAr: string | null;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JitsiMeetExternalAPI: new (domain: string, options: Record<string, unknown>) => any;
  }
}

export function ClassroomClient({
  classId,
  userId,
  locale,
}: {
  classId: string;
  userId: string;
  locale: string;
}) {
  const router = useRouter();
  const jitsiRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiRef = useRef<any>(null);

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);
  const [ended, setEnded] = useState(false);

  // Fetch class data
  useEffect(() => {
    fetch(`/api/classroom/${classId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setClassData(data);
      })
      .catch(() => setError("Failed to load class data"))
      .finally(() => setLoading(false));
  }, [classId]);

  // Session timer
  useEffect(() => {
    if (!classData || ended) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [classData, ended]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Load Jitsi IFrame API and start call
  const startJitsi = useCallback(() => {
    if (!classData?.meetingLink || !jitsiRef.current) return;

    const roomName = classData.meetingLink.replace("https://meet.jit.si/", "");
    const isTeacher = userId === classData.teacherId;
    const displayName = isTeacher ? classData.teacherName : classData.studentName;

    const options = {
      roomName,
      parentNode: jitsiRef.current,
      userInfo: { displayName },
      lang: locale === "ar" ? "ar" : "en",
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        disableInviteFunctions: true,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "desktop", "chat",
          "recording", "tileview", "hangup", "fullscreen",
          "participants-pane", "settings",
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DEFAULT_REMOTE_DISPLAY_NAME: "Participant",
        MOBILE_APP_PROMO: false,
        HIDE_INVITE_MORE_HEADER: true,
      },
    };

    apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", options);
    apiRef.current.addEventListeners({
      videoConferenceJoined: () => setJitsiReady(true),
      readyToClose: () => handleEnd(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData, userId, locale]);

  // Inject Jitsi script once class data is loaded
  useEffect(() => {
    if (!classData) return;
    if (window.JitsiMeetExternalAPI) { startJitsi(); return; }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => startJitsi();
    document.head.appendChild(script);

    return () => {
      apiRef.current?.dispose?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData]);

  const handleEnd = useCallback(async () => {
    if (ending || ended) return;
    setEnding(true);
    try {
      apiRef.current?.executeCommand?.("hangup");
      await fetch(`/api/classroom/${classId}`, { method: "POST" });
    } finally {
      setEnded(true);
      setEnding(false);
    }
  }, [classId, ending, ended]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-muted-foreground">{error ?? "Class not found"}</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (ended) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-background text-center px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
          <Video className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Class Ended</h2>
          <p className="text-muted-foreground mt-1">
            Duration: {formatTime(elapsed)} · {classData.courseNameEn}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push(userId === classData.teacherId ? "/teacher/schedule" : "/student/schedule")}>
            Back to Schedule
          </Button>
          <Button variant="outline" onClick={() => router.push(userId === classData.teacherId ? "/teacher/dashboard" : "/student/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isTeacher = userId === classData.teacherId;

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-white text-sm font-semibold">{classData.courseNameEn}</p>
            <p className="text-gray-400 text-xs">
              {isTeacher ? classData.studentName : classData.teacherName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live timer */}
          <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-mono">
            <Clock className="w-4 h-4" />
            {formatTime(elapsed)}
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            {jitsiReady ? (
              <Badge className="bg-emerald-900 text-emerald-400 border-0 text-xs">
                <Wifi className="w-3 h-3 me-1" /> Live
              </Badge>
            ) : (
              <Badge className="bg-gray-800 text-gray-400 border-0 text-xs">
                <WifiOff className="w-3 h-3 me-1" /> Connecting…
              </Badge>
            )}
          </div>

          {/* End class — teacher only */}
          {isTeacher && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleEnd}
              disabled={ending}
              className="bg-red-700 hover:bg-red-800"
            >
              <PhoneOff className="w-4 h-4 me-1.5" />
              {ending ? "Ending…" : "End Class"}
            </Button>
          )}
        </div>
      </div>

      {/* Main content: Jitsi (left) + Info panel (right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Jitsi video call */}
        <div className="flex-1 min-w-0" ref={jitsiRef} />

        {/* Right panel: class info + resources */}
        <div className="w-72 shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col overflow-y-auto">
          {/* Class info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-white text-sm font-semibold">Class Info</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Course</span>
                <span className="text-white text-right max-w-[150px]">{classData.courseNameEn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Student</span>
                <span className="text-white">{classData.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Teacher</span>
                <span className="text-white">{classData.teacherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">{classData.durationMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scheduled</span>
                <span className="text-white">
                  {new Date(classData.scheduledAt).toLocaleTimeString("en-US", {
                    hour: "numeric", minute: "2-digit", hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* How to use */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-semibold">During Class</span>
            </div>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li>• Use mic & camera buttons to toggle audio/video</li>
              <li>• Share your screen with the Screen button</li>
              <li>• Open Chat for text messages</li>
              <li>• Recording saves automatically to Dropbox if enabled</li>
              <li>• Use Tile View to see everyone equally</li>
              {isTeacher && (
                <li className="text-red-400">• Click End Class when session is done</li>
              )}
            </ul>
          </div>

          {/* Resources placeholder */}
          <div className="p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-white text-sm font-semibold">Resources</span>
            </div>
            <div className="rounded-lg bg-gray-800 border border-gray-700 p-3 text-center">
              <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                Course books and materials will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
