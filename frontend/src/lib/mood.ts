import type { StoreMoodInsightDto } from "./api";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export type MoodId =
  | "chill"
  | "social"
  | "romantic"
  | "party"
  | "adventurous"
  | "solo";

export interface MoodOption {
  id: MoodId;
  title: string;
  description: string;
  tagline: string;
  colorHex: string;
  palette: {
    background: string;
    border: string;
    text: string;
    dot: string;
  };
  keywords: string[];
  thaiKeywords: string[];
  priceBias?: "value" | "premium";
  energyBias?: "low" | "high";
}

export interface VibeDimension {
  id: "energy" | "music" | "crowd" | "conversation" | "creativity" | "service";
  label: string;
  description: string;
  icon: "spark" | "music" | "people" | "chat" | "flask" | "heart";
  accent: string;
  track: string;
  bar: string;
  messages: {
    high: string;
    low: string;
  };
}

export type VibeDimensionId = VibeDimension["id"];

export interface MoodScore {
  mood: MoodOption;
  score: number; // 0-100
  reason: string;
  keywordsMatched: string[];
}

export interface VibeScore {
  dimension: VibeDimension;
  score: number; // 1-10
  emphasis: string;
}

export interface MoodSnapshot {
  matchScore: number;
  moodScores: MoodScore[];
  primaryMoodId: MoodId;
  secondaryMoodId: MoodId;
  vibeScores: VibeScore[];
  quote: string;
  summary: string;
  meta?: MoodSnapshotMeta;
}

export interface MoodSnapshotMeta {
  source: "synthetic" | "community";
  totalResponses?: number;
  lastUpdated?: string;
}

export interface MoodStoreContext {
  id?: string;
  name: string;
  description?: string | null;
  categories: Array<{ name: string }>;
  priceRange?: number | null;
  provinceName?: string | null;
  regionName?: string | null;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "chill",
    title: "Chill & Unwind",
    description: "ผ่อนคลายหลังงานหนัก ให้เพลงและบาร์เทนเดอร์ดูแล",
    tagline: "นั่งชิลล์ได้นาน ไม่ต้องเร่งรีบ",
    colorHex: "#38BDF8",
    palette: {
      background: "from-sky-500/20 via-blue-500/5 to-night/40",
      border: "border-sky-400/40",
      text: "text-sky-100",
      dot: "bg-sky-300",
    },
    keywords: ["jazz", "lounge", "acoustic", "slow bar", "whisky"],
    thaiKeywords: ["ชิล", "สงบ", "ผ่อนคลาย", "แจ๊ส"],
    energyBias: "low",
  },
  {
    id: "social",
    title: "Social & Chat",
    description: "คุยธุรกิจ นัดเพื่อนเก่า หรือทีมแฮงเอาต์",
    tagline: "โต๊ะกลุ่มใหญ่ เสียงคุยชัด",
    colorHex: "#FBBF24",
    palette: {
      background: "from-amber-400/25 via-yellow-500/10 to-night/40",
      border: "border-amber-300/40",
      text: "text-amber-100",
      dot: "bg-amber-300",
    },
    keywords: ["lounge", "meeting", "group", "social"],
    thaiKeywords: ["คุย", "ทีม", "เพื่อน", "แฮงเอาท์"],
  },
  {
    id: "romantic",
    title: "Romantic Date",
    description: "ไฟสลัว เพลงนุ่ม เครื่องดื่มดูดีในคืนพิเศษ",
    tagline: "เดทแรกหรือวันครบรอบ",
    colorHex: "#F472B6",
    palette: {
      background: "from-pink-500/20 via-rose-500/10 to-night/40",
      border: "border-pink-400/40",
      text: "text-pink-100",
      dot: "bg-pink-300",
    },
    keywords: ["date", "romantic", "fine dining", "couple", "speakeasy"],
    thaiKeywords: ["เดท", "โรแมนติก", "หวาน"],
    priceBias: "premium",
    energyBias: "low",
  },
  {
    id: "party",
    title: "Party & Dance",
    description: "ดีเจ ชุดไฟ และฟลอร์เต้นรำแบบจัดเต็ม",
    tagline: "ยืนเต้นยันปิดร้าน",
    colorHex: "#C084FC",
    palette: {
      background: "from-purple-500/20 via-fuchsia-500/10 to-night/40",
      border: "border-purple-400/40",
      text: "text-purple-100",
      dot: "bg-purple-300",
    },
    keywords: ["club", "dj", "dance", "party", "edm", "hiphop"],
    thaiKeywords: ["ดีเจ", "แดนซ์", "ปาร์ตี้", "โยก", "มันส์"],
    energyBias: "high",
  },
  {
    id: "adventurous",
    title: "Adventurous",
    description: "เมนูแปลกใหม่ หรือบาร์ลับที่ต้องไปพิสูจน์",
    tagline: "คนชอบลองอะไรไม่ซ้ำ",
    colorHex: "#FB923C",
    palette: {
      background: "from-orange-500/25 via-amber-500/10 to-night/40",
      border: "border-orange-400/40",
      text: "text-orange-100",
      dot: "bg-orange-300",
    },
    keywords: ["experimental", "fusion", "hidden", "craft"],
    thaiKeywords: ["ลับ", "ใหม่", "ซิกเนเจอร์", "เสิร์ฟพิเศษ"],
  },
  {
    id: "solo",
    title: "Solo Escape",
    description: "มาคนเดียว อ่านหนังสือ ฟังเพลง หรือปลดล็อกความคิด",
    tagline: "พื้นที่ส่วนตัวแบบสบาย",
    colorHex: "#94A3B8",
    palette: {
      background: "from-slate-400/25 via-slate-500/10 to-night/40",
      border: "border-slate-400/40",
      text: "text-slate-100",
      dot: "bg-slate-300",
    },
    keywords: ["solo", "quiet", "vinyl", "reading"],
    thaiKeywords: ["คนเดียว", "ทำงาน", "อ่าน"],
    energyBias: "low",
  },
];

