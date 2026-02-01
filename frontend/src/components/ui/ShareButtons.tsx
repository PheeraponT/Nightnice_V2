"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type SharePlatform = "facebook" | "twitter" | "line" | "copy";

export interface ShareButtonsProps {
  url: string;
  title: string;
  platforms?: SharePlatform[];
  variant?: "icon" | "button";
  className?: string;
  buttonClassName?: string;
}

const PLATFORM_CONFIG: Record<
  SharePlatform,
  {
    label: string;
    getShareUrl: (url: string, title: string) => string | null;
    color: string;
    hoverColor: string;
    bgColor: string;
    icon: React.ReactNode;
  }
> = {
  facebook: {
    label: "Facebook",
    getShareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: "text-[#1877F2]",
    hoverColor: "hover:text-[#1877F2]",
    bgColor: "bg-[#1877F2]",
    icon: <FacebookIcon className="w-5 h-5" />,
  },
  twitter: {
    label: "Twitter",
    getShareUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: "text-surface-light",
    hoverColor: "hover:text-surface-light",
    bgColor: "bg-black",
    icon: <TwitterIcon className="w-5 h-5" />,
  },
  line: {
    label: "LINE",
    getShareUrl: (url) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
    color: "text-[#06C755]",
    hoverColor: "hover:text-[#06C755]",
    bgColor: "bg-[#06C755]",
    icon: <LineIcon className="w-5 h-5" />,
  },
  copy: {
    label: "คัดลอกลิงก์",
    getShareUrl: () => null,
    color: "text-muted",
    hoverColor: "hover:text-primary",
    bgColor: "bg-dark-lighter",
    icon: <LinkIcon className="w-5 h-5" />,
  },
};

export function ShareButtons({
  url,
  title,
  platforms = ["facebook", "twitter", "line", "copy"],
  variant = "icon",
  className,
  buttonClassName,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(
    (platform: SharePlatform) => {
      const config = PLATFORM_CONFIG[platform];
      const shareUrl = config.getShareUrl(url, title);

      if (shareUrl) {
        window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer");
      }
    },
    [url, title]
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [url]);

  if (variant === "button") {
    return (
      <div className={cn("flex flex-wrap gap-3", className)}>
        {platforms.map((platform) => {
          const config = PLATFORM_CONFIG[platform];

          if (platform === "copy") {
            return (
              <button
                key={platform}
                onClick={handleCopyLink}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  copied
                    ? "bg-success text-white"
                    : "bg-dark-lighter text-surface-light hover:bg-dark-light border border-white/10",
                  buttonClassName
                )}
              >
                {copied ? <CheckIcon className="w-5 h-5" /> : config.icon}
                {copied ? "คัดลอกแล้ว!" : config.label}
              </button>
            );
          }

          return (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors",
                config.bgColor,
                "hover:opacity-90",
                buttonClassName
              )}
            >
              {config.icon}
              {config.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Icon variant (default)
  return (
    <div className={cn("flex gap-3", className)}>
      {platforms.map((platform) => {
        const config = PLATFORM_CONFIG[platform];

        if (platform === "copy") {
          return (
            <button
              key={platform}
              onClick={handleCopyLink}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                copied
                  ? "bg-success/20 text-success border border-success/30"
                  : "bg-night/50 border border-white/10 text-muted hover:text-primary hover:bg-primary/10 hover:border-primary/30",
                buttonClassName
              )}
              aria-label={copied ? "คัดลอกแล้ว" : config.label}
              title={copied ? "คัดลอกแล้ว!" : config.label}
            >
              {copied ? <CheckIcon className="w-5 h-5" /> : config.icon}
            </button>
          );
        }

        const shareUrl = config.getShareUrl(url, title);

        return (
          <a
            key={platform}
            href={shareUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "w-11 h-11 rounded-xl bg-night/50 border border-white/10 flex items-center justify-center text-muted transition-all duration-200",
              config.hoverColor,
              platform === "facebook" && "hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30",
              platform === "twitter" && "hover:bg-white/10 hover:border-white/20",
              platform === "line" && "hover:bg-[#06C755]/10 hover:border-[#06C755]/30",
              buttonClassName
            )}
            aria-label={`แชร์ใน ${config.label}`}
            title={`แชร์ใน ${config.label}`}
          >
            {config.icon}
          </a>
        );
      })}
    </div>
  );
}

// Dropdown variant for mobile
export interface ShareDropdownProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareDropdown({ url, title, className }: ShareDropdownProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className={cn("relative group", className)}>
      <button
        className="w-12 h-12 rounded-xl flex items-center justify-center bg-night/50 text-muted hover:text-primary border border-white/10 transition-all duration-200"
        aria-label="แชร์"
      >
        <ShareIcon className="w-5 h-5" />
      </button>

      {/* Dropdown */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="bg-night-lighter border border-white/10 rounded-xl shadow-2xl p-2 min-w-[160px]">
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
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
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
            className="flex items-center gap-3 px-3 py-2.5 text-muted hover:text-[#06C755] hover:bg-[#06C755]/10 rounded-lg transition-all cursor-pointer"
          >
            <LineIcon className="w-5 h-5" />
            <span className="text-sm">LINE</span>
          </a>
          <button
            onClick={handleCopyLink}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer",
              copied
                ? "text-success bg-success/10"
                : "text-muted hover:text-primary hover:bg-primary/10"
            )}
          >
            {copied ? <CheckIcon className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
            <span className="text-sm">{copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Icon Components
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

function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
