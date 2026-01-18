import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-darker">
      <div className="text-center px-4">
        <div className="mb-6">
          <svg
            className="mx-auto w-24 h-24 text-muted/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-surface-light mb-3">
          ไม่พบร้านที่ค้นหา
        </h1>
        <p className="text-muted mb-8 max-w-md mx-auto">
          ร้านที่คุณกำลังค้นหาอาจถูกลบหรือย้ายไปแล้ว กรุณาลองค้นหาร้านอื่น
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>กลับหน้าแรก</span>
          </Link>
          <Link
            href="/stores"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-lighter border border-muted/30 text-surface-light font-medium rounded-xl hover:bg-muted/10 transition-colors"
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
            <span>ค้นหาร้านอื่น</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