const MOOD_LOOKUP = new Map<MoodId, MoodOption>(MOOD_OPTIONS.map((option) => [option.id, option]));

export const VIBE_DIMENSIONS: VibeDimension[] = [
  {
    id: "energy",
    label: "Energy",
    description: "ระดับความคึกคักและจังหวะของคืน",
    icon: "spark",
    accent: "text-fuchsia-200",
    track: "bg-white/5",
    bar: "from-fuchsia-500 to-pink-500",
    messages: {
      high: "บรรยากาศจัดเต็ม เหมาะกับสายแดนซ์",
      low: "เน้นนิ่ง ๆ ฟังเพลงสบาย",
    },
  },
  {
    id: "music",
    label: "Music",
    description: "ระดับความโดดเด่นของเพลง/ดีเจ",
    icon: "music",
    accent: "text-sky-200",
    track: "bg-white/5",
    bar: "from-sky-500 to-blue-500",
    messages: {
      high: "มีเพลย์ลิสต์/ดีเจจัดเต็ม",
      low: "เสียงดนตรีเบา คุยกันได้",
    },
  },
  {
    id: "crowd",
    label: "Crowd",
    description: "ความแน่นของผู้คน",
    icon: "people",
    accent: "text-amber-200",
    track: "bg-white/5",
    bar: "from-amber-400 to-orange-500",
    messages: {
      high: "ฮอตฮิต คนแน่นสุด",
      low: "โล่ง โปร่ง นั่งได้ชิล",
    },
  },
  {
    id: "conversation",
    label: "Conversation",
    description: "ระดับความเป็นส่วนตัวสำหรับการคุย",
    icon: "chat",
    accent: "text-emerald-200",
    track: "bg-white/5",
    bar: "from-emerald-400 to-teal-500",
    messages: {
      high: "คุยธุรกิจ/เดทได้ไม่ต้องตะโกน",
      low: "เหมาะกับสายแดนซ์มากกว่า",
    },
  },
  {
    id: "creativity",
    label: "Creativity",
    description: "ความครีเอทีฟของเมนูและประสบการณ์",
    icon: "flask",
    accent: "text-indigo-200",
    track: "bg-white/5",
    bar: "from-indigo-400 to-purple-500",
    messages: {
      high: "ซิกเนเจอร์ดริ้งค์/คอนเซ็ปต์จัดเต็ม",
      low: "เมนูมาตรฐานแต่มั่นใจได้",
    },
  },
  {
    id: "service",
    label: "Service",
    description: "ความอบอุ่นและความใส่ใจของทีมงาน",
    icon: "heart",
    accent: "text-rose-200",
    track: "bg-white/5",
    bar: "from-rose-400 to-pink-500",
    messages: {
      high: "พนักงานจำชื่อ คอยดูแล",
      low: "บริการมาตรฐานแบบ self-service",
    },
  },
];

