import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DIRECT_URL);

const users = await sql`SELECT id, full_name, email, role, created_at FROM users ORDER BY role, created_at`;
console.log("=== ALL USERS ===");
users.forEach(u => console.log(`[${u.role}] ${u.full_name} | ${u.email} | ${u.id.slice(0,8)}`));

const classes = await sql`
  SELECT c.id, c.scheduled_at, c.meeting_link, c.status,
         s.full_name as student, t.full_name as teacher, co.name_en as course
  FROM classes c
  JOIN enrollments e ON c.enrollment_id = e.id
  JOIN users s ON e.student_id = s.id
  JOIN users t ON c.teacher_id = t.id
  JOIN courses co ON e.course_id = co.id
  ORDER BY c.scheduled_at
`;
console.log("\n=== ALL CLASSES ===");
classes.forEach(c => console.log(`${c.scheduled_at} | ${c.student} → ${c.teacher} | ${c.course} | link=${c.meeting_link ?? 'NULL'} | id=${c.id}`));
