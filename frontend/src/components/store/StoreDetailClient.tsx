"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import type { StoreDetailDto } from "@/lib/api";

interface StoreDetailClientProps {
  store: StoreDetailDto;
  siteUrl: string;
}

export function StoreDetailClient({ store, siteUrl }: StoreDetailClientProps) {
  const { isFavorite, toggleFavorite, isHydrated } = useFavorites();
  const isFav = isHydrated && isFavorite(store.id);

  const hasContactInfo = store.phone || store.lineId || store.googleMapUrl;

  return (
    <>
      {/* Floating Favorite Button - Desktop only */}
      <div className="hidden md:block fixed top-24 right-6 z-40">
        <button
          onClick={() => toggleFavorite(store.id)}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            "backdrop-blur-sm border",
            isFav
              ? "bg-error/90 border-error/50 text-white shadow-error/30"
              : "bg-night-lighter/90 border-white/20 text-muted hover:text-error hover:bg-error/10 hover:border-error/30"
          )}
          aria-label={isFav ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
        >
          <HeartIcon className="w-6 h-6" filled={isFav} />
        </button>
      </div>

      {/* Floating Bottom Action Bar */}
      {hasContactInfo && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:hidden">
          <div className="bg-night-lighter/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-3">
            <div className="flex items-center gap-2">
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(store.id)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0",
                  isFav
                    ? "bg-error/20 text-error border border-error/30"
                    : "bg-night/50 text-muted hover:text-error border border-white/10"
                )}
                aria-label={isFav ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
              >
                <HeartIcon className="w-5 h-5" filled={isFav} />
              </button>

              {/* Main Actions */}
              <div className="flex-1 flex gap-2">
                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-success text-white font-medium rounded-xl transition-all duration-200 hover:bg-success/90 cursor-pointer"
                    data-event="click_call"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    <span>โทร</span>
                  </a>
                )}
                {store.lineId && (
                  <a
                    href={`https://line.me/R/ti/p/${store.lineId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00B900] text-white font-medium rounded-xl transition-all duration-200 hover:bg-[#00B900]/90 cursor-pointer"
                    data-event="click_line"
                  >
                    <LineIcon className="w-5 h-5" />
                    <span>LINE</span>
                  </a>
                )}
                {store.googleMapUrl && !store.phone && !store.lineId && (
                  <a
                    href={store.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white font-medium rounded-xl transition-all duration-200 hover:bg-accent/90 cursor-pointer"
                    data-event="click_map"
                  >
                    <MapIcon className="w-5 h-5" />
                    <span>แผนที่</span>
                  </a>
                )}
              </div>

              {/* Share Button */}
              <ShareDropdown url={`${siteUrl}/store/${store.slug}`} storeName={store.name} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Share Dropdown Component
function ShareDropdown({ url, storeName }: { url: string; storeName: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${storeName} - Nightnice`);

  return (
    <div className="relative group">
      <button
        className="w-12 h-12 rounded-xl flex items-center justify-center bg-night/50 text-muted hover:text-primary border border-white/10 transition-all duration-200"
        aria-label="แชร์"
      >
        <ShareIcon className="w-5 h-5" />
      </button>

      {/* Dropdown */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="bg-night-lighter border border-white/10 rounded-xl shadow-2xl p-2 min-w-[140px]">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 text-muted hover:text-[#1877F2] hover:bg-[#1877F2]/10 rounded-lg transition-all cursor-pointer"
          >
            <FacebookIcon className="w-5 h-5" />
            <span className="text-sm">Facebook</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 text-muted hover:text-surface-light hover:bg-white/10 rounded-lg transition-all cursor-pointer"
          >
            <TwitterIcon className="w-5 h-5" />
            <span className="text-sm">Twitter</span>
          </a>
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 text-muted hover:text-[#00B900] hover:bg-[#00B900]/10 rounded-lg transition-all cursor-pointer"
          >
            <LineShareIcon className="w-5 h-5" />
            <span className="text-sm">LINE</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
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

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LineShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}
