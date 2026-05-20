# Phase 19 — Tibyaan Academy: Real Team Data + Real Reviews

## Overview
Two pages need updating. All data and image paths are provided below. Do NOT push to main branch — place this phase file in the same folder as previous phases and wait for review before merging.

---

## PART A — About Page (`/en/about`) — Our Expert Team Section

### Task
Replace the current placeholder team cards in the **"Our Expert Team"** section with the real data below. Real photos are in `/public/Our Team/` folder. Use `<Image>` (Next.js) for all team photos with proper sizing so images display correctly in the browser.

Each team member card must include:
- Real photo from `/public/Our Team/`
- Name
- Title / Role
- Description
- WhatsApp icon button (linked to their contact number) — use a WhatsApp SVG icon or lucide/react-icons WhatsApp icon as a clickable link (`https://wa.me/<number>`)

### Real Team Data

```json
[
  {
    "id": 1,
    "name": "Professor Muhammad Tahir Hasni",
    "image": "/Our Team/Professor_Muhammad_Tahir_Hasni.jpg",
    "role": "Founder of Tibyaan Academy",
    "description": "Professor Muhammad Tahir Hasni founded Tibyaan Academy with a vision to make authentic Islamic education accessible to Muslims across the globe. With decades of academic excellence, he has been a pioneer in bringing traditional Islamic learning to the online world. His mission is to bridge the gap between technology and religion, serving the Ummah through modern yet authentic means.",
    "whatsapp": "923478599839"
  },
  {
    "id": 2,
    "name": "Mufti Muhammad Rafeeq Golarwi",
    "image": "/Our Team/Mufti_Muhammad_Rafeeq_Golarwi.jpg",
    "role": "Director of Tibyaan Academy",
    "description": "Mufti Muhammad Rafeeq Golarwi oversees the day-to-day academic operations of Tibyaan Academy. His core expertise lies in Islamic Jurisprudence (Fiqh) and Usool-ul-Fiqh, and he has played a key role in adapting the traditional Dars-e-Nizami curriculum for the modern digital age. Under his leadership, Tibyaan's Aalim Course and Fatwa department serve students from around the world.",
    "whatsapp": "923212485198"
  },
  {
    "id": 3,
    "name": "Mufti Owais Ahmed",
    "image": "/Our Team/Mufti_Owais_Ahmed.jpg",
    "role": "Head of Aalim Course",
    "description": "Mufti Owais Ahmed leads Tibyaan Academy's flagship Aalim Course. He has successfully restructured the complete Dars-e-Nizami syllabus into an effective online format, enabling students to pursue the full journey of becoming a qualified Aalim from the comfort of their homes. His teaching style is clear, engaging, and deeply rooted in classical Islamic scholarship.",
    "whatsapp": "923218035236"
  },
  {
    "id": 4,
    "name": "Sheikh Abdul Jabbar",
    "image": "/Our Team/Sheikh_Abdul_Jabbar.jpg",
    "role": "Head of Arabic Language",
    "description": "Sheikh Abdul Jabbar is a specialist in the Arabic language with deep expertise in Sarf, Nahw, Balaghat, and Classical Arabic Literature. He firmly believes that the direct path to understanding the Quran and Hadith is through mastering the Arabic language. His classes are structured in a way that even absolute beginners can quickly begin to understand the Quran with confidence.",
    "whatsapp": "923152363498"
  },
  {
    "id": 5,
    "name": "Maulana Ali Haider",
    "image": "/Our Team/Maulana_Ali_Haider.jpg",
    "role": "Head of Hifz-ul-Quran",
    "description": "Maulana Ali Haider has dedicated his entire life to the service of the Holy Quran. He specializes in teaching Hifz to students of all ages — from young children to adults. His proven teaching methodology instills consistency and strength in memorization. He has designed Tibyaan's online Hifz program in a way that allows every student to progress at their own pace without compromising quality.",
    "whatsapp": "923476676147"
  },
  {
    "id": 6,
    "name": "Qari Muhammad Musheer",
    "image": "/Our Team/Qari_Muhammad_Musheer.jpg",
    "role": "Head of Nazrat-ul-Quran",
    "description": "Qari Muhammad Musheer heads the Nazrat and Tajweed department at Tibyaan Academy. His specialty lies in the precise articulation of Arabic letters (Makhaarij) and the rules of Tajweed. Thousands of students have learned to recite the Quran correctly under his guidance. His interactive and engaging teaching approach makes learning Quran enjoyable, particularly for children.",
    "whatsapp": "923269244960"
  },
  {
    "id": 7,
    "name": "Qari Muhammad Ismail Hasni",
    "image": "/Our Team/Qari_Muhammad_Ismail_Hasni.jpg",
    "role": "Admin of Tibyaan Academy",
    "description": "Qari Muhammad Ismail Hasni manages the complete administrative framework of Tibyaan Academy. From student enrollments and scheduling to fee management and teacher coordination — every operational matter falls under his supervision. His dedication and organizational skills ensure that the entire Academy runs smoothly and efficiently. He is always available and approachable for students' needs.",
    "whatsapp": "923453184434"
  },
  {
    "id": 8,
    "name": "Ustaza Fatima Al-Zahra",
    "image": "/Our Team/Ustaza_Fatima_Al-Zahra.jpg",
    "role": "Head of Women's & Children's Programs",
    "description": "Ustaza Fatima Al-Zahra oversees all women's and children's programs at Tibyaan Academy. Her teaching approach is built on innovative methods and a nurturing, compassionate style that has helped thousands of women and children learn the Quran and Islamic sciences. She is the creative force behind Tibyaan's Kids Activities section. She believes that every Muslim home should be the first school of Deen.",
    "whatsapp": "923042043314"
  }
]
```