const keywordRegex = /[\s,.;:()\-]/;

const normalize = (value?: string | null) => (value || "").toLowerCase();

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const collectMatches = (text: string, keywords: string[]) => {
  const tokens = text.split(keywordRegex);
  const found = new Set<string>();
  keywords.forEach((keyword) => {
    if (!keyword) return;
    const normalizedKeyword = keyword.toLowerCase();
    if (tokens.some((token) => token === normalizedKeyword)) {
      found.add(keyword);
    } else if (text.includes(normalizedKeyword)) {
      found.add(keyword);
    }
  });
  return Array.from(found);
};

const getPriceAdjustment = (priceRange: number | null | undefined, mood: MoodOption) => {
  if (!priceRange) return 0;
  if (mood.priceBias === "premium" && priceRange >= 3) return 6;
  if (mood.priceBias === "value" && priceRange <= 2) return 4;
  return 0;
};

const getEnergyAdjustment = (primaryText: string, mood: MoodOption) => {
  if (mood.energyBias === "high" && /dj|live|band|party|แดนซ์|มันส์/.test(primaryText)) return 4;
  if (mood.energyBias === "low" && /slow|jazz|ชิล|สงบ|lofi/.test(primaryText)) return 4;
  return 0;
};

const dimensionAdjustmentMatrix: Record<MoodId, Partial<Record<VibeDimension["id"], number>>> = {
  chill: { energy: -2, conversation: 2 },
  social: { conversation: 2, crowd: 1 },
  romantic: { conversation: 3, service: 1 },
  party: { energy: 3, music: 2, crowd: 2, conversation: -2 },
  adventurous: { creativity: 3, energy: 1 },
  solo: { conversation: 3, crowd: -1, energy: -1 },
};

const deriveQuote = (description?: string | null) => {
  if (!description) return "ยังไม่มีคำบรรยายจากทางร้าน";
  const clean = description.replace(/\s+/g, " ").trim();
  if (!clean) return "ยังไม่มีคำบรรยายจากทางร้าน";
  if (clean.length <= 110) return clean;
  return `${clean.slice(0, 107)}...`;
};

