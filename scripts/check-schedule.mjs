import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DIRECT_URL);

// All schedule requests with status
const all = await sql`
  SELECT sr.id, sr.status, sr.student_id, sr.teacher_id, sr.course_id,
         sr.preferred_days, sr.preferred_time, sr.selected_slot,
         s.full_name as student_name, s.role as student_role,
         t.full_name as teacher_name, t.role as teacher_role,
         c.name_en as course_name
  FROM schedule_requests sr
  JOIN users s ON sr.student_id = s.id
  JOIN users t ON sr.teacher_id = t.id
  JOIN courses c ON sr.course_id = c.id
  ORDER BY sr.created_at DESC
  LIMIT 10
`;
console.log("All schedule requests with joins:");
all.forEach(r => console.log(`  [${r.status}] Student: ${r.student_name}(${r.student_role}) → Teacher: ${r.teacher_name}(${r.teacher_role}) → ${r.course_name} | days=${JSON.stringify(r.preferred_days)} | slot=${JSON.stringify(r.selected_slot)}`));
