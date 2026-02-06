import { NextResponse } from "next/server";
import { api, type StoreListDto } from "@/lib/api";
import { buildMoodSnapshot, MOOD_OPTIONS, type MoodId } from "@/lib/mood";

const KEYWORD_MAP: Record<MoodId, string[]> = {
  chill: ["ชิล", "relax", "chill", "slow", "unwind", "แจ๊ซ", "lounge"],
  social: ["คุย", "คุยงาน", "ทีม", "แฮงเอาท์", "social", "chat", "hangout"],
  romantic: ["เดท", "romantic", "หวาน", "anniversary", "คู่รัก"],
  party: ["ปาร์ตี้", "แดนซ์", "dj", "dance", "hiphop", "edm", "มันส์"],
  adventurous: ["ลองของใหม่", "hidden", "signature", "experimental", "special"],
  solo: ["คนเดียว", "solo", "อ่าน", "ทำงาน", "focus", "ชอบเงียบ"],
};

const FALLBACK_MOOD: MoodId = "chill";

interface MoodCompassRequest {
  query: string;
  lat?: number;
  lng?: number;
}

export async function POST(request: Request) {
  let body: MoodCompassRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.query || typeof body.query !== "string") {
    return NextResponse.json({ error: "กรุณาพิมพ์อารมณ์หรือสิ่งที่อยากได้คืนนี้" }, { status: 400 });
  }

  const normalized = body.query.toLowerCase();
  const moodId = detectMood(normalized);
  const mood = MOOD_OPTIONS.find((option) => option.id === moodId) ?? MOOD_OPTIONS[0];

  const storesResponse = await api.public.getStores({
    page: 1,
    pageSize: 50,
    featured: true,
    sortByDistance: false,
  });

  const ranked = rankStoresByMood(storesResponse.items, moodId).slice(0, 3);

  const summary = ranked.length
    ? `อารมณ์ ${mood.title} มี ${ranked.length} ร้านที่ตรงใจมากที่สุด ลองเริ่มจาก ${ranked[0].name} แล้วต่อด้วยอีกสองจุดได้เลย`
    : `ยังไม่เจอร้านที่ตรงกับอารมณ์ ${mood.title} ในตอนนี้ ลองค้นหาแบบอื่นหรือเลือกหมวดหมู่เพิ่มเติม`;

  return NextResponse.json({
    mood: {
      id: mood.id,
      title: mood.title,
      description: mood.description,
      tagline: mood.tagline,
    },
    summary,
    stores: ranked,
  });
}

function detectMood(text: string): MoodId {
  for (const [mood, keywords] of Object.entries(KEYWORD_MAP) as [MoodId, string[]][]) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return mood;
    }
  }
  return FALLBACK_MOOD;
}

function rankStoresByMood(stores: StoreListDto[], moodId: MoodId) {
  return stores
    .map((store) => {
      const snapshot = buildMoodSnapshot({
        name: store.name,
        description: store.description,
        categories: store.categoryNames.map((name) => ({ name })),
        priceRange: store.priceRange ?? undefined,
        provinceName: store.provinceName ?? undefined,
        regionName: undefined,
      });

      const moodScore = snapshot.moodScores.find((entry) => entry.mood.id === moodId)?.score ?? 0;
      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        provinceName: store.provinceName,
        categories: store.categoryNames,
        matchScore: moodScore,
        description: store.description,
        reason:
          moodScore >= 80
            ? `โดดเด่นในโหมด ${moodId === snapshot.primaryMoodId ? "หลัก" : "ผสม"}`
            : snapshot.summary,
      };
    })
    .filter((entry) => entry.matchScore >= 40)
    .sort((a, b) => b.matchScore - a.matchScore);
}
