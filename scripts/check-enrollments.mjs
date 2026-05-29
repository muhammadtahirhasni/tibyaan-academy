import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DIRECT_URL);

// Check enrollments for students who have approved schedule requests
const data = await sql`
  SELECT
    sr.id as request_id,
    sr.status as request_status,
    sr.preferred_days,
    sr.preferred_time,
    sr.timezone,
    sr.selected_slot,
    s.id as student_id,
    s.full_name as student_name,
    t.id as teacher_id,
    t.full_name as teacher_name,
    c.id as course_id,
    c.name_en as course_name,
    e.id as enrollment_id,
    e.status as enrollment_status,
    e.plan_type
  FROM schedule_requests sr
  JOIN users s ON sr.student_id = s.id
  JOIN users t ON sr.teacher_id = t.id
  JOIN courses c ON sr.course_id = c.id
  LEFT JOIN enrollments e ON (e.student_id = sr.student_id AND e.course_id = sr.course_id)
  WHERE sr.status = 'approved'
  ORDER BY sr.created_at DESC
`;

console.log("Approved requests + enrollment status:");
data.forEach(r => {
  console.log(`\n[${r.request_id.slice(0,8)}]`);
  console.log(`  Student: ${r.student_name}`);
  console.log(`  Teacher: ${r.teacher_name}`);
  console.log(`  Course: ${r.course_name}`);
  console.log(`  Days: ${JSON.stringify(r.preferred_days)}`);
  console.log(`  Time: ${JSON.stringify(r.preferred_time)}`);
  console.log(`  Timezone: ${r.timezone}`);
  console.log(`  Enrollment: ${r.enrollment_id ? `YES (${r.enrollment_id.slice(0,8)}) status=${r.enrollment_status} plan=${r.plan_type}` : 'NONE'}`);
});

// Also check existing classes
const classes = await sql`SELECT count(*) as cnt FROM classes`;
console.log(`\nTotal classes records: ${classes[0].cnt}`);
