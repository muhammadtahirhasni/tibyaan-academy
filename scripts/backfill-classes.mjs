/**
 * One-time backfill: create classes records for already-approved schedule requests
 * that have a matching enrollment but no class records yet.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DIRECT_URL);

// --- timezone util (mirrors the API route logic) ---
function nextOccurrenceUTC(dayName, timeStr, timezone) {
  const dayMap = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
  const target = dayMap[dayName] ?? 1;
  const [h, m] = (timeStr || "09:00").split(":").map(Number);
  const now = new Date();

  for (let i = 1; i <= 8; i++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + i);

    const weekdayLong = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long" }).format(candidate);
    if ((dayMap[weekdayLong] ?? -1) !== target) continue;

    const localDateStr = candidate.toLocaleDateString("en-CA", { timeZone: timezone });
    const naiveUtc = new Date(`${localDateStr}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00Z`);

    const localStr = naiveUtc.toLocaleString("en-US", {
      timeZone: timezone, hour12: false,
      year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit",
    });
    const localAsUtc = new Date(
      localStr.replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, "$3-$1-$2T$4:$5:$6Z").replace("T24:","T00:")
    );
    const offsetMs = naiveUtc.getTime() - localAsUtc.getTime();
    const scheduledAt = new Date(naiveUtc.getTime() + offsetMs);

    if (scheduledAt > now) return scheduledAt;
  }

  const fallback = new Date(now);
  fallback.setDate(now.getDate() + 7);
  fallback.setUTCHours(h, m, 0, 0);
  return fallback;
}

// Get all approved requests with enrollment info
const approved = await sql`
  SELECT
    sr.id, sr.student_id, sr.teacher_id, sr.course_id,
    sr.preferred_days, sr.preferred_time, sr.timezone,
    s.full_name as student_name,
    e.id as enrollment_id
  FROM schedule_requests sr
  JOIN users s ON sr.student_id = s.id
  LEFT JOIN enrollments e ON (e.student_id = sr.student_id AND e.course_id = sr.course_id)
  WHERE sr.status = 'approved'
`;

let created = 0;

for (const req of approved) {
  if (!req.enrollment_id) {
    console.log(`⚠️  ${req.student_name}: no enrollment for this course — skipping`);
    continue;
  }

  const days = req.preferred_days ?? [];
  const startTime = req.preferred_time?.start ?? "09:00";
  const timezone = req.timezone || "UTC";

  for (const day of days) {
    const scheduledAt = nextOccurrenceUTC(day, startTime, timezone);

    // Check if a class already exists for this enrollment+teacher+time
    const existing = await sql`
      SELECT id FROM classes
      WHERE enrollment_id = ${req.enrollment_id}
        AND teacher_id = ${req.teacher_id}
        AND scheduled_at = ${scheduledAt.toISOString()}
    `;

    if (existing.length > 0) {
      console.log(`  ↳ ${req.student_name} | ${day}: class already exists`);
      continue;
    }

    await sql`
      INSERT INTO classes (enrollment_id, teacher_id, scheduled_at, duration_minutes, status)
      VALUES (${req.enrollment_id}, ${req.teacher_id}, ${scheduledAt.toISOString()}, 60, 'scheduled')
    `;
    console.log(`  ✓ ${req.student_name} | ${day} at ${scheduledAt.toISOString()}`);
    created++;
  }
}

console.log(`\nDone. Created ${created} class record(s).`);
