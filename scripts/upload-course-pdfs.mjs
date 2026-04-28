#!/usr/bin/env node
// Uploads all course PDFs to Supabase Storage (public bucket: course-pdfs)
// Run: node scripts/upload-course-pdfs.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "course-pdfs";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
    });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
    console.log(`✅ Created bucket: ${BUCKET}`);
  } else {
    console.log(`✅ Bucket exists: ${BUCKET}`);
  }
}

function findPdfs(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findPdfs(fullPath));
    } else if (entry.toLowerCase().endsWith(".pdf")) {
      results.push(fullPath);
    }
  }
  return results;
}

async function uploadPdf(filePath) {
  const relPath = relative(publicDir, filePath);
  const sizeMB = (statSync(filePath).size / 1024 / 1024).toFixed(1);
  process.stdout.write(`  Uploading (${sizeMB}MB): ${relPath} ... `);

  const fileData = readFileSync(filePath);
  const { error } = await supabase.storage.from(BUCKET).upload(relPath, fileData, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(relPath);
  console.log(`✅`);
  return { relPath, publicUrl: data.publicUrl };
}

async function main() {
  console.log("🚀 Starting course PDF upload to Supabase Storage...\n");
  await ensureBucket();

  const pdfFolders = ["Aalim Course", "Arabic Language", "Nazra", "Quran Parah Images"];
  const allPdfs = [];

  for (const folder of pdfFolders) {
    const folderPath = join(publicDir, folder);
    try {
      allPdfs.push(...findPdfs(folderPath));
    } catch {
      console.log(`  Skipping ${folder} (not found)`);
    }
  }

  console.log(`\nFound ${allPdfs.length} PDF files to upload.\n`);

  const results = [];
  for (const pdf of allPdfs) {
    const result = await uploadPdf(pdf);
    if (result) results.push(result);
  }

  console.log(`\n✅ Uploaded ${results.length}/${allPdfs.length} PDFs successfully.`);
  console.log("\n📋 Public URL base pattern:");
  console.log(`  https://ukfvjadlonmjeugatyub.supabase.co/storage/v1/object/public/${BUCKET}/[path]`);
  console.log("\nUpdate course-syllabus.ts pdfUrl fields to use these URLs.");
}

main().catch(console.error);
