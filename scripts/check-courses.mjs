import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DIRECT_URL);

const courses = await sql`SELECT id, name_en FROM courses LIMIT 10`;
console.log("Courses in DB:");
console.log(JSON.stringify(courses, null, 2));

const requests = await sql`SELECT id, status, course_id, student_id FROM schedule_requests ORDER BY created_at DESC LIMIT 5`;
console.log("\nRecent schedule_requests:");
console.log(JSON.stringify(requests, null, 2));
