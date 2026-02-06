import Link from "next/link";
import Image from "next/image";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

const footerLinks = {
  categories: [
    { href: "/categories/liquor-store", label: "ร้านเหล้า" },
    { href: "/categories/bar", label: "บาร์" },
    { href: "/categories/pub", label: "ผับ" },
    { href: "/categories/late-night-restaurant", label: "ร้านอาหารกลางคืน" },
  ],
  regions: [
    { href: "/regions/central", label: "ภาคกลาง" },
    { href: "/regions/northern", label: "ภาคเหนือ" },
    { href: "/regions/northeastern", label: "ภาคอีสาน" },
    { href: "/regions/eastern", label: "ภาคตะวันออก" },
    { href: "/regions/western", label: "ภาคตะวันตก" },
    { href: "/regions/southern", label: "ภาคใต้" },
  ],
  company: [
    { href: "/about", label: "เกี่ยวกับเรา" },
    { href: "/contact", label: "ติดต่อเรา" },
    { href: "/advertise", label: "ลงโฆษณา" },
    { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
    { href: "/terms", label: "ข้อกำหนดการใช้งาน" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-night border-t border-white/5">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-night-light/50 pointer-events-none" />

      <div className="relative container mx-auto px-4 py-10 sm:py-14 md:py-16">
        {/* Top: Brand + Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand Section — full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6 group"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.svg"
                  alt={SITE_NAME}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg sm:text-xl font-display font-bold text-gradient">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted mb-4 sm:mb-6 leading-relaxed max-w-sm">
              {SITE_DESCRIPTION}
            </p>
            {/* Social Links — min 44px touch targets */}
            <div className="flex gap-1.5 sm:gap-2">
              <SocialLink href="https://facebook.com" label="Facebook" icon={<FacebookIcon />} />
              <SocialLink href="https://instagram.com" label="Instagram" icon={<InstagramIcon />} />
              <SocialLink href="https://twitter.com" label="Twitter" icon={<TwitterIcon />} />
              <SocialLink href="https://line.me" label="LINE" icon={<LineIcon />} />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-surface-light mb-3 sm:mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              หมวดหมู่
            </h3>
            <ul className="space-y-1 sm:space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center min-h-[40px] sm:min-h-0 text-xs sm:text-sm text-muted active:text-primary-light sm:hover:text-primary-light transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-surface-light mb-3 sm:mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              ภูมิภาค
            </h3>
            <ul className="space-y-1 sm:space-y-3">
              {footerLinks.regions.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center min-h-[40px] sm:min-h-0 text-xs sm:text-sm text-muted active:text-accent-light sm:hover:text-accent-light transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-surface-light mb-3 sm:mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              บริษัท
            </h3>
            <ul className="space-y-1 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center min-h-[40px] sm:min-h-0 text-xs sm:text-sm text-muted active:text-gold-light sm:hover:text-gold-light transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider my-6 sm:my-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted">
            &copy; {currentYear} {SITE_NAME}. สงวนลิขสิทธิ์
          </p>
          <p className="text-[10px] sm:text-xs text-muted/60 flex items-center gap-1.5 sm:gap-2">
            <WarningIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ผู้ใช้งานต้องมีอายุ 20 ปีขึ้นไป
          </p>
        </div>
      </div>
    </footer>
  );
}

// Social Link Component
function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-night-lighter/50 text-muted active:text-primary-light active:bg-primary/10 sm:hover:text-primary-light sm:hover:bg-primary/10 transition-all duration-200"
      aria-label={label}
    >
      {icon}
    </a>
  );
}

// Icon Components
function FacebookIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
