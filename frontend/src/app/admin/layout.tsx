"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// T118: Admin layout with sidebar

function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/admin", label: "แดชบอร์ด", icon: "🏠" },
    { href: "/admin/stores", label: "จัดการร้าน", icon: "🏪" },
    { href: "/admin/provinces", label: "จังหวัด", icon: "📍" },
    { href: "/admin/categories", label: "ประเภทร้าน", icon: "📁" },
    { href: "/admin/ads", label: "โฆษณา", icon: "📢" },
    { href: "/admin/contacts", label: "ข้อความติดต่อ", icon: "📧" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-darker border-r border-muted/20 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-muted/20">
        <Link href="/admin" className="text-xl font-bold text-gradient">
          Nightnice Admin
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:text-surface-light hover:bg-muted/10"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info & logout */}
      <div className="p-4 border-t border-muted/20">
        <div className="text-sm text-muted mb-2">
          เข้าสู่ระบบเป็น: <span className="text-surface-light">{user?.username}</span>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          ออกจากระบบ
        </button>
        <Link
          href="/"
          className="mt-2 block w-full px-4 py-2 text-sm text-center text-muted hover:text-surface-light hover:bg-muted/10 rounded-lg transition-colors"
        >
          กลับไปหน้าเว็บ →
        </Link>
      </div>
    </aside>
  );
}

function AdminContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Login page doesn't have sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted">กำลังโหลด...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-dark">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminContent>{children}</AdminContent>
    </AuthProvider>
  );
}
