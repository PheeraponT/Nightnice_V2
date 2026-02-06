"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { MOOD_OPTIONS, VIBE_DIMENSIONS } from "@/lib/mood";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  priority: "high" | "medium" | "low";
}

const KPI_CARDS = [
  { label: "ร้านที่ใช้งาน", value: "128", delta: "+4 สัปดาห์นี้", trend: "up" },
  { label: "คำขอขึ้นระบบ", value: "12", delta: "รอตรวจสอบ", trend: "neutral" },
  { label: "Mood Pulse 24 ชม.", value: "326", delta: "+18%", trend: "up" },
  { label: "รีวิวถูกรายงาน", value: "5", delta: "-2 จากสัปดาห์ก่อน", trend: "down" },
];

const MOOD_PULSE_FEED = [
  {
    id: "pulse-1",
    store: "The Bamboo Bar",
    mood: "Chill & Unwind",
    moodId: "chill",
    user: "UID 89F",
    minutesAgo: 12,
    scores: { energy: 3, music: 4, conversation: 9, crowd: 4, creativity: 7, service: 8 },
    quote: "เพลงแจ๊ซเหมาะสำหรับคุยงาน",
  },
  {
    id: "pulse-2",
    store: "Studio Lam",
    mood: "Social & Chat",
    moodId: "social",
    user: "UID 44B",
    minutesAgo: 28,
    scores: { energy: 6, music: 8, conversation: 5, crowd: 6, creativity: 9, service: 7 },
    quote: "ดีเจภาคกลางคืนสนุกมาก",
  },
  {
    id: "pulse-3",
    store: "Tropic City",
    mood: "Party & Dance",
    moodId: "party",
    user: "UID 11C",
    minutesAgo: 41,
    scores: { energy: 9, music: 9, conversation: 3, crowd: 8, creativity: 6, service: 7 },
    quote: "ฟลอร์แน่น แต่บริการเร็ว",
  },
];

