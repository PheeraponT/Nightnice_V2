"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { user, getToken } = useAuth();
  const token = getToken();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.admin.getDashboard(token!),
    enabled: !!token,
    refetchInterval: 60_000,
  });

  const kpiCards = useMemo(() => {
    if (!dashboard) return [];
    return [
      { label: "ร้านที่ใช้งาน", value: dashboard.activeStores, href: "/admin/stores" },
      { label: "อีเวนท์ที่ใช้งาน", value: dashboard.activeEvents, href: "/admin/events" },
      { label: "ผู้ใช้ทั้งหมด", value: dashboard.totalUsers, href: "#" },
      { label: "Mood Feedback วันนี้", value: dashboard.moodFeedbackToday, href: "#" },
    ];
  }, [dashboard]);

  const pendingItems = useMemo(() => {
    if (!dashboard) return [];
    const items = [];
    if (dashboard.pendingClaims > 0) {
      items.push({
        title: `${dashboard.pendingClaims} คำขอสิทธิ์ดูแลร้าน`,
        description: "รอตรวจสอบและอนุมัติ",
        ctaLabel: "ตรวจสอบ",
        href: "/admin/stores",
        priority: "high" as const,
      });
    }
    if (dashboard.pendingProposals > 0) {
      items.push({
        title: `${dashboard.pendingProposals} คำเสนอร้าน/อีเวนท์ใหม่`,
        description: "รอตรวจสอบก่อนเผยแพร่",
        ctaLabel: "ตรวจสอบ",
        href: "/admin/stores",
        priority: "high" as const,
      });
    }
    if (dashboard.pendingUpdates > 0) {
      items.push({
        title: `${dashboard.pendingUpdates} คำขออัปเดตข้อมูล`,
        description: "ผู้ใช้แจ้งข้อมูลไม่ตรง",
        ctaLabel: "ดูรายการ",
        href: "/admin/stores",
        priority: "medium" as const,
      });
    }
    if (dashboard.unreadContacts > 0) {
      items.push({
        title: `${dashboard.unreadContacts} ข้อความยังไม่ได้อ่าน`,
        description: "คำถาม/ติดต่อจากผู้ใช้",
        ctaLabel: "เปิดข้อความ",
        href: "/admin/contacts",
        priority: "medium" as const,
      });
    }
    if (dashboard.reportedReviews > 0) {
      items.push({
        title: `${dashboard.reportedReviews} รีวิวถูกรายงาน`,
        description: "รอตรวจสอบเนื้อหา",
        ctaLabel: "ตรวจสอบ",
        href: "/admin/contacts",
        priority: "medium" as const,
      });
    }
    if (items.length === 0) {
      items.push({
        title: "ไม่มีรายการค้างดำเนินการ",
        description: "ทุกอย่างเรียบร้อยดี",
        ctaLabel: "ดูร้านทั้งหมด",
        href: "/admin/stores",
        priority: "low" as const,
      });
    }
    return items;
  }, [dashboard]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-night via-night/70 to-darker p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-primary-light">Admin Control Center</p>
            <h1 className="mt-2 text-3xl font-display font-semibold text-surface-light">
              {user?.username || "Admin"}
            </h1>
            <p className="text-sm text-muted max-w-2xl mt-1">
              จัดการร้าน อีเวนท์ โฆษณา และตรวจสอบคำขอจากผู้ใช้
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
              จัดการร้าน
              <ArrowRightMini className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className="rounded-2xl border border-white/10 bg-darker/70 px-5 py-4 animate-pulse">
                <div className="h-3 w-24 bg-white/10 rounded mb-3" />
                <div className="h-8 w-16 bg-white/10 rounded" />
              </article>
            ))
          : kpiCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="rounded-2xl border border-white/10 bg-darker/70 px-5 py-4 shadow-inner hover:border-primary/30 transition"
              >
                <p className="text-xs uppercase tracking-wide text-muted">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-surface-light">{card.value.toLocaleString()}</p>
              </Link>
            ))}
      </section>

      {/* Moderation Overview + Action Center */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Moderation Stats */}
        <article className="rounded-2xl border border-white/10 bg-darker/70 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Moderation Overview</p>
              <h2 className="text-lg font-semibold text-surface-light">สถานะคำขอจากผู้ใช้</h2>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : dashboard ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ModerationCard
                label="ขอสิทธิ์ดูแลร้าน"
                count={dashboard.pendingClaims}
                total={dashboard.pendingClaims}
                href="/admin/stores"
                color="primary"
              />
              <ModerationCard
                label="เสนอร้าน/อีเวนท์ใหม่"
                count={dashboard.pendingProposals}
                total={dashboard.pendingProposals}
                href="/admin/stores"
                color="accent"
              />
              <ModerationCard
                label="แจ้งอัปเดตข้อมูล"
                count={dashboard.pendingUpdates}
                total={dashboard.pendingUpdates}
                href="/admin/stores"
                color="gold"
              />
            </div>
          ) : null}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-night/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted">Mood Feedback ทั้งหมด</p>
              <p className="mt-1 text-2xl font-semibold text-surface-light">
                {isLoading ? "..." : dashboard?.totalMoodFeedback.toLocaleString()}
              </p>
              <p className="text-xs text-muted mt-1">
                วันนี้ {isLoading ? "..." : dashboard?.moodFeedbackToday.toLocaleString()} รายการ
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-night/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted">ข้อความยังไม่ได้อ่าน</p>
              <p className="mt-1 text-2xl font-semibold text-surface-light">
                {isLoading ? "..." : dashboard?.unreadContacts.toLocaleString()}
              </p>
              <Link href="/admin/contacts" className="text-xs text-primary-light hover:text-primary mt-1 inline-block">
                เปิดข้อความ →
              </Link>
            </div>
          </div>
        </article>

        {/* Action Center */}
        <article className="rounded-2xl border border-white/10 bg-darker/70 p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Action Center</p>
            <h2 className="text-lg font-semibold text-surface-light">สิ่งที่ควรทำต่อ</h2>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
              ))
            ) : (
              pendingItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-night/60 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        item.priority === "high" && "bg-red-500/10 text-red-300",
                        item.priority === "medium" && "bg-amber-500/10 text-amber-300",
                        item.priority === "low" && "bg-emerald-500/10 text-emerald-300"
                      )}
                    >
                      {item.priority === "high" ? "HIGH" : item.priority === "medium" ? "MEDIUM" : "OK"}
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
              ))
            )}
          </div>
        </article>
      </section>

      {/* Quick Links */}
      <section className="rounded-2xl border border-white/10 bg-darker/70 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Quick Links</p>
        <h2 className="mt-1 text-lg font-semibold text-surface-light">เข้าถึงเมนูหลัก</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/stores", title: "จัดการร้าน", description: `${dashboard?.activeStores ?? "..."} ร้านที่ใช้งาน` },
            { href: "/admin/ads", title: "โฆษณา", description: "สปอนเซอร์ & Tracking" },
            { href: "/admin/events", title: "อีเวนท์", description: `${dashboard?.activeEvents ?? "..."} อีเวนท์ที่ใช้งาน` },
            { href: "/admin/contacts", title: "ข้อความ", description: `${dashboard?.unreadContacts ?? "..."} ยังไม่ได้อ่าน` },
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
      </section>
    </div>
  );
}

function ModerationCard({
  label,
  count,
  href,
  color,
}: {
  label: string;
  count: number;
  total: number;
  href: string;
  color: "primary" | "accent" | "gold";
}) {
  const colorMap = {
    primary: { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary-light" },
    accent: { bg: "bg-accent/10", border: "border-accent/30", text: "text-accent-light" },
    gold: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300" },
  };
  const c = colorMap[color];

  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl border p-4 transition hover:opacity-80",
        count > 0 ? `${c.bg} ${c.border}` : "border-white/10 bg-night/60"
      )}
    >
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold", count > 0 ? c.text : "text-surface-light")}>
        {count}
      </p>
      <p className="text-xs text-muted mt-1">{count > 0 ? "รอตรวจสอบ" : "ไม่มีรายการค้าง"}</p>
    </Link>
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
