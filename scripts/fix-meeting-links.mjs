/**
 * Add Jitsi Meet links to all class records that have no meeting link.
 * Also removes duplicate class records (same teacher+day+enrollment overlap).
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DIRECT_URL);

// 1. Remove duplicate Umair Rafeeq classes (two enrollments → two identical time slots)
//    Keep the one with the lower ID (first created), delete the other
const dupes = await sql`
  SELECT c1.id as keep_id, c2.id as delete_id
  FROM classes c1
  JOIN classes c2 ON (
    c1.teacher_id = c2.teacher_id
    AND c1.scheduled_at = c2.scheduled_at
    AND c1.id < c2.id
  )
  JOIN enrollments e1 ON c1.enrollment_id = e1.id
  JOIN enrollments e2 ON c2.enrollment_id = e2.id
  WHERE e1.student_id = e2.student_id
`;

for (const d of dupes) {
  await sql`DELETE FROM classes WHERE id = ${d.delete_id}`;
  console.log(`Removed duplicate class ${d.delete_id} (kept ${d.keep_id})`);
}

// 2. Add Jitsi Meet link to every class that doesn't have one
const classes = await sql`SELECT id FROM classes WHERE meeting_link IS NULL`;

for (const cls of classes) {
  const room = `Tibyaan-${cls.id.replace(/-/g, "").slice(0, 16)}`;
  const link = `https://meet.jit.si/${room}`;
  await sql`UPDATE classes SET meeting_link = ${link} WHERE id = ${cls.id}`;
  console.log(`✓ Set meeting link for class ${cls.id.slice(0, 8)}: ${link}`);
}

console.log(`\nDone. ${dupes.length} duplicates removed, ${classes.length} meeting links added.`);

// Show final state
const final = await sql`
  SELECT c.id, c.scheduled_at, c.meeting_link,
         s.full_name as student, t.full_name as teacher
  FROM classes c
  JOIN enrollments e ON c.enrollment_id = e.id
  JOIN users s ON e.student_id = s.id
  JOIN users t ON c.teacher_id = t.id
  ORDER BY c.scheduled_at
`;
console.log("\n=== FINAL CLASSES ===");
final.forEach(c => console.log(`${new Date(c.scheduled_at).toLocaleString("en-GB")} | ${c.student} → ${c.teacher} | ${c.meeting_link?.slice(-20)}`));