const ACTION_ITEMS: ActionItem[] = [
  {
    id: "action-1",
    title: "ยืนยัน Mood Pulse พุ่งสูงผิดปกติ",
    description: "Live Pulse ของหมวด Party & Dance เพิ่มขึ้น 62% ใน กทม.",
    ctaLabel: "เปิดแดชบอร์ด",
    href: "/admin/stores?featured=true",
    priority: "high",
  },
  {
    id: "action-2",
    title: "อัปเดตร้าน TOP 5 Mood Highlights",
    description: "พร้อมเผยแพร่บนหน้าแรกภายในคืนนี้",
    ctaLabel: "แก้ไขรายการ",
    href: "/admin/stores",
    priority: "medium",
  },
  {
    id: "action-3",
    title: "ตรวจสอบรีวิวถูกรายงาน",
    description: "5 เคสใหม่เมื่อ 30 นาทีที่แล้ว",
    ctaLabel: "เปิดรีวิว",
    href: "/admin/contacts",
    priority: "medium",
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const moodMap = useMemo(
    () =>
      new Map(
        MOOD_OPTIONS.map((option) => [
          option.id,
          {
            title: option.title,
            colorClass: option.palette.border.replace("border-", "text-").replace("/40", ""),
            badgeBg: option.palette.background.replace("from-", "bg-"),
          },
        ])
      ),
    []
  );

  const heroHighlight = {
    store: "The Bamboo Bar",
    match: 94,
    moodPrimary: "chill",
    moodSecondary: "social",
    distance: "650 ม.",
    excerpt: "“แจ๊ซสบาย นั่งคุยกันได้ยาว ๆ”",
  };

  const vibeCallouts = VIBE_DIMENSIONS.slice(0, 3).map((dimension, index) => ({
    dimension,
    score: [8, 7, 6][index],
    trend: index === 0 ? "+12% vs LY" : "+3% vs LY",
  }));

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-night via-night/70 to-darker p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-primary-light">Admin Control Center</p>
            <h1 className="mt-2 text-3xl font-display font-semibold text-surface-light">
              สวัสดี {user?.username || "Admin"} 👋
            </h1>
            <p className="text-sm text-muted max-w-2xl mt-1">
              ติดตามสภาพอารมณ์กลางคืนแบบเรียลไทม์ อัปเดท Mood &amp; Vibe และจัดการร้าน/โฆษณาได้จากศูนย์ควบคุมเดียว
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/stores/new"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-surface-light hover:border-primary/40 transition"
            >
              <SparkIcon className="mr-2 h-4 w-4 text-primary" />
              เพิ่มร้านใหม่
            </Link>
            <Link
              href="/admin/stores"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-night hover:bg-primary/90 transition"
            >
              จัดการ Mood &amp; Vibe
              <ArrowRightMini className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-white/10 bg-darker/70 px-5 py-4 shadow-inner"
          >
            <p className="text-xs uppercase tracking-wide text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-surface-light">{card.value}</p>
            <span
              className={cn(
                "mt-1 inline-flex items-center text-xs font-medium",
                card.trend === "up" && "text-emerald-300",
                card.trend === "down" && "text-red-300",
                card.trend === "neutral" && "text-muted"
              )}
            >
              {card.delta}
            </span>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-darker/70 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Mood Intelligence</p>
              <h2 className="text-lg font-semibold text-surface-light">Match Highlight วันนี้</h2>
            </div>
            <span className="text-xs text-muted">รีเฟรชทุก 5 นาที</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-night/70 p-5 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <p className="text-sm text-muted">Store</p>
              <p className="text-2xl font-display text-surface-light">{heroHighlight.store}</p>
              <p className="text-sm text-muted">
                Match {heroHighlight.match}% · {heroHighlight.distance} จากฐานผู้ใช้
              </p>
              <div className="mt-3 flex gap-2">
                {[heroHighlight.moodPrimary, heroHighlight.moodSecondary].map((moodId) => {
                  const meta = moodMap.get(moodId as typeof heroHighlight.moodPrimary);
                  return (
                    <span
                      key={moodId}
                      className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-surface-light"
                    >
                      <DotIcon className="mr-1 h-2 w-2 text-primary-light" />
                      {meta?.title || moodId}
                    </span>
                  );
                })}
              </div>
              <p className="mt-4 text-sm italic text-muted">{heroHighlight.excerpt}</p>
            </div>
            <div className="flex-1 w-full space-y-3">
              {vibeCallouts.map(({ dimension, score, trend }) => (
                <div key={dimension.id}>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{dimension.label}</span>
                    <span className="text-primary-light">{trend}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/10">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", dimension.bar)}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>Last sync 2 นาทีที่แล้ว</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[11px]">
              <SparkIcon className="h-3.5 w-3.5 text-primary" />
              Live Pulse
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-darker/70 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Mood Trends</p>
              <h2 className="text-lg font-semibold text-surface-light">Top เปอร์เซ็นต์ 24 ชม.</h2>
            </div>
            <Link href="/admin/stores" className="text-xs text-primary-light hover:text-primary">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="space-y-3">
            {["chill", "party", "social"].map((moodId, index) => {
              const meta = moodMap.get(moodId as keyof typeof MOOD_OPTIONS[0]);
              return (
                <div key={moodId} className="rounded-xl border border-white/10 bg-night/60 p-3">
                  <div className="flex items-center justify-between text-sm text-surface-light">
                    <span>{meta?.title || moodId}</span>
                    <span className="text-muted text-xs">#{index + 1}</span>
                  </div>
                  <p className="text-xs text-muted">+{18 - index * 5}% ผู้ใช้เลือกใน 24 ชม.</p>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl border border-white/10 bg-night/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Vibe Alert</p>
            <p className="mt-2 text-sm text-surface-light">
              Energy score ในโหมด Party &amp; Dance สูงสุดในรอบ 30 วัน
            </p>
            <Link
              href="/admin/events"
              className="mt-3 inline-flex items-center text-xs font-medium text-primary-light hover:text-primary"
            >
              วางแคมเปญโปรโมต <ArrowRightMini className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-darker/70 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Live Mood Pulse Feed</p>
            <h2 className="text-lg font-semibold text-surface-light">เสียงจริงที่เพิ่งเข้ามา</h2>
          </div>
          <div className="flex gap-2 text-xs">
            <Link
              href="/admin/stores"
              className="rounded-full border border-white/15 px-3 py-1 text-muted hover:text-surface-light"
            >
              จัดการร้าน
            </Link>
            <Link
              href="/admin/contacts"
              className="rounded-full border border-white/15 px-3 py-1 text-muted hover:text-surface-light"
            >
              จัดการรีวิว
            </Link>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-white/10">
                <th className="py-2 pr-4">เวลา</th>
                <th className="py-2 pr-4">ร้าน</th>
                <th className="py-2 pr-4">Mood</th>
                <th className="py-2 pr-4">คะแนนเด่น</th>
                <th className="py-2 pr-4">Quote</th>
                <th className="py-2 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {MOOD_PULSE_FEED.map((pulse) => (
                <tr key={pulse.id} className="border-b border-white/5 last:border-b-0">
                  <td className="py-3 pr-4 text-muted">{pulse.minutesAgo} นาทีที่แล้ว</td>
                  <td className="py-3 pr-4 text-surface-light">{pulse.store}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-1 text-xs text-surface-light">
                      {pulse.mood}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted">
                    Energy {pulse.scores.energy}/10 · Music {pulse.scores.music}/10
                  </td>
                  <td className="py-3 pr-4 text-muted max-w-xs truncate">{pulse.quote}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/stores`}
                      className="text-xs text-primary-light hover:text-primary"
                    >
                      ตรวจสอบ
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-darker/70 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Action Center</p>
              <h2 className="text-lg font-semibold text-surface-light">สิ่งที่ควรทำต่อ</h2>
            </div>
            <Link href="/admin/contacts" className="text-xs text-primary-light hover:text-primary">
              ตั้งเตือน →
            </Link>
          </div>
          <div className="space-y-3">
            {ACTION_ITEMS.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-night/60 p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      item.priority === "high" && "bg-red-500/10 text-red-300",
                      item.priority === "medium" && "bg-amber-500/10 text-amber-300",
                      item.priority === "low" && "bg-slate-500/10 text-slate-300"
                    )}
                  >
                    {item.priority.toUpperCase()}
                  </span>
                  <p className="text-sm font-semibold text-surface-light">{item.title}</p>
                </div>
                <p className="text-xs text-muted">{item.description}</p>
                <Link
                  href={item.href}
                  className="text-xs font-semibold text-primary-light hover:text-primary inline-flex items-center"
                >
                  {item.ctaLabel}
                  <ArrowRightMini className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-darker/70 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Quick Links</p>
          <h2 className="mt-1 text-lg font-semibold text-surface-light">เข้าถึงเมนูหลัก</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { href: "/admin/stores", title: "จัดการร้าน", description: "สถานะ + Mood Override" },
              { href: "/admin/ads", title: "โฆษณา", description: "สปอนเซอร์ & Tracking" },
              { href: "/admin/events", title: "อีเวนท์", description: "สร้าง/แก้ไขอีเวนท์" },
              { href: "/admin/contacts", title: "ข้อความ", description: "คำถาม/รีวิว/แจ้งเตือน" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-white/10 bg-night/60 p-4 hover:border-primary/40 transition"
              >
                <h3 className="text-sm font-semibold text-surface-light">{link.title}</h3>
                <p className="text-xs text-muted mt-1">{link.description}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l1.8 4.8 5.2.4-4 3.2 1.3 5-4.3-2.8L7.7 16 9 11.2 5 7.8l5.2-.4L12 3z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightMini({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 8 8" fill="currentColor">
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}
