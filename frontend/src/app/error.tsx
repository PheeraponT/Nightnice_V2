"use client";

import { useEffect } from "react";
import Link from "next/link";

// T165: Error boundary for root pages
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-darker flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-surface-light mb-2">
          เกิดข้อผิดพลาด
        </h1>
        <p className="text-muted mb-6">
          ขออภัย เกิดข้อผิดพลาดในการโหลดหน้านี้ กรุณาลองใหม่อีกครั้ง
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            ลองใหม่
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-dark border border-muted/30 text-surface-light font-medium rounded-xl hover:bg-muted/10 transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
