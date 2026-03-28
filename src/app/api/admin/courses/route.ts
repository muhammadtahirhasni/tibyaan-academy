import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { courses, enrollments } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();
    const courseList = await db
      .select({
        id: courses.id,
        slug: courses.slug,
        nameEn: courses.nameEn,
        nameUr: courses.nameUr,
        nameAr: courses.nameAr,
        nameFr: courses.nameFr,
        nameId: courses.nameId,
        courseType: courses.courseType,
        pricePlan1Monthly: courses.pricePlan1Monthly,
        pricePlan2Monthly: courses.pricePlan2Monthly,
        isActive: courses.isActive,
        enrollmentCount: count(enrollments.id),
      })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .groupBy(courses.id)
      .orderBy(sql`${courses.createdAt} DESC`);

    return NextResponse.json({ courses: courseList });
  } catch (error) {
    console.error("Admin courses error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const db = getDb();

    const [newCourse] = await db.insert(courses).values({
      slug: body.slug,
      nameEn: body.nameEn,
      nameUr: body.nameUr || body.nameEn,
      nameAr: body.nameAr || body.nameEn,
      nameFr: body.nameFr || body.nameEn,
      nameId: body.nameId || body.nameEn,
      courseType: body.courseType,
      pricePlan1Monthly: body.pricePlan1Monthly || null,
      pricePlan2Monthly: body.pricePlan2Monthly || null,
      descriptionEn: body.descriptionEn || null,
      descriptionUr: body.descriptionUr || null,
      descriptionAr: body.descriptionAr || null,
      descriptionFr: body.descriptionFr || null,
      descriptionId: body.descriptionId || null,
    }).returning();

    return NextResponse.json({ course: newCourse }, { status: 201 });
  } catch (error) {
    console.error("Admin create course error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
