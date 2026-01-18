"use client";

import { cn } from "@/lib/utils";

interface ContactButtonsProps {
  phone?: string | null;
  lineId?: string | null;
  googleMapUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  className?: string;
  variant?: "default" | "compact";
}

export function ContactButtons({
  phone,
  lineId,
  googleMapUrl,
  facebookUrl,
  instagramUrl,
  className,
  variant = "default",
}: ContactButtonsProps) {
  const hasAnyContact = phone || lineId || googleMapUrl || facebookUrl || instagramUrl;

  if (!hasAnyContact) {
    return null;
  }

  const buttonBaseClass =
    variant === "compact"
      ? "inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
      : "inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        variant === "default" && "gap-3",
        className
      )}
    >
      {/* Call Button */}
      {phone && (
        <a
          href={`tel:${phone}`}
          className={cn(
            buttonBaseClass,
            "bg-success/10 text-success hover:bg-success/20 border border-success/30"
          )}
          data-event="click_call"
        >
          <PhoneIcon className="w-4 h-4" />
          <span>{variant === "compact" ? "โทร" : phone}</span>
        </a>
      )}

      {/* LINE Button */}
      {lineId && (
        <a
          href={`https://line.me/R/ti/p/${lineId}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonBaseClass,
            "bg-[#00B900]/10 text-[#00B900] hover:bg-[#00B900]/20 border border-[#00B900]/30"
          )}
          data-event="click_line"
        >
          <LineIcon className="w-4 h-4" />
          <span>LINE</span>
        </a>
      )}

      {/* Map Button */}
      {googleMapUrl && (
        <a
          href={googleMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonBaseClass,
            "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30"
          )}
          data-event="click_map"
        >
          <MapIcon className="w-4 h-4" />
          <span>แผนที่</span>
        </a>
      )}

      {/* Facebook Button */}
      {facebookUrl && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonBaseClass,
            "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border border-[#1877F2]/30"
          )}
        >
          <FacebookIcon className="w-4 h-4" />
          <span>Facebook</span>
        </a>
      )}

      {/* Instagram Button */}
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonBaseClass,
            "bg-gradient-to-r from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10",
            "text-[#E1306C] hover:from-[#833AB4]/20 hover:via-[#FD1D1D]/20 hover:to-[#F77737]/20",
            "border border-[#E1306C]/30"
          )}
        >
          <InstagramIcon className="w-4 h-4" />
          <span>Instagram</span>
        </a>
      )}
    </div>
  );
}

// Icon components
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
