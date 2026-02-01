"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "หน้าแรก", icon: HomeIcon },
  { href: "/stores", label: "ร้านทั้งหมด", icon: StoreIcon },
  { href: "/map", label: "แผนที่", icon: MapIcon },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
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
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
                    "transition-all duration-300",
                    isActiveLink(link.href)
                      ? "bg-primary/15 text-primary-light shadow-glow-blue"
                      : "text-muted hover:text-surface-light hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Button (Desktop) */}
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
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className={cn(
              "md:hidden p-2.5 rounded-xl",
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
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium",
                      "transition-all duration-300",
                      isActiveLink(link.href)
                        ? "bg-primary/15 text-primary-light"
                        : "text-muted hover:text-surface-light hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
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
