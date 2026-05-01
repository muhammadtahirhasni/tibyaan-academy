import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DIRECT_URL);

const matches = await sql`SELECT m.id, m.status, s.full_name as student, t.full_name as teacher, c.name_en as course, m.created_at FROM teacher_student_matches m JOIN users s ON m.student_id = s.id JOIN users t ON m.teacher_id = t.id JOIN courses c ON m.course_id = c.id ORDER BY m.created_at DESC LIMIT 20`;
console.log('=== teacher_student_matches ===', matches.length);
matches.forEach(m => console.log(`[${m.status}] ${m.student} → ${m.teacher} | ${m.course}`));

const sr = await sql`SELECT sr.id, sr.status, s.full_name as student, t.full_name as teacher, c.name_en as course FROM schedule_requests sr JOIN users s ON sr.student_id = s.id JOIN users t ON sr.teacher_id = t.id JOIN courses c ON sr.course_id = c.id ORDER BY sr.created_at DESC LIMIT 20`;
console.log('\n=== schedule_requests ===', sr.length);
sr.forEach(r => console.log(`[${r.status}] ${r.student} → ${r.teacher} | ${r.course}`));
