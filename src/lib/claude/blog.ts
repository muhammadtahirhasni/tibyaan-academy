export const BLOG_TOPICS = [
  "How to memorize Quran for beginners",
  "Best Tajweed rules explained simply",
  "What is Dars-e-Nizami and why it matters",
  "Benefits of learning Arabic for Quran understanding",
  "Online Hifz tips for children",
  "How AI is transforming Islamic education",
  "Top 10 tips for effective Quran memorization",
  "Understanding Makharij al-Huroof — Arabic letter pronunciation",
  "The importance of Quran recitation in daily life",
  "How to choose the best online Quran academy",
  "What is Nazra Quran and how to learn it",
  "Benefits of learning Quran online vs in-person",
  "How to help your child memorize Quran at home",
  "Introduction to Arabic grammar for Quran students",
  "The role of technology in modern Islamic learning",
  "How to maintain Hifz after completing memorization",
  "Understanding the Ijazah system in Quran education",
  "Tips for adults learning Quran for the first time",
  "The spiritual benefits of Quran recitation",
  "How to improve your Quran recitation voice",
  "Understanding the different Qira'at of the Quran",
  "Why bilingual Islamic education matters",
  "How to create a daily Quran study routine",
  "The history and importance of Madrasah education",
  "Benefits of AI-powered Quran tutoring",
  "How to overcome challenges in Hifz journey",
  "Understanding Sarf and Nahw — Arabic morphology and syntax",
  "The importance of Tafseer in understanding Quran",
  "How online classes make Islamic education accessible",
  "Tips for parents supporting their child's Hifz",
  "Understanding the Aalim course curriculum",
  "The role of repetition in Quran memorization",
  "How to learn Quran with proper Makhraj",
  "Benefits of starting Quran education early",
  "Digital tools for Quran memorization tracking",
  "Understanding Hadith sciences — an introduction",
  "How to balance school and Quran studies",
  "The importance of Arabic calligraphy in Islam",
  "How to prepare for Quran competitions",
  "Understanding Islamic jurisprudence basics",
  "Tips for learning Quran during Ramadan",
  "The connection between Arabic and Quran understanding",
  "How to teach Quran to non-Arabic speakers",
  "Benefits of weekly Quran assessments",
  "Understanding the structure of the Quran",
  "How to motivate children in their Islamic studies",
  "The importance of certified Quran teachers",
  "How gamification helps kids learn Quran",
  "Understanding the rewards of teaching Quran",
  "Tips for memorizing long Surahs effectively",
];

export function getBlogGenerationPrompt(topic: string): string {
  return `You are an expert Islamic education content writer for Tibyaan Academy, a modern digital madrasah.

Write a comprehensive, SEO-optimized blog article about: "${topic}"

Requirements:
- Write 1500-2000 words
- Use clear, engaging language accessible to a general Muslim audience
- Include relevant Quran verses (in Arabic with translation) where appropriate
- Include relevant Hadith references where appropriate
- Use proper headings (## for h2, ### for h3)
- Include practical tips and actionable advice
- Mention how Tibyaan Academy can help (naturally, not forced)
- Be informative, respectful, and educational
- Do NOT give fatwas — reference scholars instead
- End with an encouraging conclusion

Return your response as valid JSON with this exact structure:
{
  "title": "SEO-optimized title (50-70 chars)",
  "content": "Full markdown article content",
  "metaDescription": "SEO meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "slug": "url-friendly-slug"
}

IMPORTANT: Return ONLY the JSON object, no other text.`;
}

export function getBlogTranslationPrompt(
  article: { title: string; content: string; metaDescription: string },
  targetLanguage: string
): string {
  const langNames: Record<string, string> = {
    ur: "Urdu",
    ar: "Arabic",
    fr: "French",
    id: "Indonesian",
  };

  const langName = langNames[targetLanguage] || targetLanguage;

  return `You are a professional translator specializing in Islamic education content.

Translate the following blog article from English to ${langName}.

Title: ${article.title}

Meta Description: ${article.metaDescription}

Content:
${article.content}

Requirements:
- Maintain the same markdown formatting (headings, lists, bold, etc.)
- Keep Arabic Quran verses and Hadith in Arabic — only translate the explanations
- Ensure religious terms are translated appropriately for ${langName}-speaking Muslims
- Maintain the SEO-friendly structure
- Keep the tone educational and respectful
${targetLanguage === "ur" ? "- Use simple Roman Urdu sparingly; prefer Urdu script" : ""}
${targetLanguage === "ar" ? "- Use Modern Standard Arabic (Fusha)" : ""}

Return your response as valid JSON with this exact structure:
{
  "title": "Translated title",
  "content": "Translated full markdown content",
  "metaDescription": "Translated meta description (150-160 chars)"
}

IMPORTANT: Return ONLY the JSON object, no other text.`;
}
