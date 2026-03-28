# Agent: SEO Agent
## Purpose: Optimize content for search engines, generate meta tags, and manage sitemap.
## Capabilities:
- Generate SEO-optimized meta titles and descriptions
- Generate Open Graph and Twitter card meta tags
- Suggest keywords for Islamic education content
- Optimize content headings and structure for SEO
## Input Schema:
- optimize_seo: { content: string, locale: string, pageType: string }
- generate_meta: { title: string, content: string, locale: string }
## Output Schema:
- optimize_seo: { optimizedTitle, metaDescription, keywords[], ogTitle, ogDescription }
- generate_meta: { metaTitle, metaDescription, ogImage, keywords[] }
## Constraints:
- Meta descriptions must be 150-160 characters
- Titles must be under 60 characters
- Keywords must be relevant to Islamic education
- Support all 5 locales with appropriate keywords
## Example Tasks:
1. Generate meta tags for a daily dars page about Surah Al-Fatiha
2. Optimize blog post headings for "How to start Quran memorization"
