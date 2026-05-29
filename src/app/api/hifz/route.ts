import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { hifzTracker } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// Full list of 114 Quran surahs with ayah counts
const SURAH_AYAHS: Record<number, number> = {
  1:7,2:286,3:200,4:176,5:120,6:165,7:206,8:75,9:129,10:109,
  11:123,12:111,13:43,14:52,15:99,16:128,17:111,18:110,19:98,20:135,
  21:112,22:78,23:118,24:64,25:77,26:227,27:93,28:88,29:69,30:60,
  31:34,32:30,33:73,34:54,35:45,36:83,37:182,38:88,39:75,40:85,
  41:54,42:53,43:89,44:59,45:37,46:35,47:38,48:29,49:18,50:45,
  51:60,52:49,53:62,54:55,55:78,56:96,57:29,58:22,59:24,60:13,
  61:14,62:11,63:11,64:18,65:12,66:12,67:30,68:52,69:52,70:44,
  71:28,72:28,73:20,74:56,75:40,76:31,77:50,78:40,79:46,80:42,
  81:29,82:19,83:36,84:25,85:22,86:17,87:19,88:26,89:30,90:20,
  91:15,92:21,93:11,94:8,95:8,96:19,97:5,98:8,99:8,100:11,
  101:11,102:8,103:3,104:9,105:5,106:4,107:7,108:3,109:6,110:3,
  111:5,112:4,113:5,114:6,
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const records = await db
      .select()
      .from(hifzTracker)
      .where(eq(hifzTracker.studentId, user.id))
      .orderBy(desc(hifzTracker.createdAt))
      .limit(500);

    // Calculate totals
    const totalAyaatMemorized = records
      .filter((r) => r.type === "sabaq")
      .reduce((sum, r) => sum + (Number(r.ayahTo) - Number(r.ayahFrom) + 1), 0);

    const uniqueSurahs = new Set(
      records.filter((r) => r.type === "sabaq").map((r) => r.surahNumber)
    ).size;

    const scores = records.filter((r) => r.score != null).map((r) => Number(r.score));
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Current streak (consecutive days with any entry)
    const dates = [...new Set(records.map((r) => r.createdAt.toISOString().slice(0, 10)))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(new Date(today).getTime() - i * 86400000).toISOString().slice(0, 10);
      if (dates[i] === expected) streak++;
      else break;
    }

    return NextResponse.json({
      records,
      stats: { totalAyaatMemorized, uniqueSurahs, avgScore, streak },
      surahAyahs: SURAH_AYAHS,
    });
  } catch (err) {
    console.error("GET /api/hifz error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { surahNumber, ayahFrom, ayahTo, type, assessment, notes } = body;

    if (!surahNumber || !ayahFrom || !ayahTo || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const scoreMap: Record<string, number> = { good: 90, okay: 65, difficult: 40 };

    const db = getDb();
    const [inserted] = await db
      .insert(hifzTracker)
      .values({
        studentId: user.id,
        surahNumber: Number(surahNumber),
        ayahFrom: Number(ayahFrom),
        ayahTo: Number(ayahTo),
        type,
        status: "pending",
        score: assessment ? scoreMap[assessment] ?? null : null,
        aiFeedback: notes || null,
        lastRecitedAt: new Date(),
        nextRevisionAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .returning();

    return NextResponse.json({ success: true, record: inserted });
  } catch (err) {
    console.error("POST /api/hifz error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
