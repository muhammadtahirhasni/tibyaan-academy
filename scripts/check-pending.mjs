import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DIRECT_URL);

const pending = await sql`
  SELECT sr.id, sr.status, sr.created_at,
         s.full_name as student_name, s.id as student_id,
         t.full_name as teacher_name
  FROM schedule_requests sr
  JOIN users s ON sr.student_id = s.id
  JOIN users t ON sr.teacher_id = t.id
  WHERE sr.status = 'pending'
  ORDER BY sr.created_at DESC
`;
console.log(`Pending requests (${pending.length} total):`);
pending.forEach(r => console.log(`  ${r.student_name} → ${r.teacher_name} (${r.created_at})`));

console.log("\n--- All statuses count ---");
const counts = await sql`SELECT status, count(*) FROM schedule_requests GROUP BY status`;
counts.forEach(r => console.log(`  ${r.status}: ${r.count}`));
