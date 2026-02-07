"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type CommunityPostDto, type StoreListDto, type UserAccountDto } from "@/lib/api";
import { getIdToken } from "@/lib/firebase";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserPreferences, type UserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/components/ui/Toast";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { cn, resolveImageUrl } from "@/lib/utils";

export default function AccountPage() {
  const { user, loading, signOut } = useFirebaseAuth();
  const { favorites, favoriteCount, clearAll, isHydrated } = useFavorites();
  const {
    preferences,
    updatePreference,
    resetPreferences,
    isHydrated: preferencesHydrated,
  } = useUserPreferences();
  const { showToast } = useToast();

  const { data: account, isFetching: isAccountFetching } = useQuery<UserAccountDto>({
    queryKey: ["user-account"],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("missing token");
      return api.user.getAccount(token);
    },
    enabled: Boolean(user) && !loading,
    staleTime: 60 * 1000,
  });

  const { data: favoriteStores = [], isLoading: isFavoriteLoading } = useQuery<StoreListDto[]>({
    queryKey: ["account", "favorites", favorites],
    queryFn: () => api.public.getStoresByIds(favorites),
    enabled: isHydrated && favorites.length > 0,
  });

  const {
    data: myCommunityPosts = [],
    isLoading: isCommunityPostsLoading,
  } = useQuery<CommunityPostDto[]>({
    queryKey: ["user-community-posts"],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("missing token");
      return api.user.getMyCommunityPosts(token, 6);
    },
    enabled: Boolean(user) && !loading,
  });

  const displayedFavorites = favoriteStores?.slice(0, 4) ?? [];
  const preferencesReady = preferencesHydrated && Boolean(user);
  const avatarUrl = account?.photoUrl || user?.photoURL || null;
  const displayName = account?.displayName || user?.displayName || user?.email || "สมาชิก Nightnice";
  const accountEmail = account?.email || user?.email || "—";
  const lastLoginDisplay = account?.lastLoginAt ? formatDateTime(account.lastLoginAt) : "—";
  const createdAtDisplay = account?.createdAt ? formatDateTime(account.createdAt) : "—";

  const privacyOptions: {
    key: keyof UserPreferences;
    title: string;
    description: string;
    icon: (props: { className?: string }) => React.ReactNode;
  }[] = [
    {
      key: "shareLocation",
      title: "แชร์ตำแหน่งเพื่อหาที่ใกล้คุณ",
      description: "ใช้เฉพาะเพื่อจัดอันดับร้านใกล้ฉันเท่านั้น",
      icon: LocationIcon,
    },
    {
      key: "allowMoodDigest",
      title: "รับ Mood Pulse Digest รายสัปดาห์",
      description: "อัปเดตอารมณ์เมืองและข้อเสนอเฉพาะทางอีเมล",
      icon: WaveIcon,
    },
    {
      key: "marketingUpdates",
      title: "อัปเดตโปรโมชั่นพิเศษ",
      description: "บทความ + สิทธิพิเศษจากร้านพาร์ทเนอร์ (น้อยกว่า 2 ครั้ง/เดือน)",
      icon: MailIcon,
    },
  ];

  const accountStats = useMemo(
    () => [
      {
        label: "ร้านโปรด",
        value: favoriteCount,
        detail: favoriteCount > 0 ? "พร้อมสำหรับทริปรอบหน้า" : "ยังไม่ได้บันทึก",
        accent: "text-primary-light",
      },
      {
        label: "การแชร์ตำแหน่ง",
        value: preferences.shareLocation ? "เปิด" : "ปิด",
        detail: preferences.shareLocation ? "ใช้ระบุร้านใกล้คุณ" : "เราจะไม่ใช้ตำแหน่ง",
        accent: preferences.shareLocation ? "text-success" : "text-muted",
      },
      {
        label: "บัญชี",
        value: account ? (account.provider ?? "Firebase") : "ยังไม่ได้เข้าสู่ระบบ",
        detail: account?.email ?? user?.email ?? "เข้าสู่ระบบเพื่อซิงค์ข้อมูล",
        accent: account ? "text-accent-light" : "text-muted",
      },
    ],
    [account, favoriteCount, preferences.shareLocation, user]
  );

  const handleDownloadData = useCallback(async () => {
    if (!user) {
      showToast("กรุณาเข้าสู่ระบบก่อนดาวน์โหลดข้อมูล", "error");
      return;
    }

    try {
      const token = await getIdToken();
      if (!token) throw new Error("missing token");
      const payload = await api.user.exportAccount(token);
      if (typeof window === "undefined") return;

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nightnice-account-${new Date(payload.exportedAt).toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("ดาวน์โหลดข้อมูลสำเร็จ", "success");
    } catch (error) {
      console.error("Failed to export account data:", error);
      showToast("ไม่สามารถดาวน์โหลดข้อมูลได้", "error");
    }
  }, [showToast, user]);

  const handleClearFavorites = useCallback(() => {
    if (typeof window !== "undefined") {
      if (favoriteCount === 0) {
        showToast("ยังไม่มีร้านโปรดให้ล้าง", "info");
        return;
      }
      const confirmed = window.confirm("ยืนยันการล้างร้านโปรดทั้งหมด?");
      if (!confirmed) return;
    }
    clearAll();
    showToast("ล้างร้านโปรดเรียบร้อย", "success");
  }, [clearAll, favoriteCount, showToast]);

  const handleResetPreferences = useCallback(() => {
    resetPreferences();
    showToast("รีเซ็ตการตั้งค่าความเป็นส่วนตัวแล้ว", "info");
  }, [resetPreferences, showToast]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    showToast("ออกจากระบบแล้ว", "success");
  }, [showToast, signOut]);

  return (
    <div className="min-h-screen bg-night text-surface-light">
      <section className="relative pt-6 pb-10 sm:py-12 md:py-16 bg-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-night" />
        <div className="absolute inset-x-0 top-8 flex justify-center opacity-50 blur-3xl pointer-events-none">
          <div className="w-48 h-48 sm:w-72 sm:h-72 bg-accent/40 rounded-full mix-blend-screen" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-5 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/30 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase text-primary-light">
              Mood Control
            </div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-display font-bold leading-tight">
              ศูนย์จัดการบัญชี
            </h1>
            <p className="text-muted text-xs sm:text-base md:text-lg max-w-md sm:max-w-none mx-auto">
              จัดการโปรไฟล์ การบันทึกร้าน และการตั้งค่าของคุณ
            </p>

            {loading ? (
              <div className="flex items-center justify-center gap-2.5 text-muted text-sm">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>กำลังตรวจสอบ...</span>
              </div>
            ) : user ? (
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-night-lighter/60 border border-white/10 shadow-glow-blue">
                  <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-primary/30 flex-shrink-0">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] sm:text-sm text-muted leading-none mb-0.5">กำลังใช้งาน</p>
                    <p className="text-sm sm:text-base font-semibold truncate max-w-[140px] sm:max-w-none">
                      {displayName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 min-h-[44px] rounded-2xl border border-white/15 active:border-error/40 active:text-error sm:hover:border-error/40 sm:hover:text-error transition-all duration-300 text-xs sm:text-sm"
                >
                  <LogoutIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                  <span className="sm:hidden">ออก</span>
                </button>
                {isAccountFetching && (
                  <p className="text-[10px] sm:text-xs text-muted">
                    ซิงค์...
                  </p>
                )}
              </div>
            ) : (
              <div className="max-w-xs sm:max-w-sm mx-auto">
                <GoogleSignInButton />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative -mt-6 sm:-mt-10 pb-8 sm:pb-10 z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
            {accountStats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-xl sm:rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl px-2.5 py-3 sm:p-5 shadow-[0_15px_50px_rgba(0,0,0,0.45)]"
              >
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.3em] text-muted leading-tight">{stat.label}</p>
                <p className={cn("mt-1.5 sm:mt-3 text-sm sm:text-2xl font-display font-semibold", stat.accent)}>{stat.value}</p>
                <p className="text-[10px] sm:text-sm text-muted mt-0.5 sm:mt-1 line-clamp-1 leading-tight">{stat.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-16">
        <div className="container mx-auto px-4 space-y-5 sm:space-y-8">
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-2xl sm:rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-4 sm:p-6 shadow-card space-y-4 sm:space-y-6">
              <header className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted">โปรไฟล์</p>
                  <h2 className="text-lg sm:text-2xl font-display">ข้อมูลบัญชี</h2>
                </div>
                {user && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 text-primary-light text-[10px] sm:text-xs px-2.5 py-1">
                    <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">เชื่อมต่อ Google</span>
                    <span className="sm:hidden">Google</span>
                  </span>
                )}
              </header>

              <div className="grid gap-2.5 sm:gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-night/60 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted mb-1 sm:mb-2">ชื่อที่แสดง</p>
                  <p className="text-sm sm:text-lg font-semibold truncate">
                    {user ? displayName : "ยังไม่ได้เข้าสู่ระบบ"}
                  </p>
                  <p className="text-[11px] sm:text-sm text-muted truncate">{user ? accountEmail : "เข้าสู่ระบบเพื่อปรับแต่ง"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-night/60 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted mb-1 sm:mb-2">เข้าสู่ระบบล่าสุด</p>
                  <p className="text-sm sm:text-lg font-semibold">
                    {user ? lastLoginDisplay : "—"}
                  </p>
                  <p className="text-[11px] sm:text-sm text-muted">
                    สร้างเมื่อ {user ? createdAtDisplay : "—"}
                  </p>
                </div>
              </div>

              <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-night/60 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted mb-1.5 sm:mb-2">บริการที่เชื่อมต่อ</p>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                      <GoogleIcon className="w-4 h-4 text-dark" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{account?.provider?.toUpperCase() || "Google"}</p>
                      <p className="text-[11px] sm:text-xs text-muted">
                        {account ? "เชื่อมแล้ว" : "ยังไม่เชื่อม"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-night/60 p-3 sm:p-4 flex flex-col justify-between gap-2">
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted mb-1 sm:mb-2">ความปลอดภัย</p>
                    <p className="text-[11px] sm:text-sm text-muted leading-relaxed">
                      ใช้ Firebase Auth จัดการความปลอดภัย
                    </p>
                  </div>
                  <Link
                    href="https://myaccount.google.com/"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-primary-light active:text-primary sm:hover:text-primary min-h-[44px] sm:min-h-0"
                  >
                    จัดการความปลอดภัย <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>

            <article className="rounded-2xl sm:rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-card">
              <header>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted">การจัดการข้อมูล</p>
                <h2 className="text-lg sm:text-xl font-display">คำสั่งข้อมูล</h2>
              </header>
              <div className="space-y-1.5 sm:space-y-3">
                <button
                  onClick={handleDownloadData}
                  disabled={!user}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl border border-white/10 px-3 sm:px-4 min-h-[48px] sm:min-h-0 sm:py-3 active:border-primary/40 sm:hover:border-primary/40 sm:hover:shadow-glow-blue transition-all duration-200",
                    !user && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0">
                    <DownloadIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-light shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">ดาวน์โหลดข้อมูล</p>
                      <p className="text-[10px] sm:text-xs text-muted truncate">โปรไฟล์ ตั้งค่า ร้านโปรด</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted shrink-0 ml-2" />
                </button>
                <button
                  onClick={handleClearFavorites}
                  className="w-full flex items-center justify-between rounded-xl border border-white/10 px-3 sm:px-4 min-h-[48px] sm:min-h-0 sm:py-3 active:border-error/40 active:text-error sm:hover:border-error/40 sm:hover:text-error transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0">
                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">ล้างร้านโปรด</p>
                      <p className="text-[10px] sm:text-xs text-muted truncate">ลบรายการทั้งหมด</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted shrink-0 ml-2" />
                </button>
                <button
                  onClick={handleResetPreferences}
                  className="w-full flex items-center justify-between rounded-xl border border-white/10 px-3 sm:px-4 min-h-[48px] sm:min-h-0 sm:py-3 active:border-white/30 sm:hover:border-white/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0">
                    <RefreshIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">รีเซ็ตการตั้งค่า</p>
                      <p className="text-[10px] sm:text-xs text-muted truncate">กลับสู่ค่าเริ่มต้น</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted shrink-0 ml-2" />
                </button>
              </div>
            </article>
          </div>

          <article className="rounded-2xl sm:rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-4 sm:p-6 shadow-card">
            <header className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted">ความเป็นส่วนตัว</p>
                <h2 className="text-lg sm:text-2xl font-display">ควบคุมข้อมูล</h2>
                <p className="text-[11px] sm:text-sm text-muted mt-0.5 sm:mt-1">
                  ปรับสวิตช์เพื่อกำหนดข้อมูลที่ใช้
                </p>
              </div>
              <button
                onClick={handleResetPreferences}
                className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-muted active:text-surface-light sm:hover:text-surface-light min-h-[44px] sm:min-h-0 shrink-0"
              >
                <ShieldIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">คืนค่าเริ่มต้น</span>
                <span className="sm:hidden">รีเซ็ต</span>
              </button>
            </header>
            <div className="space-y-2 sm:space-y-0 sm:grid sm:gap-4 sm:grid-cols-3">
              {privacyOptions.map((option) => {
                const isEnabled = preferences[option.key];
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    disabled={!preferencesReady}
                    onClick={() => updatePreference(option.key, !isEnabled)}
                    className={cn(
                      "w-full text-left rounded-xl border px-3 sm:px-4 py-3 sm:py-5 transition-all duration-200",
                      isEnabled
                        ? "border-primary/40 bg-primary/10 shadow-glow-blue"
                        : "border-white/10 bg-night/50 active:border-white/30 sm:hover:border-white/30",
                      !preferencesReady && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", isEnabled ? "text-primary-light" : "text-muted")} />
                      <span
                        className={cn(
                          "inline-flex h-6 w-11 items-center rounded-full px-1 transition-all duration-200",
                          isEnabled ? "bg-primary/70" : "bg-white/10"
                        )}
                      >
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full bg-white transition-transform duration-200",
                            isEnabled ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-snug">{option.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted mt-0.5 sm:mt-1 leading-relaxed">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </article>

          {account && account.ownedStoreIds && account.ownedStoreIds.length > 0 && (
            <article className="rounded-2xl sm:rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-night-lighter/70 to-night-lighter/70 backdrop-blur-2xl p-4 sm:p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent-light">Venue Owner</p>
                  <h2 className="text-lg sm:text-2xl font-display">จัดการร้านของคุณ</h2>
                  <p className="text-[11px] sm:text-sm text-muted mt-0.5 sm:mt-1">
                    เจ้าของ {account.ownedStoreIds.length} ร้าน — แก้ไข analytics รีวิว
                  </p>
                </div>
                <Link
                  href="/account/owner"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] rounded-xl bg-accent/20 border border-accent/40 text-accent-light font-semibold text-sm active:bg-accent/30 sm:hover:bg-accent/30 sm:hover:shadow-glow-blue transition-all duration-200"
                >
                  Owner Dashboard <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </article>
          )}

          <article className="rounded-2xl sm:rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-4 sm:p-6 shadow-card space-y-4 sm:space-y-6">
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted">ร้านที่คุณเก็บไว้</p>
                <h2 className="text-lg sm:text-2xl font-display">ร้านโปรด</h2>
              </div>
              <Link
                href="/favorites"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary-light active:text-primary sm:hover:text-primary shrink-0 min-h-[44px] sm:min-h-0"
              >
                ดูทั้งหมด <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </header>

            {favoriteCount === 0 ? (
              <div className="text-center py-6 sm:py-12 border border-dashed border-white/10 rounded-xl sm:rounded-3xl">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-night/60 mx-auto flex items-center justify-center mb-2.5 sm:mb-4">
                  <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-muted" />
                </div>
                <p className="text-sm sm:text-lg font-semibold">ยังไม่มีร้านโปรด</p>
                <p className="text-xs sm:text-sm text-muted mt-1">กดหัวใจที่การ์ดร้านเพื่อเริ่มบันทึก</p>
                <Link
                  href="/stores"
                  className="inline-flex items-center gap-2 mt-3 sm:mt-4 px-4 py-2.5 min-h-[44px] rounded-xl bg-primary text-night text-sm font-semibold"
                >
                  เริ่มค้นหาร้าน <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                  {displayedFavorites.map((store) => (
                    <Link
                      key={store.id}
                      href={`/store/${store.slug}`}
                      className="group rounded-xl sm:rounded-2xl border border-white/10 bg-night/60 p-3 sm:p-4 active:border-primary/40 sm:hover:border-primary/40 sm:hover:shadow-glow-blue transition-all duration-200"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-night-lighter flex-shrink-0">
                          {store.logoUrl || store.bannerUrl ? (
                            <Image
                              src={resolveImageUrl(store.logoUrl || store.bannerUrl) || (store.logoUrl || store.bannerUrl)!}
                              alt={store.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">NN</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate group-hover:text-primary-light">
                            {store.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted truncate">
                            {store.provinceName || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
                        {store.categoryNames.slice(0, 2).map((category) => (
                          <span key={category} className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/10">
                            {category}
                          </span>
                        ))}
                        {store.categoryNames.length > 2 && (
                          <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/10">
                            +{store.categoryNames.length - 2}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                {isFavoriteLoading && (
                  <div className="flex items-center gap-2.5 text-muted text-xs sm:text-sm">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    กำลังโหลด...
                  </div>
                )}
              </>
            )}
          </article>

          {user && (
            <article className="rounded-2xl sm:rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-4 sm:p-6 shadow-card space-y-4 sm:space-y-5">
              <header className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted">Community</p>
                  <h2 className="text-lg sm:text-2xl font-display">โพสต์ที่ฉันเคยเขียน</h2>
                  <p className="text-[11px] sm:text-sm text-muted mt-0.5 sm:mt-1">
                    แสดงโพสต์ล่าสุด {myCommunityPosts.length} รายการ
                  </p>
                </div>
                <Link
                  href="/community"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary-light active:text-primary sm:hover:text-primary shrink-0 min-h-[44px] sm:min-h-0"
                >
                  ไปที่ Community <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </header>

              {isCommunityPostsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : myCommunityPosts.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {myCommunityPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-white/10 bg-night/60 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-surface-light line-clamp-1">{post.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary-light border border-primary/30 uppercase tracking-wide">
                            {post.moodId}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted">
                          {formatDateTime(post.createdAt)} · {post.store.storeName}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {post.vibeTags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/store/${post.store.storeSlug}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs sm:text-sm text-muted active:text-surface-light sm:hover:text-surface-light"
                        >
                          ดูร้าน <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-10 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-sm sm:text-base font-semibold">ยังไม่มีโพสต์</p>
                  <p className="text-xs sm:text-sm text-muted mt-1">
                    กด &quot;เขียนโพสต์ใหม่&quot; ในหน้า Community เพื่อเริ่มแชร์ประสบการณ์
                  </p>
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-primary text-night text-xs sm:text-sm font-semibold"
                  >
                    เขียนโพสต์แรก <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </article>
          )}
        </div>
      </section>
    </div>
  );
}

function formatDateTime(date?: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function PulseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12h3l2-7 4 14 2-7h5" />
    </svg>
  );
}

function RadarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 4a6 6 0 016 6M12 2v10l7.07 7.07" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5l1.43 3.57L10 10l-3.57 1.43L5 15l-1.43-3.57L0 10l3.57-1.43L5 5zm12-4l.94 2.35L20 4l-2.06.76L17 7l-.94-2.24L14 4l2.06-.65zM12 12l1.72 4.28L18 18l-4.28 1.72L12 24l-1.72-4.28L6 18l4.28-1.72z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M15 4h-6l-1 3h8l-1-3z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0014-2M19 5a9 9 0 00-14 2" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 9.5a2.5 2.5 0 10-2.5-2.5 2.5 2.5 0 002.5 2.5z" />
    </svg>
  );
}

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15c3 0 3-3 6-3s3 3 6 3 3-3 6-3M3 9c3 0 3-3 6-3s3 3 6 3 3-3 6-3" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
