/**
 * Reset all scheduling/class data — keep user accounts intact.
 * Deletes: classes, schedule_requests, enrollments
 * Keeps: users, courses, and all other tables
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DIRECT_URL);

console.log("=== BEFORE RESET ===");
const [{ classes }] = await sql`SELECT COUNT(*)::int AS classes FROM classes`;
const [{ reqs }]    = await sql`SELECT COUNT(*)::int AS reqs FROM schedule_requests`;
const [{ enroll }]  = await sql`SELECT COUNT(*)::int AS enroll FROM enrollments`;
const [{ usrs }]    = await sql`SELECT COUNT(*)::int AS usrs FROM users`;
console.log(`Classes: ${classes} | Schedule Requests: ${reqs} | Enrollments: ${enroll} | Users: ${usrs}`);

// Order matters — FK constraints: classes → enrollments
console.log("\nDeleting classes...");
await sql`DELETE FROM classes`;

console.log("Deleting schedule_requests...");
await sql`DELETE FROM schedule_requests`;

console.log("Deleting enrollments...");
await sql`DELETE FROM enrollments`;

console.log("\n=== AFTER RESET ===");
const [after] = await sql`
  SELECT
    (SELECT COUNT(*)::int FROM classes) AS classes,
    (SELECT COUNT(*)::int FROM schedule_requests) AS schedule_requests,
    (SELECT COUNT(*)::int FROM enrollments) AS enrollments,
    (SELECT COUNT(*)::int FROM users) AS users
`;
console.log(`Classes: ${after.classes} | Requests: ${after.schedule_requests} | Enrollments: ${after.enrollments} | Users: ${after.users}`);
console.log("\n✓ Done. All 12 user accounts preserved. Scheduling data cleared.");
