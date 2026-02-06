"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import { useFavorites } from "@/hooks/useFavorites";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

const navLinks = [
  { href: "/", label: "หน้าแรก", icon: HomeIcon },
  { href: "/stores", label: "ร้านทั้งหมด", icon: StoreIcon },
  { href: "/events", label: "อีเวนท์", icon: CalendarIcon },
  { href: "/map", label: "แผนที่", icon: MapIcon },
  { href: "/favorites", label: "ร้านโปรด", icon: HeartIcon, showBadge: true },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { favoriteCount } = useFavorites();
  const { user, loading, signInWithGoogle, signOut } = useFirebaseAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-night/90 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            {/* Owl Logo */}
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.svg"
                alt={SITE_NAME}
                fill
                className="object-contain"
                priority
              />
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-full bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
            </div>
            {/* Brand Name */}
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-display font-bold text-gradient">
                {SITE_NAME}
              </span>
              <span className="text-[10px] md:text-xs text-muted -mt-1 hidden sm:block">
                ค้นหาร้านกลางคืน
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const showBadge = link.showBadge && favoriteCount > 0;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
                    "transition-all duration-300",
                    isActiveLink(link.href)
                      ? link.showBadge
                        ? "bg-error/15 text-error shadow-glow-red"
                        : "bg-primary/15 text-primary-light shadow-glow-blue"
                      : "text-muted hover:text-surface-light hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold bg-error text-white rounded-full">
                      {favoriteCount > 99 ? "99+" : favoriteCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Button & Auth (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 rounded-xl",
                "bg-night-lighter border border-white/10",
                "text-muted text-sm",
                "hover:border-primary/30 hover:text-surface-light hover:shadow-glow-blue",
                "transition-all duration-300"
              )}
            >
              <SearchIcon className="w-4 h-4" />
              <span>ค้นหาร้าน...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted/60 bg-night/50 rounded border border-white/5">
                ⌘K
              </kbd>
            </Link>

            {/* Auth Section */}
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              // User Profile Menu
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl",
                    "bg-night-lighter border border-white/10",
                    "hover:border-primary/30 hover:shadow-glow-blue",
                    "transition-all duration-300",
                    isUserMenuOpen && "border-primary/30 shadow-glow-blue"
                  )}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/30">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-surface-light max-w-[120px] truncate">
                    {user.displayName || "ผู้ใช้"}
                  </span>
                  <ChevronIcon
                    className={cn(
                      "w-4 h-4 text-muted transition-transform duration-200",
                      isUserMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-night-lighter/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {/* User Info */}
                    <div className="p-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/30">
                          {user.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt={user.displayName || "User"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-light truncate">
                            {user.displayName || "ผู้ใช้"}
                          </p>
                          <p className="text-xs text-muted truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-surface-light hover:bg-white/5 transition-all duration-200"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>จัดการบัญชี</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-error hover:bg-error/10 transition-all duration-200"
                      >
                        <LogoutIcon className="w-4 h-4" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Sign In Button
              <button
                onClick={signInWithGoogle}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl",
                  "bg-primary/15 border border-primary/30",
                  "text-primary-light text-sm font-medium",
                  "hover:bg-primary/25 hover:border-primary/50 hover:shadow-glow-blue",
                  "transition-all duration-300"
                )}
              >
                <UserIcon className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>

          {/* Mobile Auth & Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Auth Button */}
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/30 hover:ring-primary/50 transition-all duration-300"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className={cn(
                  "p-2.5 rounded-xl",
                  "bg-primary/15 border border-primary/30",
                  "text-primary-light",
                  "hover:bg-primary/25 hover:border-primary/50",
                  "transition-all duration-300"
                )}
                aria-label="เข้าสู่ระบบ"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              className={cn(
                "p-2.5 rounded-xl",
                "text-muted hover:text-surface-light",
                "hover:bg-white/5 transition-all duration-300",
                isMobileMenuOpen && "bg-white/5 text-surface-light"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>

            {/* Mobile User Menu Dropdown */}
            {user && isUserMenuOpen && (
              <div className="absolute right-4 top-full mt-2 w-72 bg-night-lighter/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                {/* User Info */}
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/30">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-light truncate">
                        {user.displayName || "ผู้ใช้"}
                      </p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  <Link
                    href="/account"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-surface-light hover:bg-white/5 transition-all duration-200"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>จัดการบัญชี</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-error hover:bg-error/10 transition-all duration-200"
                  >
                    <LogoutIcon className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            isMobileMenuOpen ? "max-h-80 opacity-100 pb-4" : "max-h-0 opacity-0"
          )}
        >
          <nav className="pt-2 border-t border-white/5">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const showBadge = link.showBadge && favoriteCount > 0;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium",
                      "transition-all duration-300",
                      isActiveLink(link.href)
                        ? link.showBadge
                          ? "bg-error/15 text-error"
                          : "bg-primary/15 text-primary-light"
                        : "text-muted hover:text-surface-light hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{link.label}</span>
                    {showBadge && (
                      <span className="min-w-[20px] h-[20px] flex items-center justify-center px-1.5 text-[11px] font-bold bg-error text-white rounded-full">
                        {favoriteCount > 99 ? "99+" : favoriteCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              <Link
                href="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-muted hover:text-surface-light hover:bg-white/5 transition-all duration-300"
              >
                <SearchIcon className="w-5 h-5" />
                <span>ค้นหาร้าน</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Icon Components
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
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

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.983 6.545a2.455 2.455 0 11-4.91 0 2.455 2.455 0 014.91 0zM20.182 8.182h-4.364M22 6.545h-1.818m-14.73 7.637a2.455 2.455 0 11-4.91 0 2.455 2.455 0 014.91 0zm8.486 1.091h-4.364M18 15.273h-1.818m-2.91-4.364a2.455 2.455 0 11-4.91 0 2.455 2.455 0 014.91 0zm8.485 1.091h-4.364M22 9.818h-1.818"
      />
    </svg>
  );
}
