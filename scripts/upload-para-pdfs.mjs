#!/usr/bin/env node
// Uploads Quran Para PDFs to Supabase with safe filenames (Para-1.pdf ... Para-30.pdf)
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const paraDir = join(__dirname, "../public/Quran Parah Images");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "course-pdfs";
const FOLDER = "Quran Parah Images";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const PARA_NAMES = {
  1: "Alif Lam Meem",       2: "Sayaqool",          3: "Tilkal Rusul",
  4: "Lan Tanaloo",         5: "Wal Muhsanaat",      6: "La Yuhibbullah",
  7: "Wa Iza Samiu",        8: "Wa Lau Annana",      9: "Qalal Malao",
  10: "Wa Alamu",           11: "Yatazeroon",        12: "Wa Ma Min Daabbah",
  13: "Wa Ma Ubarriy",      14: "Rubama",            15: "Subhanallazi",
  16: "Qal Alam",           17: "Iqtaraba",          18: "Qad Aflaha",
  19: "Wa Qalallazina",     20: "Aman Khalaq",       21: "Utlu Ma Uhiya",
  22: "Wa Man Yaqnut",      23: "Wa Mali",           24: "Faman Azlam",
  25: "Ilayhi Yuraddu",     26: "Ha Meem",           27: "Qala Fama Khatbukum",
  28: "Qad Sami Allah",     29: "Tabarakallazi",     30: "Amma",
};

async function main() {
  console.log("📖 Uploading Quran Para PDFs...\n");

  const allFiles = readdirSync(paraDir);

  for (let n = 1; n <= 30; n++) {
    // Find the PDF for this Para number
    const match = allFiles.find((f) => {
      const lower = f.toLowerCase();
      return lower.endsWith(".pdf") && (
        lower.startsWith(`para ${n} `) || lower.startsWith(`para ${n}.`) || lower === `para ${n}.pdf`
      );
    });

    if (!match) {
      console.log(`  Para ${n}: ❌ PDF not found`);
      continue;
    }

    const localPath = join(paraDir, match);
    const storagePath = `${FOLDER}/Para-${n}.pdf`;

    process.stdout.write(`  Para ${n} (${PARA_NAMES[n]}): `);

    try {
      const fileData = readFileSync(localPath);
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileData, {
        contentType: "application/pdf",
        upsert: true,
      });

      if (error) {
        console.log(`❌ ${error.message}`);
      } else {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
        console.log(`✅ ${data.publicUrl}`);
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
  }

  console.log("\n✅ Done.");
  const base = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}`;
  console.log(`\nURL pattern: ${base}/Para-N.pdf`);
}

main().catch(console.error);
