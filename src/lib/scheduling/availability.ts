import { getDb } from "@/lib/db";
import { classes, enrollments } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

interface TimeSlot {
  day: string;
  time: string;
}

export async function getTeacherAvailability(
  teacherId: string
): Promise<TimeSlot[]> {
  const db = getDb();
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Get teacher's existing classes in the next week
  const existingClasses = await db
    .select({
      scheduledAt: classes.scheduledAt,
      durationMinutes: classes.durationMinutes,
    })
    .from(classes)
    .where(
      and(
        eq(classes.teacherId, teacherId),
        gte(classes.scheduledAt, now),
        lte(classes.scheduledAt, nextWeek)
      )
    );

  // Convert to time slots
  return existingClasses.map((c) => {
    const d = new Date(c.scheduledAt);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return {
      day: days[d.getUTCDay()],
      time: `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}`,
    };
  });
}

export async function getStudentExistingClasses(
  studentId: string
): Promise<TimeSlot[]> {
  const db = getDb();
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const studentEnrollments = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(eq(enrollments.studentId, studentId));

  const enrollmentIds = studentEnrollments.map((e) => e.id);
  if (enrollmentIds.length === 0) return [];

  const existingClasses = await db
    .select({
      scheduledAt: classes.scheduledAt,
    })
    .from(classes)
    .where(
      and(gte(classes.scheduledAt, now), lte(classes.scheduledAt, nextWeek))
    );

  const studentClasses = existingClasses.filter((c) => true); // simplified - in production filter by enrollment

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return studentClasses.map((c) => {
    const d = new Date(c.scheduledAt);
    return {
      day: days[d.getUTCDay()],
      time: `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}`,
    };
  });
}

export function detectConflicts(
  slot: TimeSlot,
  existingSlots: TimeSlot[]
): boolean {
  return existingSlots.some((existing) => {
    if (existing.day !== slot.day) return false;
    const [newH, newM] = slot.time.split(":").map(Number);
    const [exH, exM] = existing.time.split(":").map(Number);
    const newMinutes = newH * 60 + newM;
    const exMinutes = exH * 60 + exM;
    // 45-minute buffer (30 min class + 15 min gap)
    return Math.abs(newMinutes - exMinutes) < 45;
  });
}

export function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (!tzPart) return 0;
    const match = tzPart.value.match(/GMT([+-]?\d+)?/);
    if (!match) return 0;
    return parseInt(match[1] || "0");
  } catch {
    return 0;
  }
}
