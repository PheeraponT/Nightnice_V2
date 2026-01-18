"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "หน้าแรก" },
  { href: "/stores", label: "ร้านทั้งหมด" },
  { href: "/categories", label: "หมวดหมู่" },
  { href: "/provinces", label: "จังหวัด" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-darker/95 backdrop-blur-sm border-b border-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gradient"
          >
            <svg
              className="w-8 h-8 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3L2 12h3v9h6v-6h2v6h6v-9h3L12 3z" />
            </svg>
            <span>{SITE_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-button text-sm font-medium",
                  "transition-colors duration-200",
                  isActiveLink(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:text-surface-light hover:bg-muted/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Button (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-button",
                "bg-dark border border-muted/30",
                "text-muted text-sm",
                "hover:border-accent/50 hover:text-surface-light",
                "transition-colors duration-200"
              )}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>ค้นหาร้าน...</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-muted hover:text-surface-light"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-muted/20">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-button text-sm font-medium",
                    "transition-colors duration-200",
                    isActiveLink(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:text-surface-light hover:bg-muted/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-button text-sm font-medium text-muted hover:text-surface-light hover:bg-muted/10"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>ค้นหาร้าน</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
