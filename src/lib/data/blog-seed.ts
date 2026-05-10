export interface StaticBlogPost {
  slug: string;
  category: string;
  readMinutes: number;
  heroImage: string;
  titles: Record<string, string>;
  contents: Record<string, string>;
  publishedAt: Date;
}

export const STATIC_BLOG_POSTS: StaticBlogPost[] = [
  {
    slug: "quran-hifz-ki-shuruaat-kaise-karen",
    category: "Hifz Quran",
    readMinutes: 5,
    heroImage: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=1200&q=80",
    publishedAt: new Date("2026-05-01"),
    titles: {
      ur: "حفظ کی شروعات کا مکمل گائیڈ",
      ar: "الدليل الكامل لبدء حفظ القرآن الكريم",
      en: "The Complete Guide to Starting Quran Hifz",
      fr: "Le guide complet pour commencer la mémorisation du Coran",
      id: "Panduan Lengkap Memulai Hafalan Al-Quran",
    },
    contents: {
      en: `Starting your Hifz journey is one of the most rewarding decisions you can make. The Prophet Muhammad ﷺ said: "The best among you are those who learn the Quran and teach it." (Sahih Bukhari)

Before you begin, set a clear intention (niyyah) — memorize for the pleasure of Allah alone, not for fame or praise. This sincerity will sustain you through difficult moments.

**Choose the Right Mushaf**

Use the same copy of the Quran throughout your Hifz. The visual memory of the page layout becomes a powerful tool. Many huffaz recommend the Madinah Mushaf (15-line per page, color-coded tajweed).

**Establish a Daily Routine**

The most successful huffaz memorize in three sessions:
- **Sabaq** (New lesson): Memorize 3–5 new ayaat every morning after Fajr
- **Sabqi** (Recent revision): Revise the last 7 days' lessons
- **Manzil** (Long-term revision): Cycle through previously memorized portions

**Master Tajweed First**

Never sacrifice correct pronunciation for speed. Even one letter mispronounced changes the meaning of the Quran. Enroll with a certified Tajweed teacher who can correct your mistakes in real time.

**Use Technology Wisely**

Apps like Tibyaan Academy's AI Ustaz can listen to your recitation and flag pronunciation errors 24/7. The Hifz tracker automatically schedules your daily sabaq, sabqi, and manzil — so you never lose progress even if you miss a day.

**Stay Consistent**

Missing even one day breaks the chain. Set a minimum daily target you can always achieve — even 3 ayaat on your busiest day. Consistency over quantity is the golden rule of Hifz.

**Find a Hifz Buddy**

Recite to someone daily. Hearing yourself recite — and being corrected — locks memorization far better than silent repetition.

Ready to begin? Start your 5-day free trial at Tibyaan Academy and get a personalized Hifz plan today.`,
      ur: `حفظ کا سفر شروع کرنا زندگی کے بہترین فیصلوں میں سے ایک ہے۔ نبی کریم ﷺ نے فرمایا: "تم میں سے بہترین وہ ہے جو قرآن سیکھے اور سکھائے۔" (صحیح بخاری)

شروع کرنے سے پہلے، اپنی نیت صاف کریں — صرف اللہ کی رضا کے لیے حفظ کریں۔ یہ اخلاص مشکل لمحات میں آپ کو ثابت قدم رکھے گا۔

**صحیح مصحف کا انتخاب**

پورے حفظ میں ایک ہی قرآن استعمال کریں۔ صفحے کی بصری یادداشت ایک طاقتور ذریعہ بن جاتی ہے۔ زیادہ تر حفاظ مدینہ مصحف کی سفارش کرتے ہیں۔

**روزانہ کا معمول طے کریں**

کامیاب حفاظ تین وقتوں میں حفظ کرتے ہیں:
- **سبق**: ہر صبح فجر کے بعد 3 سے 5 نئی آیات
- **سبقی**: پچھلے 7 دنوں کے اسباق کا دہرانا
- **منزل**: پہلے یاد کیے گئے حصے کا چکر

**پہلے تجوید سیکھیں**

رفتار کے لیے درست تلفظ کبھی قربان نہ کریں۔ تبیان اکیڈمی کے AI استاذ کے ساتھ آپ 24/7 اپنی تلاوت کی غلطیاں درست کر سکتے ہیں۔

آج ہی 5 دن کا مفت ٹرائل شروع کریں اور اپنا ذاتی حفظ پلان حاصل کریں۔`,
      ar: `إن بدء رحلة الحفظ من أفضل القرارات في حياتك. قال النبي ﷺ: "خيركم من تعلم القرآن وعلّمه." (صحيح البخاري)

قبل البدء، أخلص نيتك — احفظ لوجه الله وحده. هذا الإخلاص سيثبّتك في لحظات الصعوبة.

**اختر المصحف المناسب**

استخدم نفس المصحف طوال رحلة الحفظ. يصبح التذكر البصري للصفحات أداةً قوية. يوصي كثير من الحفاظ بمصحف المدينة.

**حدد روتيناً يومياً**

يحفظ الحفاظ الناجحون في ثلاث جلسات:
- **الحفظ الجديد (السبق)**: 3 إلى 5 آيات كل صباح بعد الفجر
- **المراجعة القريبة (السبقي)**: مراجعة دروس آخر 7 أيام
- **المراجعة البعيدة (المنزل)**: تكرار ما حُفظ سابقاً

**استخدم التكنولوجيا بذكاء**

يمكن لأستاذ الذكاء الاصطناعي في أكاديمية تبيان الاستماع إلى تلاوتك وتصحيح الأخطاء في أي وقت. ابدأ تجربتك المجانية 5 أيام الآن.`,
      fr: `Commencer votre voyage de mémorisation est l'une des meilleures décisions que vous puissiez prendre. Le Prophète ﷺ a dit : "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne." (Sahih Bukhari)

**Choisissez le bon Mushaf**

Utilisez le même exemplaire tout au long de votre Hifz. La mémoire visuelle de la mise en page devient un outil puissant.

**Établissez une routine quotidienne**

Les huffaz les plus réussis mémorisent en trois sessions :
- **Sabaq** (nouvelle leçon) : 3 à 5 nouvelles versets chaque matin après Fajr
- **Sabqi** (révision récente) : Réviser les 7 derniers jours
- **Manzil** (révision à long terme) : Parcourir les portions mémorisées

L'IA Ustaz de Tibyaan Academy peut écouter votre récitation et signaler les erreurs 24h/24. Commencez votre essai gratuit de 5 jours aujourd'hui.`,
      id: `Memulai perjalanan hafalan adalah salah satu keputusan terbaik dalam hidup Anda. Nabi ﷺ bersabda: "Sebaik-baik kalian adalah yang mempelajari Al-Quran dan mengajarkannya." (Shahih Bukhari)

**Pilih Mushaf yang Tepat**

Gunakan satu mushaf yang sama selama proses hafalan. Memori visual tata letak halaman menjadi alat yang sangat berguna.

**Tetapkan Rutinitas Harian**

Para hafizh sukses menghafal dalam tiga sesi:
- **Sabaq** (pelajaran baru): 3–5 ayat baru setiap pagi setelah Subuh
- **Sabqi** (revisi terkini): Mengulang pelajaran 7 hari terakhir
- **Manzil** (revisi jangka panjang): Mengulang hafalan sebelumnya

AI Ustaz Tibyaan Academy dapat mendengar bacaan Anda dan mengoreksi kesalahan kapan saja. Mulai uji coba gratis 5 hari sekarang.`,
    },
  },
  {
    slug: "tajweed-seekhne-ke-5-asaan-tarike",
    category: "Tajweed",
    readMinutes: 4,
    heroImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80",
    publishedAt: new Date("2026-05-02"),
    titles: {
      ur: "تجوید سیکھنے کے 5 آسان طریقے گھر بیٹھے",
      ar: "5 طرق سهلة لتعلم التجويد من البيت",
      en: "5 Easy Ways to Learn Tajweed from Home",
      fr: "5 moyens faciles d'apprendre le Tajweed depuis chez soi",
      id: "5 Cara Mudah Belajar Tajwid dari Rumah",
    },
    contents: {
      en: `Tajweed — the art of reciting the Quran with correct pronunciation and rhythm — is an obligation for every Muslim. Allah says in the Quran: "And recite the Quran with measured recitation." (73:4)

Here are 5 proven methods to master Tajweed from the comfort of your home:

**1. Start with the Alphabet**

Before anything else, perfect your pronunciation of all 29 Arabic letters from their correct articulation points (makhaarij). Even native Arabic speakers have letters that need correction for Quranic recitation.

**2. Listen to Expert Reciters**

Immerse yourself in the recitation of masters like Sheikh Mishary Rashid Al-Afasy, Sheikh Abdul Basit, or Sheikh Mahmoud Khalil Al-Husary. Listen actively — pause, repeat, and mirror what you hear.

**3. Learn the Core Rules First**

Focus on the 5 most essential rules first: Noon Sakinah & Tanween rules (Idghaam, Ikhfaa, Iqlaab, Izhar), Meem Sakinah rules, Madd (elongation), Qalqalah (echoing letters), and Waqf (stopping) rules.

**4. Record and Review Yourself**

Use your phone to record your recitation, then listen back critically. This reveals mistakes you don't notice while reciting. Share with a teacher for professional feedback.

**5. Practice with a Live Teacher**

There is no substitute for real-time correction from a certified Tajweed teacher. Online platforms like Tibyaan Academy connect you with qualified teachers who provide personalized feedback. Our AI Ustaz is also available 24/7 to practice with.

Start your 5-day free Tajweed trial at Tibyaan Academy today.`,
      ur: `تجوید — قرآن کی درست تلفظ اور ترتیل کے ساتھ تلاوت — ہر مسلمان پر واجب ہے۔ اللہ تعالیٰ فرماتا ہے: "اور قرآن کو ٹھہر ٹھہر کر پڑھو۔" (73:4)

گھر بیٹھے تجوید سیکھنے کے 5 آزمودہ طریقے:

**1. حروف سے شروع کریں**
تمام 29 عربی حروف کو ان کے مخارج سے صحیح ادا کرنا سیکھیں۔

**2. ماہر قاریوں کو سنیں**
شیخ مشاری العفاسی یا شیخ عبدالباسط کی تلاوت کو توجہ سے سنیں اور نقل کریں۔

**3. پہلے اہم قواعد سیکھیں**
نون ساکنہ و تنوین کے احکام، مد، قلقلہ، اور وقف کے قواعد سب سے پہلے مضبوط کریں۔

**4. اپنی آواز ریکارڈ کریں**
موبائل پر اپنی تلاوت ریکارڈ کریں اور سنیں — اس سے آپ کو اپنی غلطیاں واضح نظر آئیں گی۔

**5. لائیو استاد کے ساتھ مشق کریں**
تبیان اکیڈمی کے سند یافتہ اساتذہ آپ کو آن لائن فوری درستگی دیتے ہیں۔ ہمارا AI استاذ 24/7 دستیاب ہے۔

آج ہی 5 دن کا مفت ٹرائل شروع کریں۔`,
      ar: `التجويد — فن تلاوة القرآن بالنطق الصحيح والترتيل — واجب على كل مسلم. يقول الله تعالى: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا." (73:4)

**5 طرق لتعلم التجويد من البيت:**

**1. ابدأ بالحروف** — أتقن مخارج الحروف الـ29 أولاً.

**2. استمع لكبار القراء** — مثل الشيخ مشاري العفاسي والشيخ عبد الباسط.

**3. تعلم القواعد الأساسية** — أحكام النون الساكنة والتنوين، المد، القلقلة، والوقف.

**4. سجّل صوتك** — استمع لنفسك واكتشف أخطاءك.

**5. تدرّب مع معلم متخصص** — منصة تبيان توفر لك معلمين معتمدين والأستاذ الذكاء الاصطناعي متاح 24/7. ابدأ تجربتك المجانية 5 أيام الآن.`,
      fr: `Le Tajweed — l'art de réciter le Coran avec une prononciation et un rythme corrects — est une obligation pour tout musulman.

**5 méthodes pour maîtriser le Tajweed chez soi :**

**1. Commencez par l'alphabet** — Perfectionnez la prononciation des 29 lettres arabes.

**2. Écoutez les récitateurs experts** — Comme le Sheikh Mishary Al-Afasy ou Sheikh Abdul Basit.

**3. Apprenez les règles essentielles** — Règles de Noon Sakinah, Madd, Qalqalah et Waqf.

**4. Enregistrez-vous** — Réécouter sa propre récitation révèle des erreurs insoupçonnées.

**5. Pratiquez avec un enseignant certifié** — Tibyaan Academy connecte avec des enseignants qualifiés. L'IA Ustaz est disponible 24h/24. Essai gratuit 5 jours.`,
      id: `Tajwid — seni membaca Al-Quran dengan pengucapan dan irama yang benar — adalah kewajiban setiap Muslim.

**5 cara belajar Tajwid dari rumah:**

**1. Mulai dari huruf hijaiyah** — Kuasai makhraj 29 huruf Arab dengan benar.

**2. Dengarkan qari terbaik** — Seperti Syaikh Mishary Al-Afasy dan Syaikh Abdul Basit.

**3. Pelajari aturan dasar** — Hukum Nun Sukun & Tanwin, Mad, Qalqalah, dan Waqaf.

**4. Rekam suara Anda** — Dengarkan kembali untuk menemukan kesalahan yang tidak disadari.

**5. Latihan dengan guru bersertifikat** — Tibyaan Academy menghubungkan dengan guru tersertifikat. AI Ustaz tersedia 24/7. Mulai uji coba gratis 5 hari.`,
    },
  },
  {
    slug: "bachon-ko-quran-kaise-sikhayein",
    category: "Bachon ki Taleem",
    readMinutes: 6,
    heroImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80",
    publishedAt: new Date("2026-05-03"),
    titles: {
      ur: "بچوں کو قرآن سکھانے کے 7 طریقے — والدین کے لیے گائیڈ",
      ar: "7 طرق لتعليم القرآن للأطفال — دليل للآباء",
      en: "7 Ways to Teach Children the Quran — A Parent's Guide",
      fr: "7 façons d'enseigner le Coran aux enfants — Guide pour les parents",
      id: "7 Cara Mengajarkan Al-Quran kepada Anak — Panduan Orang Tua",
    },
    contents: {
      en: `Teaching your children the Quran is the greatest gift you can give them. The Prophet ﷺ said: "The best gift a father gives his child is a good upbringing and education." (Al-Tirmidhi)

Here are 7 time-tested strategies to help your children connect with the Quran:

**1. Start Early — Even Before Birth**

Recite Quran to your unborn child. Studies show that babies recognize sounds heard in the womb. After birth, make Quran the soundtrack of your home.

**2. Lead by Example**

Children copy what they see. If they see you reading Quran daily, they will want to do the same. Never force — inspire.

**3. Make It Fun with Stories**

The Quran contains beautiful stories — of Yusuf (AS), Musa (AS), Isa (AS), and others. Tell these stories vividly before introducing the actual ayaat.

**4. Use Games and Activities**

Gamification works powerfully for children. Tibyaan Academy's Kids Activities section includes interactive Arabic letter tracing, memory games, and audio matching — making learning feel like play.

**5. Set a Consistent Schedule**

Even 15 minutes daily after Maghrib is more effective than 2 hours on weekends. Consistency creates habit. Create a dedicated Quran corner at home.

**6. Celebrate Every Milestone**

When your child memorizes a new surah, celebrate! Give a small gift, praise them in front of family. Positive reinforcement builds intrinsic motivation.

**7. Pair with a Qualified Teacher**

Home support is powerful, but professional guidance is irreplaceable. Tibyaan Academy's certified teachers work specifically with children, using age-appropriate methods. Our AI Ustaz provides instant pronunciation feedback.

Begin your child's Quran journey today — 5-day free trial, no credit card required.`,
      ur: `اپنے بچوں کو قرآن سکھانا سب سے بڑا تحفہ ہے۔ نبی ﷺ نے فرمایا: "باپ کی طرف سے بچے کو بہترین تحفہ اچھی تربیت ہے۔" (ترمذی)

**7 آزمودہ طریقے:**

**1. جلد شروع کریں** — یہاں تک کہ پیدائش سے پہلے بھی۔

**2. خود مثال بنیں** — بچے وہی کرتے ہیں جو دیکھتے ہیں۔

**3. قصص کے ذریعے** — حضرت یوسف، حضرت موسیٰ کے قصے سنائیں۔

**4. گیمز استعمال کریں** — تبیان اکیڈمی کا کڈز سیکشن حروف ٹریسنگ اور میموری گیمز پر مشتمل ہے۔

**5. باقاعدہ وقت مقرر کریں** — ہر روز مغرب کے بعد 15 منٹ کافی ہے۔

**6. ہر سیڑھی منائیں** — جب بچہ کوئی سورت یاد کرے تو تعریف اور انعام دیں۔

**7. استاد کے ساتھ جوڑیں** — تبیان اکیڈمی کے سند یافتہ اساتذہ بچوں کے ساتھ مخصوص طریقوں سے کام کرتے ہیں۔

آج 5 دن مفت ٹرائل شروع کریں۔`,
      ar: `تعليم أبنائك القرآن أعظم هديةٍ تمنحهم إياها. قال النبي ﷺ: "أكرموا أولادكم وأحسنوا أدبهم." (الترمذي)

**7 طرق مجرّبة:**

**1. ابدأ مبكراً** — حتى قبل الولادة.
**2. كن قدوة** — الأطفال يقلّدون ما يرون.
**3. استخدم القصص** — قصص يوسف وموسى وعيسى عليهم السلام.
**4. العب واللعب** — قسم أنشطة الأطفال في تبيان يجعل التعلم ممتعاً.
**5. حدد وقتاً منتظماً** — 15 دقيقة يومياً بعد المغرب.
**6. احتفل بكل إنجاز** — الثناء يبني الدافعية الداخلية.
**7. اشترك مع معلم متخصص** — معلمو تبيان متخصصون في تعليم الأطفال.

ابدأ التجربة المجانية 5 أيام اليوم.`,
      fr: `Enseigner le Coran à vos enfants est le plus beau cadeau que vous puissiez leur offrir.

**7 stratégies éprouvées :**

1. Commencez tôt — même avant la naissance.
2. Donnez l'exemple — les enfants imitent ce qu'ils voient.
3. Utilisez les histoires coraniques — Yusuf, Musa, Isa (AS).
4. Jouez avec l'apprentissage — La section Kids de Tibyaan rend l'apprentissage ludique.
5. Établissez un horaire régulier — 15 minutes après Maghrib chaque jour.
6. Célébrez chaque étape — La reconnaissance renforce la motivation.
7. Associez un enseignant qualifié — Les enseignants de Tibyaan sont spécialisés pour les enfants.

Essai gratuit 5 jours, sans carte bancaire.`,
      id: `Mengajarkan Al-Quran kepada anak-anak adalah hadiah terbesar yang bisa Anda berikan.

**7 strategi terbukti:**

1. Mulai sejak dini — bahkan sebelum lahir.
2. Jadilah teladan — anak meniru apa yang dilihat.
3. Gunakan kisah-kisah Quran — Nabi Yusuf, Musa, Isa AS.
4. Buat pembelajaran menyenangkan — Fitur Kids Tibyaan membuat belajar seperti bermain.
5. Jadwalkan waktu konsisten — 15 menit setelah Maghrib setiap hari.
6. Rayakan setiap pencapaian — Pujian membangun motivasi intrinsik.
7. Pasangkan dengan guru tersertifikat — Guru Tibyaan khusus menangani anak-anak.

Mulai uji coba gratis 5 hari sekarang.`,
    },
  },
  {
    slug: "arabic-seekhne-ki-ahmiyat",
    category: "Arabic",
    readMinutes: 5,
    heroImage: "https://images.unsplash.com/photo-1564419320408-38bbad5f7f3e?w=1200&q=80",
    publishedAt: new Date("2026-05-04"),
    titles: {
      ur: "عربی کیوں سیکھیں — قرآن سمجھنے کا واحد راستہ",
      ar: "لماذا تتعلم العربية — الطريق الوحيد لفهم القرآن",
      en: "Why Learn Arabic — The Only Way to Truly Understand the Quran",
      fr: "Pourquoi apprendre l'arabe — La seule voie pour vraiment comprendre le Coran",
      id: "Mengapa Belajar Bahasa Arab — Satu-satunya Cara Memahami Al-Quran",
    },
    contents: {
      en: `The Quran was revealed in Arabic, and there is no complete translation that captures its full depth, beauty, and precision. Allah says: "Indeed, We have sent it down as an Arabic Quran that you might understand." (12:2)

**The Problem with Translations Alone**

Every translation is, at best, an interpretation. The word "Taqwa" alone has over 30 nuanced meanings depending on context. A translation collapses this richness into one or two words. When you read Arabic, you access the original divine speech directly.

**How Long Does It Take?**

Conversational Arabic takes 6–12 months. Quranic Arabic — understanding the grammar and vocabulary needed to read the Quran — can be achieved in 3–6 months of structured study. Tibyaan Academy's Arabic course focuses specifically on this goal.

**Start with Vocabulary, Not Grammar**

The Quran uses approximately 1,600 unique root words. The 100 most frequent words cover over 40% of the Quran's text. Learning these 100 words first gives you instant comprehension of nearly half the Quran.

**Grammar as a Tool, Not a Goal**

Arabic grammar (Nahw and Sarf) is essential but don't get lost in it. Learn grammar in context — understand a rule, then see it applied immediately in Quranic verses.

**The Breakthrough Moment**

Every Arabic student describes a moment when the Quran "opens up" — when they hear an ayah in salah and suddenly understand it without translating. This is a life-changing experience.

Begin your Arabic journey today with Tibyaan Academy's 5-day free trial.`,
      ur: `قرآن عربی میں نازل ہوا، اور کوئی بھی ترجمہ اس کی گہرائی، خوبصورتی اور درستی کو مکمل طور پر بیان نہیں کر سکتا۔ اللہ فرماتا ہے: "ہم نے اسے عربی قرآن اتارا تاکہ تم سمجھو۔" (12:2)

**ترجموں کی حدود**

ہر ترجمہ ایک تشریح ہے۔ "تقویٰ" کا لفظ تنہا 30 سے زائد معانی رکھتا ہے۔ عربی میں آپ براہ راست الہی کلام تک رسائی حاصل کرتے ہیں۔

**کتنا وقت لگتا ہے؟**

قرآنی عربی 3 سے 6 ماہ کے منظم مطالعے سے حاصل ہو سکتی ہے۔ قرآن میں تقریباً 1600 منفرد الفاظ ہیں۔ پہلے 100 سب سے زیادہ آنے والے الفاظ قرآن کے 40% سے زیادہ متن کو سمجھنے میں مدد دیتے ہیں۔

تبیان اکیڈمی کا عربی کورس خاص طور پر قرآنی عربی پر مرکوز ہے۔ آج 5 دن مفت ٹرائل شروع کریں۔`,
      ar: `نزل القرآن باللغة العربية، ولا توجد ترجمة تستطيع أن تنقل عمقه وجماله الكامل. يقول الله تعالى: "إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ." (12:2)

**لماذا لا تكفي الترجمات؟**

كل ترجمة هي تفسير في أفضل الأحوال. كلمة "التقوى" وحدها لها أكثر من 30 معنىً دقيقاً. مع اللغة العربية تصل إلى الكلام الإلهي مباشرةً.

**كم يستغرق ذلك؟**

يمكن إتقان اللغة العربية القرآنية في 3–6 أشهر من الدراسة المنظمة. دورة العربية في أكاديمية تبيان مصمّمة خصيصاً لهذا الهدف. ابدأ تجربتك المجانية 5 أيام الآن.`,
      fr: `Le Coran a été révélé en arabe, et aucune traduction ne peut capturer toute sa profondeur et sa beauté. Allah dit : "Nous l'avons révélé en arabe afin que vous compreniez." (12:2)

La connaissance du vocabulaire le plus fréquent (les 100 premiers mots couvrent plus de 40% du texte coranique) donne un accès immédiat à la compréhension du Coran.

Le cours d'arabe de Tibyaan Academy est spécifiquement axé sur l'arabe coranique. Commencez votre essai gratuit de 5 jours aujourd'hui.`,
      id: `Al-Quran diturunkan dalam bahasa Arab, dan tidak ada terjemahan yang bisa menangkap kedalaman, keindahan, dan ketepatannya secara penuh. Allah berfirman: "Sesungguhnya Kami menurunkannya berupa Al-Quran berbahasa Arab, agar kamu memahaminya." (12:2)

100 kata paling sering muncul dalam Al-Quran mencakup lebih dari 40% teksnya. Mempelajari kata-kata ini terlebih dahulu memberikan pemahaman langsung atas hampir separuh Al-Quran.

Kursus bahasa Arab Tibyaan Academy difokuskan pada bahasa Arab Qurani. Mulai uji coba gratis 5 hari hari ini.`,
    },
  },
  {
    slug: "online-madrasa-ki-haqeeqat",
    category: "Islami Taleem",
    readMinutes: 7,
    heroImage: "https://images.unsplash.com/photo-1580894912989-0bc892f4efd0?w=1200&q=80",
    publishedAt: new Date("2026-05-05"),
    titles: {
      ur: "آن لائن مدرسہ بمقابلہ روایتی مدرسہ — کیا فرق ہے",
      ar: "المدرسة الإلكترونية مقابل التقليدية — ما الفرق؟",
      en: "Online Madrasa vs Traditional Madrasa — What's the Difference?",
      fr: "Madrasa en ligne vs Madrasa traditionnelle — Quelle est la différence?",
      id: "Madrasah Online vs Madrasah Tradisional — Apa Bedanya?",
    },
    contents: {
      en: `The rise of online Islamic education has sparked a genuine debate: can an online madrasa truly replace the traditional, in-person model? The answer is nuanced — and depends heavily on your goals.

**What Traditional Madrasas Do Best**

Physical madrasas offer something profound: full immersion. When a student lives in a residential madrasa (darul uloom), they absorb Islamic culture, adab (manners), and scholarly companionship around the clock. The barakah of sitting before a scholar face-to-face, the silence of the madrasa library at Fajr, the brotherhood formed over years — these are irreplaceable.

**What Online Madrasas Do Best**

Online Islamic education solves the accessibility problem. Millions of Muslims in non-Muslim countries have no access to qualified scholars. A parent in Denmark or Canada cannot simply send their child to a darul uloom. Online platforms like Tibyaan Academy bring the teacher to the student — wherever they are.

**Curriculum Quality**

Modern online madrasas — when done well — follow exactly the same curriculum as traditional institutions. Tibyaan Academy's Aalim Course follows the complete Dars-e-Nizami syllabus, designed under the supervision of graduates from Darul Uloom Karachi.

**Technology Advantage**

Online platforms offer tools traditional madrasas cannot: AI-powered Tajweed feedback, automated Hifz tracking, parent progress reports, and 24/7 access to supplementary AI tutoring.

**The Verdict**

For complete traditional scholars (huffaz, aalim, mufti), the traditional residential model remains ideal. But for the majority of Muslims who need flexible, quality Islamic education alongside modern education and careers, online madrasas are not just an alternative — they are the only viable option.

Tibyaan Academy bridges both worlds. Start your 5-day free trial today.`,
      ur: `آن لائن اسلامی تعلیم کے عروج نے ایک اہم سوال کھڑا کیا ہے: کیا آن لائن مدرسہ واقعی روایتی مدرسے کی جگہ لے سکتا ہے؟

**روایتی مدرسہ کی خوبیاں**

رہائشی دار العلوم میں مکمل غوطہ خوری ملتی ہے — آداب، علمی صحبت، اور تقویٰ کا ماحول چوبیس گھنٹے۔ کسی عالم کے سامنے بیٹھنے کی برکت کو بدلا نہیں جا سکتا۔

**آن لائن مدرسہ کی خوبیاں**

رسائی کا مسئلہ حل کرتا ہے۔ ڈنمارک یا کینیڈا میں رہنے والے لاکھوں مسلمانوں کے پاس کوئی دار العلوم نہیں۔ تبیان اکیڈمی استاد کو طالب علم تک پہنچاتی ہے — چاہے وہ کہیں بھی ہو۔

تبیان اکیڈمی کا عالم کورس مکمل درس نظامی نصاب پر مشتمل ہے جو دار العلوم کراچی کے فاضلین کی نگرانی میں ترتیب دیا گیا۔ آج 5 دن مفت آزمائیں۔`,
      ar: `أثار ظهور التعليم الإسلامي الإلكتروني جدلاً حقيقياً: هل يمكن للمدرسة الإلكترونية أن تحل محل النموذج التقليدي؟

**ميزات المدرسة التقليدية**
الانغماس الكامل في الثقافة الإسلامية والأدب والصحبة العلمية على مدار الساعة. بركة الجلوس بين يدي عالم وجهاً لوجه لا تُعوَّض.

**ميزات المدرسة الإلكترونية**
تحل مشكلة إمكانية الوصول. ملايين المسلمين في الدول غير الإسلامية لا يستطيعون الوصول إلى علماء مؤهلين.

منهج أكاديمية تبيان للعالم يتبع منهج درس النظامي الكامل بإشراف خريجي دار العلوم كراتشي. ابدأ تجربتك المجانية 5 أيام الآن.`,
      fr: `L'essor de l'éducation islamique en ligne a suscité un vrai débat : une madrasa en ligne peut-elle vraiment remplacer le modèle traditionnel ?

**Avantages de la madrasa traditionnelle**
Immersion totale dans la culture islamique, l'adab et la compagnie des savants. La baraka de s'asseoir devant un savant face à face est irremplaçable.

**Avantages de la madrasa en ligne**
Résout le problème d'accessibilité. Des millions de musulmans en Europe n'ont pas accès à des savants qualifiés.

Le cours Aalim de Tibyaan suit le programme complet Dars-e-Nizami. Essai gratuit 5 jours aujourd'hui.`,
      id: `Munculnya pendidikan Islam online telah memunculkan perdebatan yang nyata: dapatkah madrasah online benar-benar menggantikan model tradisional?

**Keunggulan Madrasah Tradisional**
Pencelupan penuh dalam budaya Islam, adab, dan persahabatan ilmiah sepanjang waktu. Keberkahan duduk di hadapan ulama secara langsung tidak tergantikan.

**Keunggulan Madrasah Online**
Memecahkan masalah aksesibilitas. Jutaan Muslim di negara non-Muslim tidak memiliki akses ke ulama berkualifikasi.

Kursus Aalim Tibyaan mengikuti kurikulum Dars-e-Nizami lengkap. Mulai uji coba gratis 5 hari hari ini.`,
    },
  },
  {
    slug: "dars-e-nizami-online-kya-mumkin-hai",
    category: "Aalim Course",
    readMinutes: 8,
    heroImage: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&q=80",
    publishedAt: new Date("2026-05-06"),
    titles: {
      ur: "درس نظامی آن لائن — کیا یہ ممکن ہے",
      ar: "درس النظامي أونلاين — هل هو ممكن؟",
      en: "Dars-e-Nizami Online — Is It Really Possible?",
      fr: "Dars-e-Nizami en ligne — Est-ce vraiment possible?",
      id: "Dars-e-Nizami Online — Apakah Ini Benar-benar Mungkin?",
    },
    contents: {
      en: `Dars-e-Nizami is the traditional Islamic academic curriculum that has produced scholars across South Asia for over 400 years. Named after Mulla Nizamuddin Firangi Mahali, this curriculum covers Arabic grammar, logic, philosophy, Fiqh (Islamic law), Hadith, and Tafseer over 6–8 years.

The question being asked increasingly in Muslim communities worldwide: can this rigorous, centuries-old curriculum be delivered effectively online?

**The Curriculum Itself**

Dars-e-Nizami covers approximately 40–50 classical Islamic texts, including:
- **Nahv & Sarf** (Arabic grammar): Ilm-us-Seeghah, Hidayat-un-Nahv, Sharh Jami
- **Mantiq** (Logic): Meyyar-ul-Ilm, Sharhul-Tahzeeb
- **Fiqh** (Islamic law): Qudoori, Kanzul Daqaiq, Hedayah
- **Hadith**: Mishkaat, Bukhari, Muslim, the six major collections
- **Tafseer**: Tafseer Jalalayn, Tafseer Baydawi

**The Traditional Objection**

Critics argue that ilm (knowledge) is transmitted through direct teacher-student connection (isnad), and that online cannot replicate this. There is truth here. The spiritual dimension of sitting with a sheikh, absorbing his character alongside his knowledge, is real.

**The Practical Reality**

However, for Muslims worldwide who cannot relocate to a darul uloom for 8 years, online Dars-e-Nizami is not just possible — it is necessary. The classical texts are the same. The teachers are the same qualified scholars. The live video interaction allows real-time question-and-answer.

**Tibyaan Academy's Aalim Course**

Our Aalim Course follows the complete Dars-e-Nizami syllabus, developed under the direct supervision of Maulana Abdullah Siddiqui — a graduate and Mufti from Darul Uloom Karachi. Live sessions are combined with recorded lectures, AI-assisted revision, and assessments.

The program takes 6–8 years to complete, with an Ijaazah (scholarly chain of transmission) awarded to graduates.

**Conclusion**

Online Dars-e-Nizami is real, rigorous, and achievable. It cannot fully replace the traditional residential experience for those who can access it. But for the vast majority of Muslims who cannot, it is a genuine path to authentic Islamic scholarship.

Begin your journey with a 5-day free trial at Tibyaan Academy.`,
      ur: `درس نظامی 400 سال سے زائد عرصے سے برصغیر میں علماء تیار کرتا آ رہا ہے۔ ملا نظام الدین فرنگی محل سے منسوب یہ نصاب عربی گرامر، منطق، فقہ، حدیث، اور تفسیر پر مشتمل 6 سے 8 سال کا جامع کورس ہے۔

**نصاب کا احاطہ**

درس نظامی میں تقریباً 40 سے 50 کلاسیکی اسلامی متون شامل ہیں:
- **نحو و صرف**: علم الصیغہ، ہدایت النحو، شرح جامی
- **فقہ**: قدوری، کنزالدقائق، ہدایہ
- **حدیث**: مشکوٰة، بخاری، مسلم اور چھ کتب احادیث
- **تفسیر**: تفسیر جلالین، تفسیر بیضاوی

تبیان اکیڈمی کا عالم کورس دار العلوم کراچی کے فاضل مولانا عبداللہ صدیقی کی نگرانی میں مکمل درس نظامی نصاب پر مبنی ہے۔ فراغت کے بعد اجازت سند بھی دی جاتی ہے۔ آج 5 دن مفت ٹرائل شروع کریں۔`,
      ar: `درس النظامي هو المنهج الأكاديمي الإسلامي التقليدي الذي أنتج علماء في جنوب آسيا لأكثر من 400 عام. يغطي هذا المنهج النحو والصرف والمنطق والفقه والحديث والتفسير على مدى 6–8 سنوات.

**ما يشمله المنهج:**
- النحو والصرف: علم الصيغة، هداية النحو، شرح الجامي
- الفقه: القدوري، كنز الدقائق، الهداية
- الحديث: المشكاة والكتب الستة
- التفسير: تفسير الجلالين والبيضاوي

دورة العالم في تبيان تتبع منهج درس النظامي الكامل بإشراف مولانا عبدالله صديقي، خريج دار العلوم كراتشي ومفتيها. تُمنح إجازة العلم عند الإتمام. ابدأ التجربة المجانية 5 أيام الآن.`,
      fr: `Le Dars-e-Nizami est le curriculum académique islamique traditionnel qui a formé des savants en Asie du Sud depuis plus de 400 ans.

**Ce que couvre le programme :**
- Nahv & Sarf (grammaire arabe)
- Mantiq (logique)
- Fiqh (droit islamique) : Qudoori, Kanzul Daqaiq, Hedayah
- Hadith : Mishkaat, Bukhari, Muslim
- Tafseer : Jalalayn, Baydawi

Le cours Aalim de Tibyaan suit le programme Dars-e-Nizami complet, développé sous la supervision directe de Maulana Abdullah Siddiqui, diplômé et Mufti de Darul Uloom Karachi. Une Ijaazah est accordée aux diplômés. Essai gratuit 5 jours.`,
      id: `Dars-e-Nizami adalah kurikulum akademik Islam tradisional yang telah melahirkan ulama di Asia Selatan selama lebih dari 400 tahun.

**Yang dicakup dalam kurikulum:**
- Nahw & Sarf (tata bahasa Arab)
- Mantiq (logika)
- Fiqh: Qudoori, Kanzul Daqaiq, Hedayah
- Hadits: Mishkaat, Bukhari, Muslim
- Tafsir: Tafsir Jalalain, Tafsir Baydawi

Kursus Aalim Tibyaan mengikuti kurikulum Dars-e-Nizami lengkap, dikembangkan di bawah pengawasan langsung Maulana Abdullah Siddiqui, lulusan dan Mufti Darul Uloom Karachi. Ijazah ilmiah diberikan kepada lulusan. Mulai uji coba gratis 5 hari hari ini.`,
    },
  },
];