export function buildMoodSnapshot(store: MoodStoreContext): MoodSnapshot {
  const contextText = normalize(`${store.description || ""} ${store.categories.map((c) => c.name).join(" ")}`);
  const baseSeed = hashString(`${store.id || store.name}-${store.priceRange || 0}`);

  const moodScores: MoodScore[] = MOOD_OPTIONS.map((mood, index) => {
    const matches = collectMatches(contextText, [...mood.keywords, ...mood.thaiKeywords]);
    const base = 48 + ((baseSeed + index * 17) % 34); // 48 - 81
    const priceBonus = getPriceAdjustment(store.priceRange ?? null, mood);
    const energyBonus = getEnergyAdjustment(contextText, mood);
    const categoryBonus = store.categories.length >= 3 && (mood.id === "social" || mood.id === "adventurous") ? 4 : 0;
    const score = clamp(base + matches.length * 7 + priceBonus + energyBonus + categoryBonus, 32, 98);

    const reason = matches.length > 0
      ? `พบคำว่า “${matches[0]}” ที่บอกใบ้ถึงอารมณ์ ${mood.title}`
      : mood.tagline;

    return {
      mood,
      score: Math.round(score),
      reason,
      keywordsMatched: matches,
    };
  }).sort((a, b) => b.score - a.score);

  const primary = moodScores[0];
  const secondary = moodScores[1] || primary;

  const vibeScores: VibeScore[] = VIBE_DIMENSIONS.map((dimension, index) => {
    const dimensionSeed = (baseSeed >> (index + 1)) & 0x7fffffff;
    const base = 3 + (dimensionSeed % 7); // 3 - 9
    const moodAdjustment = dimensionAdjustmentMatrix[primary.mood.id]?.[dimension.id] ?? 0;
    const score = clamp(base + moodAdjustment, 1, 10);
    const emphasis = score >= 7 ? dimension.messages.high : dimension.messages.low;
    return {
      dimension,
      score,
      emphasis,
    };
  });

  const summary = `${store.name} ผสมผสานอารมณ์ ${primary.mood.title} กับ ${secondary.mood.title} ได้ ${primary.score >= 85 ? "โดดเด่น" : primary.score >= 70 ? "อย่างลงตัว" : "อย่างน่าสนใจ"}.`;

  return {
    matchScore: primary.score,
    moodScores,
    primaryMoodId: primary.mood.id,
    secondaryMoodId: secondary.mood.id,
    vibeScores,
    quote: deriveQuote(store.description),
    summary,
    meta: {
      source: "synthetic",
    },
  };
}

export function buildSnapshotFromInsight(
  store: MoodStoreContext,
  insight: StoreMoodInsightDto
): MoodSnapshot {
  if (!insight || insight.totalResponses === 0) {
    return buildMoodSnapshot(store);
  }

  const fallbackMood = MOOD_OPTIONS[0];
  const resolvedMoodScores: MoodScore[] = insight.moodScores
    .map((entry) => {
      const mood = MOOD_LOOKUP.get(entry.moodCode as MoodId) ?? fallbackMood;
      return {
        mood,
        score: Math.round(entry.percentage),
        reason: `${entry.votes} เสียงเลือกอารมณ์นี้`,
        keywordsMatched: [],
      };
    })
    .sort((a, b) => b.score - a.score);

  const primaryMood = resolvedMoodScores[0]?.mood ?? fallbackMood;
  const secondaryMood = resolvedMoodScores[1]?.mood ?? primaryMood;

  const vibeScores: VibeScore[] = VIBE_DIMENSIONS.map((dimension) => {
    const serverScore = insight.vibeScores.find((item) => item.dimension === dimension.id);
    const value = serverScore ? clamp(Math.round(serverScore.averageScore), 1, 10) : 5;
    return {
      dimension,
      score: value,
      emphasis: value >= 7 ? dimension.messages.high : dimension.messages.low,
    };
  });

  const quote = insight.highlightQuote?.trim() || deriveQuote(store.description);

  const summary = `${store.name} ได้คะแนนจริง ${insight.primaryMatchScore}% ในโหมด ${primaryMood.title} พร้อมเสียงสนับสนุน ${insight.totalResponses} คน`;

  return {
    matchScore: insight.primaryMatchScore || resolvedMoodScores[0]?.score || 0,
    moodScores: resolvedMoodScores,
    primaryMoodId: primaryMood.id,
    secondaryMoodId: secondaryMood.id,
    vibeScores,
    quote,
    summary,
    meta: {
      source: "community",
      totalResponses: insight.totalResponses,
      lastUpdated: insight.lastSubmittedAt ?? undefined,
    },
  };
}
