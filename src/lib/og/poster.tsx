import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Brand palette — kept in sync with globals.css.
const GREEN = "#1B4332";
const GREEN_DEEP = "#12301F";
const GOLD = "#C9A84C";

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");

let cachedFonts: Array<{
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 700;
  style: "normal";
}> | null = null;

/**
 * Latin and Arabic faces are both loaded explicitly — satori has no system
 * fonts, so an unlisted script renders as empty boxes. Read once per lambda.
 *
 * Cairo is the Arabic face because satori cannot shape most Naskh fonts:
 * Noto Naskh Arabic, Noto Sans Arabic, Amiri and Scheherazade all fail with
 * "lookupType: 5 - substFormat: 3 is not yet supported". Cairo and Tajawal
 * were the two that rendered. Verify any replacement before swapping it in.
 */
async function loadFonts() {
  if (cachedFonts) return cachedFonts;

  const [latinSemi, latinBold, arabicBold] = await Promise.all([
    readFile(path.join(FONT_DIR, "noto-sans-latin-600-normal.woff")),
    readFile(path.join(FONT_DIR, "noto-sans-latin-700-normal.woff")),
    readFile(path.join(FONT_DIR, "cairo-arabic-700-normal.woff")),
  ]);

  cachedFonts = [
    { name: "Noto Sans", data: latinSemi.buffer as ArrayBuffer, weight: 600, style: "normal" },
    { name: "Noto Sans", data: latinBold.buffer as ArrayBuffer, weight: 700, style: "normal" },
    { name: "Cairo", data: arabicBold.buffer as ArrayBuffer, weight: 700, style: "normal" },
  ];
  return cachedFonts;
}

export interface PosterInput {
  title: string;
  category?: string | null;
  citation?: string | null;
}

function titleSize(title: string): number {
  if (title.length > 110) return 44;
  if (title.length > 75) return 52;
  if (title.length > 45) return 62;
  return 72;
}

/**
 * One template for every dars and blog poster: logo mark, category label,
 * title, and the citation line, on the brand green.
 */
export async function renderPoster({ title, category, citation }: PosterInput) {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DEEP} 100%)`,
          // Both faces listed so a mixed Arabic/English title renders fully.
          fontFamily: "Noto Sans, Cairo",
        }}
      >
        {/* Gold rule across the top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: GOLD,
          }}
        />

        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: GOLD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: GREEN,
              fontSize: 38,
              fontWeight: 700,
            }}
          >
            ت
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#FFFFFF", fontSize: 30, fontWeight: 700 }}>
              Tibyaan Academy
            </span>
            <span style={{ color: GOLD, fontSize: 19, fontWeight: 600 }}>
              Quran &amp; Islamic Sciences
            </span>
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1000 }}>
          {category ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 22px",
                borderRadius: 999,
                border: `2px solid ${GOLD}`,
                color: GOLD,
                fontSize: 22,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              {category}
            </div>
          ) : null}

          <div
            style={{
              color: "#FFFFFF",
              fontSize: titleSize(title),
              fontWeight: 700,
              lineHeight: 1.2,
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        {/* Citation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderTop: "2px solid rgba(201,168,76,0.35)",
            paddingTop: 24,
          }}
        >
          <div style={{ width: 6, height: 34, background: GOLD, borderRadius: 3, display: "flex" }} />
          <span
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 26,
              fontWeight: 600,
              display: "flex",
            }}
          >
            {citation?.trim() || "tibyaanacademy.com"}
          </span>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