### Image Sizing Instructions
- Check actual image dimensions from `/public/Our Team/` before rendering
- Render all team photos at a consistent size (e.g., `width={300} height={300}`) with `object-fit: cover` and rounded styling
- Ensure images are fully visible and not cropped awkwardly in the card layout

### WhatsApp Button
- Add a WhatsApp icon link button on each card
- Link format: `https://wa.me/<whatsapp_number>` (no + or dashes, just digits)
- Opens in new tab (`target="_blank"`)
- Style it as a small green icon button below the description

---

## PART B — About Page (`/en/about`) — Remove Reviews Section

### Task
**Remove** the entire **"What Parents & Students Say"** section from the About page (`/en/about`). The heading and all review cards should be deleted. Do not leave any empty space or placeholder — the section above it and the CTA section below it should connect cleanly.

---

## PART C — Home Page (`/en`) — Real Reviews Section

### Task
Replace the current placeholder **"What Students Say"** section on the Home page with real reviews. The heading **"What Parents & Students Say"** should remain. Real reviewer photos are in `/public/Reviewer/` folder.

### Real Reviews Data

```json
[
  {
    "id": 1,
    "name": "Aaliya Mahmood",
    "image": "/Reviewer/Aaliya_Mahmood.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I started Nazra Quran with Tibyaan. The AI Ustaz is available 24/7 — ask anything, get an instant answer. In just 4 months, I can now read the Quran fluently. Alhamdulillah!",
    "role": "Student"
  },
  {
    "id": 2,
    "name": "Aamir Nazir",
    "image": "/Reviewer/Aamir_Nazir.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "The Hifz Tracker has changed my life. The AI-scheduled sabaq, sabqi, and manzil is so organized I never forget my lessons. Combined with a human teacher, this app is truly amazing.",
    "role": "Student"
  },
  {
    "id": 3,
    "name": "Abdullah Asad",
    "image": "/Reviewer/Abdullah_Asad.jpg",
    "country": "United Kingdom",
    "flag": "🇬🇧",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "Finding a good Qari in the UK was difficult. Tibyaan solved that problem. The live class feels just like face-to-face. My child is very happy!",
    "role": "Parent"
  },
  {
    "id": 4,
    "name": "Abdullah",
    "image": "/Reviewer/Abdullah.jpg",
    "country": "Nigeria",
    "flag": "🇳🇬",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "Joining from Nigeria, I started the Hifz journey with my son. The AI Ustaz explains in English and the human teacher corrects tajweed. Best combination!",
    "role": "Parent"
  },
  {
    "id": 5,
    "name": "Ahmet Kurt",
    "image": "/Reviewer/Ahmet_kurt.jpg",
    "country": "Germany",
    "flag": "🇩🇪",
    "course": "Arabic Language",
    "rating": 5,
    "review": "Living in Germany, I wanted to learn Arabic. The sarf and nahw classes are so clear that what seemed difficult became easy. Support in multiple languages is truly outstanding.",
    "role": "Student"
  },
  {
    "id": 6,
    "name": "Al Hoque",
    "image": "/Reviewer/Al_Hoque.jpg",
    "country": "Bangladesh",
    "flag": "🇧🇩",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "I'm from Bangladesh. Tibyaan's Hifz Tracker has been a game changer for me. Daily AI reminders and seeing my progress chart boosts my motivation. Masha'Allah!",
    "role": "Student"
  },
  {
    "id": 7,
    "name": "Aliyan Ali",
    "image": "/Reviewer/Aliyan_Ali.jpg",
    "country": "Indonesia",
    "flag": "🇮🇩",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm from Indonesia. Having support in the Indonesian language is a huge convenience. You can ask the AI Ustaz questions in your own language. Tibyaan is truly a world-class academy!",
    "role": "Student"
  },
  {
    "id": 8,
    "name": "Amet Kurt Albani",
    "image": "/Reviewer/Amet_kurt_Albani.jpg",
    "country": "Turkey",
    "flag": "🇹🇷",
    "course": "Aalim Course",
    "rating": 5,
    "review": "Joined the Aalim Course from Turkey. Finding the complete Dars-e-Nizami curriculum online is amazing. The scholarly level of teachers and course with ijazah — only possible at Tibyaan!",
    "role": "Student"
  },
  {
    "id": 9,
    "name": "Bakarii",
    "image": "/Reviewer/Bakarii.jpg",
    "country": "West Africa",
    "flag": "🌍",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm from West Africa. I took the 5-day free trial and loved it from the very first class, so I subscribed immediately. The teacher teaches with great patience.",
    "role": "Student"
  },
  {
    "id": 10,
    "name": "Daruth Tahjeeb",
    "image": "/Reviewer/Daruth_Tahjeeb.jpg",
    "country": "Bangladesh",
    "flag": "🇧🇩",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "My daughter is doing hifz and eagerly waits for Tibyaan classes. The interactive kids' games make learning letters feel like play now!",
    "role": "Parent"
  },
  {
    "id": 11,
    "name": "Febryarya",
    "image": "/Reviewer/Febryarya.jpg",
    "country": "Indonesia",
    "flag": "🇮🇩",
    "course": "Arabic Language",
    "rating": 5,
    "review": "Took the Arabic language course from Indonesia. Special focus on spoken Arabic which you don't find elsewhere. Practice with AI Ustaz anytime — no embarrassment!",
    "role": "Student"
  },
  {
    "id": 12,
    "name": "Halid Elosman",
    "image": "/Reviewer/Halid_Elosman.jpg",
    "country": "Saudi Arabia",
    "flag": "🇸🇦",
    "course": "Aalim Course",
    "rating": 5,
    "review": "I'm from Saudi Arabia and joined the Aalim Course. Seeing the teachers' credentials and scholarly background gave me peace of mind. Despite being online, the environment feels just like a madrasa.",
    "role": "Student"
  },
  {
    "id": 13,
    "name": "Imran Ejaz",
    "image": "/Reviewer/Imran_Ejaz.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "My son memorized 10 paras in 8 months! The Hifz Tracker and teacher's combined effort made it possible. The weekly tests show clear progress.",
    "role": "Parent"
  },
  {
    "id": 14,
    "name": "Irfan Shahzad",
    "image": "/Reviewer/Irfan_Shahzad.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "Tibyaan's AI Ustaz is amazing. Ask a question at 2am — instant reply! Combined with a human teacher, this combination is unbelievable.",
    "role": "Student"
  },
  {
    "id": 15,
    "name": "Jalal Ahmed",
    "image": "/Reviewer/Jalal_Ahmed.jpg",
    "country": "UAE",
    "flag": "🇦🇪",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm from the UAE. Flexible timings were essential in my busy life. Tibyaan's option to set your own schedule made everything easy. My child's pronunciation has improved tremendously!",
    "role": "Parent"
  },
  {
    "id": 16,
    "name": "Javaistan",
    "image": "/Reviewer/Javaistan.jpg",
    "country": "Indonesia",
    "flag": "🇮🇩",
    "course": "Aalim Course",
    "rating": 5,
    "review": "I'm doing the Aalim Course from Indonesia. What I've learned in 2 years was not possible at any local institution. I really appreciate the teachers' personal attention to their students.",
    "role": "Student"
  },
  {
    "id": 17,
    "name": "Jibar",
    "image": "/Reviewer/Jibar.jpg",
    "country": "Canada",
    "flag": "🇨🇦",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "The problem of Islamic education for Muslim children in Canada is now solved. With Tibyaan, religious education is possible right from home. My son's connection with the Quran keeps growing.",
    "role": "Parent"
  },
  {
    "id": 18,
    "name": "Kalamata",
    "image": "/Reviewer/kalamata.jpg",
    "country": "Indonesia",
    "flag": "🇮🇩",
    "course": "Aalim Course",
    "rating": 5,
    "review": "Completed the online Aalim Course and also received ijazah. This is the greatest academic achievement of my life. Tibyaan's teachers are outstanding in both knowledge and character.",
    "role": "Student"
  },
  {
    "id": 19,
    "name": "Kaniz Fatima",
    "image": "/Reviewer/Kaniz_Fatima.jpg",
    "country": "United Kingdom",
    "flag": "🇬🇧",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm a busy mum in the UK. Tibyaan connected my daughter to the Quran — she now sits and reads on her own every day. She loves doing repetition with the AI Ustaz!",
    "role": "Parent"
  },
  {
    "id": 20,
    "name": "Kanwal Shaheen",
    "image": "/Reviewer/Kanwal_Shaheen.jpg",
    "country": "Australia",
    "flag": "🇦🇺",
    "course": "Arabic Language",
    "rating": 5,
    "review": "Took the Arabic language course from Australia. I had no Arabic before, now I'm starting to understand Quranic translation. Tibyaan truly brought the Quran closer. Thank you Tibyaan!",
    "role": "Student"
  },
  {
    "id": 21,
    "name": "Krar",
    "image": "/Reviewer/krar.jpg",
    "country": "Iraq",
    "flag": "🇮🇶",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm from Iraq. Tibyaan's classes brought the Quran closer to me. The AI Ustaz answers questions anytime day or night — I haven't found this convenience anywhere else. Thank you!",
    "role": "Student"
  },
  {
    "id": 22,
    "name": "M. Zass",
    "image": "/Reviewer/M_Zass.jpg",
    "country": "Nigeria",
    "flag": "🇳🇬",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "Started the Hifz journey with my daughter from Nigeria. Tibyaan's environment is just like a madrasa. My daughter is happy, I am happy — Alhamdulillah, this academy proved to be the best choice!",
    "role": "Parent"
  },
  {
    "id": 23,
    "name": "Mikhail Nilov",
    "image": "/Reviewer/Mikhail_Nilov.jpg",
    "country": "Russia",
    "flag": "🇷🇺",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm from Russia and after accepting Islam, I wanted to learn the Quran. Tibyaan gave complete support in English. The teacher's patience and AI assistance — both made learning easy.",
    "role": "Student"
  },
  {
    "id": 24,
    "name": "Mohameden Beinbe",
    "image": "/Reviewer/Mohameden_Beinbe.jpg",
    "country": "Mauritania",
    "flag": "🇲🇷",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "I'm from Mauritania. Tibyaan's Hifz Tracker is very useful for me — there's a complete system for sabaq, sabqi, and manzil. Teachers are very experienced and give special attention to tajweed.",
    "role": "Student"
  },
  {
    "id": 25,
    "name": "Mohammad Asbad",
    "image": "/Reviewer/Mohammad_Asbad.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "I'm from Pakistan. Started Hifz with Tibyaan and completed 7 paras in 5 months. Daily AI reminders and human teacher's guidance — both together work wonders!",
    "role": "Student"
  },
  {
    "id": 26,
    "name": "Monir-ul-Islam",
    "image": "/Reviewer/Monir-ul-Islam.jpg",
    "country": "Bangladesh",
    "flag": "🇧🇩",
    "course": "Aalim Course",
    "rating": 5,
    "review": "Enrolled in the Aalim Course from Bangladesh. Getting the complete Dars-e-Nizami curriculum online is unbelievable. Teachers' scholarly competence and live classes — everything is just like a real madrasa!",
    "role": "Student"
  },
  {
    "id": 27,
    "name": "Mujeeb Zain",
    "image": "/Reviewer/Mujeeb_Zain.jpg",
    "country": "Bangladesh",
    "flag": "🇧🇩",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I got my young son started on Nazra at Tibyaan. He loved learning letters through the interactive kids' games. Now he asks for class on his own — Masha'Allah!",
    "role": "Parent"
  },
  {
    "id": 28,
    "name": "Murtaza Wahhab",
    "image": "/Reviewer/Murtaza_Wahhab.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "Seeing the weekly tests and AI progress chart keeps me motivated. The way the human teacher and AI work together at Tibyaan — this is truly a madrasa for the modern age!",
    "role": "Student"
  },
  {
    "id": 29,
    "name": "Panditwiguna",
    "image": "/Reviewer/Panditwiguna.jpg",
    "country": "Indonesia",
    "flag": "🇮🇩",
    "course": "Arabic Language",
    "rating": 5,
    "review": "I'm from Indonesia. Took the Arabic language course and the journey from basics to conversation was very organized. Having support in Indonesian is truly a big advantage. Thank you Tibyaan!",
    "role": "Student"
  },
  {
    "id": 30,
    "name": "Qamar Rehman",
    "image": "/Reviewer/Qamar_Rehman.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "My heart was overjoyed seeing my son's connection with the Quran. The way Tibyaan's teacher taught with such love — it is unforgettable. Started with the 5-day free trial then subscribed immediately.",
    "role": "Parent"
  },
  {
    "id": 31,
    "name": "Quang Nguyen Vinh",
    "image": "/Reviewer/Quang_Nguyen_Vinh.jpg",
    "country": "Vietnam",
    "flag": "🇻🇳",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm from Vietnam. Support in English made it possible to learn the Quran. Practice with the AI Ustaz whenever you want — no time restriction. Tibyaan is truly for Muslims all over the world!",
    "role": "Student"
  },
  {
    "id": 32,
    "name": "Riki Risnandar",
    "image": "/Reviewer/Riki_Risnandar.jpg",
    "country": "Indonesia",
    "flag": "🇮🇩",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "I'm doing the Hifz course from Indonesia. Tibyaan's Hifz Tracker creates a daily schedule — lessons stay memorized, progress is visible. Teacher and AI together — it gives peace of mind!",
    "role": "Student"
  },
  {
    "id": 33,
    "name": "Sabrian Syah",
    "image": "/Reviewer/Sabrian_Syah.jpg",
    "country": "Indonesia",
    "flag": "🇮🇩",
    "course": "Arabic Language",
    "rating": 5,
    "review": "I'm learning Arabic from Indonesia. Sarf and nahw classes are taught in a very easy manner. Talk in Arabic with the AI Ustaz whenever you want — all fear and shyness is gone!",
    "role": "Student"
  },
  {
    "id": 34,
    "name": "Seyh Muskino",
    "image": "/Reviewer/Seyh_muskino.jpg",
    "country": "Egypt",
    "flag": "🇪🇬",
    "course": "Aalim Course",
    "rating": 5,
    "review": "Joined the Aalim Course from Egypt. Tibyaan's teachers have a very high scholarly standard. Completing the course with ijazah was the dream of my life — Tibyaan fulfilled it!",
    "role": "Student"
  },
  {
    "id": 35,
    "name": "Shaheer Nawaz",
    "image": "/Reviewer/Shaheer_Nawaz.jpg",
    "country": "United Kingdom",
    "flag": "🇬🇧",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "Living in the UK, I was worried about my son's religious education. Tibyaan removed that worry. Live classes, AI tracker, and weekly tests — all together are giving the best results!",
    "role": "Parent"
  },
  {
    "id": 36,
    "name": "Shahzaib Jahan",
    "image": "/Reviewer/Shahzaib_Jahan.jpg",
    "country": "Canada",
    "flag": "🇨🇦",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "Islamic education in Canada was a challenge. Tibyaan made it possible to learn the Quran from home. My son now recites with great confidence — Masha'Allah!",
    "role": "Parent"
  },
  {
    "id": 37,
    "name": "Shaista Touseef",
    "image": "/Reviewer/Shaista_Touseef.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "I'm from Pakistan. Tibyaan has brought me very close to the Quran. Tajweed practice with the AI Ustaz and lessons with the human teacher — both together make Hifz so much easier!",
    "role": "Student"
  },
  {
    "id": 38,
    "name": "Sheikh Toulouse",
    "image": "/Reviewer/Sheikh_Toulouse.jpg",
    "country": "France",
    "flag": "🇫🇷",
    "course": "Arabic Language",
    "rating": 5,
    "review": "I'm from France. Getting support in French proved to be the greatest blessing for me. After the Arabic language course, I started understanding Quranic translation — heartfelt thanks to Tibyaan!",
    "role": "Student"
  },
  {
    "id": 39,
    "name": "Sheikh Yousuf",
    "image": "/Reviewer/Sheikh_Yousuf.jpg",
    "country": "Saudi Arabia",
    "flag": "🇸🇦",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "Enrolled my sons in Tibyaan from Saudi Arabia. The tajweed standard is very high. Tibyaan's teachers teach with love and sincerity — may Allah reward them greatly!",
    "role": "Parent"
  },
  {
    "id": 40,
    "name": "Sheza Shehzad",
    "image": "/Reviewer/Sheza_Shehzad.jpg",
    "country": "Indonesia",
    "flag": "🇮🇩",
    "course": "Arabic Language",
    "rating": 5,
    "review": "I'm from Indonesia. When I started learning Arabic with Tibyaan, it felt like a new world opened up. Reading the Quran with understanding is now possible — this is Tibyaan's greatest gift!",
    "role": "Student"
  },
  {
    "id": 41,
    "name": "Sirmudi",
    "image": "/Reviewer/Sirmudi.jpg",
    "country": "Tanzania",
    "flag": "🇹🇿",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm from Tanzania. My son started reading Quran with Tibyaan — now he sits and recites on his own every day. The AI Ustaz helped a lot in correcting his tajweed. Jazakumullah Khairan!",
    "role": "Parent"
  },
  {
    "id": 42,
    "name": "Sonyfeo",
    "image": "/Reviewer/Sonyfeo.jpg",
    "country": "Indonesia",
    "flag": "🇮🇩",
    "course": "Arabic Language",
    "rating": 5,
    "review": "I'm from Indonesia and took the Arabic language course. I knew nothing before — now I can speak basic sentences. Practicing conversation with the AI Ustaz boosted my confidence. I'm so happy!",
    "role": "Student"
  },
  {
    "id": 43,
    "name": "Talha Shafique",
    "image": "/Reviewer/Talha_Shafique.jpg",
    "country": "Bangladesh",
    "flag": "🇧🇩",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "I'm doing Hifz from Bangladesh. Tibyaan's Hifz Tracker reminds me of my daily lesson, and seeing the progress chart fills me with more motivation to work harder. Teacher's loving guidance — everything together is wonderful!",
    "role": "Student"
  },
  {
    "id": 44,
    "name": "Timur Weber",
    "image": "/Reviewer/Timur_Weber.jpg",
    "country": "UAE",
    "flag": "🇦🇪",
    "course": "Hifz Quran",
    "rating": 5,
    "review": "I'm from the UAE. Tibyaan fulfilled my dream of learning Quran with my son. Teacher's attention in live class, AI's sabqi review — both together are giving the best results! May Allah reward Tibyaan.",
    "role": "Parent"
  },
  {
    "id": 45,
    "name": "Ubaid-ul-llah",
    "image": "/Reviewer/Ubaid-ul-llah.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Aalim Course",
    "rating": 5,
    "review": "I'm from Pakistan. Enrolled in the Aalim Course and from the very beginning, the quality of classes overwhelmed me. Teachers' knowledge, character, and love — all three are unmatched. Tibyaan is truly a madrasa for the modern age!",
    "role": "Student"
  },
  {
    "id": 46,
    "name": "Zohair Ashraf",
    "image": "/Reviewer/Zohair_Ashraf.jpg",
    "country": "Bangladesh",
    "flag": "🇧🇩",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm from Bangladesh. Enrolled my son in Tibyaan — the difference was visible from the very first week. Learning letters through kids' games has now become fun. The teacher's teaching method is outstanding!",
    "role": "Parent"
  },
  {
    "id": 47,
    "name": "Zuhaib Junaid",
    "image": "/Reviewer/Zuhaib_Junaid.jpg",
    "country": "Pakistan",
    "flag": "🇵🇰",
    "course": "Aalim Course",
    "rating": 5,
    "review": "I'm doing the Aalim Course from Pakistan. This online Dars-e-Nizami experience is amazing. Receiving a certificate with ijazah will be a great honor for me. Tibyaan's teachers teach from the heart — may Allah reward them!",
    "role": "Student"
  },
  {
    "id": 48,
    "name": "Zulekha Jawed",
    "image": "/Reviewer/Zulekha_Jawed.jpg",
    "country": "Turkey",
    "flag": "🇹🇷",
    "course": "Nazra Quran",
    "rating": 5,
    "review": "I'm from Turkey. Took the 5-day free trial and loved the teacher's style from the very first class — subscribed immediately. Now I read the Quran fluently — this is Tibyaan's blessing!",
    "role": "Student"
  }
]
```

### Reviews Display Instructions
- Keep the existing heading: **"What Parents & Students Say"**
- Show all 48 reviews in a carousel or scrollable grid — use the same layout style currently used on the home page
- Each card should show: reviewer photo, name, country + flag, course badge, star rating (5 stars), review text, and role (Student/Parent)
- Reviewer photos from `/public/Reviewer/` — check actual file names carefully (some are lowercase e.g. `krar.jpg`, `kalamata.jpg`)
- Set reviewer images at a consistent size (e.g., `width={80} height={80}`) with `object-fit: cover`, circular crop (`rounded-full`)
- Ensure all images load correctly in the browser with no broken paths

---

## General Instructions

1. **Do NOT modify** any other section on either page
2. **Do NOT push to main branch** — place this phase file in the same folder where previous phase files were stored, and wait for review
3. First **list the files** in `/public/Our Team/` and `/public/Reviewer/` to confirm exact filenames before writing any `<Image>` src paths
4. If any image file is missing from public folders, log a warning in the console but do not break the UI — use a fallback placeholder
5. Keep the existing page styling, colors, and layout consistent — only replace the data and images, do not redesign sections
