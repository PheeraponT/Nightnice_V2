import Link from "next/link";

// T165: 404 Not Found page
export default function NotFound() {
  return (
    <div className="min-h-screen bg-darker flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold text-surface-light mb-2">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="text-muted mb-6">
          หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
