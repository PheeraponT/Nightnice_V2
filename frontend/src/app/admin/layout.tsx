"use client";

import { useEffect, useState, useRef, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth, setAuthToastCallback } from "@/hooks/useAuth";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

// Sidebar context for collapse state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

// Navigation items with SVG icons
const navItems = [
  {
    href: "/admin",
    label: "แดชบอร์ด",
    icon: DashboardIcon,
    exact: true,
  },
  {
    href: "/admin/stores",
    label: "จัดการร้าน",
    icon: StoreIcon,
  },
  {
    href: "/admin/events",
    label: "จัดการอีเวนท์",
    icon: EventIcon,
  },
  {
    href: "/admin/provinces",
    label: "จังหวัด",
    icon: LocationIcon,
  },
  {
    href: "/admin/categories",
    label: "ประเภทร้าน",
    icon: CategoryIcon,
  },
  {
    href: "/admin/ads",
    label: "โฆษณา",
    icon: AdIcon,
  },
  {
    href: "/admin/moderation",
    label: "จัดการคำขอ",
    icon: ShieldIcon,
  },
  {
    href: "/admin/contacts",
    label: "ข้อความติดต่อ",
    icon: ContactIcon,
  },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout, getTimeRemaining } = useAuth();
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Update time remaining every minute
  useEffect(() => {
    const updateTime = () => setTimeRemaining(getTimeRemaining());
    updateTime();
    const interval = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  const isActiveLink = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => logout();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-darker border-r border-muted/20 flex flex-col z-40 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-muted/20 bg-darker/80 backdrop-blur-sm">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-xl">🦉</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-gradient whitespace-nowrap">
              Nightnice
            </span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-muted hover:text-surface-light hover:bg-white/5 transition-colors"
          title={isCollapsed ? "ขยาย" : "ย่อ"}
        >
          <CollapseIcon className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted hover:text-surface-light hover:bg-white/5"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                  {!isCollapsed && (
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-muted/20 bg-darker/50">
        {!isCollapsed ? (
          <>
            {/* User Info */}
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-light truncate">
                    {user?.username || "Admin"}
                  </p>
                  <p className="text-xs text-muted">ผู้ดูแลระบบ</p>
                </div>
              </div>
              {/* Session expiration */}
              {timeRemaining && (
                <div className="mt-2 px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs text-amber-400">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>หมดอายุใน {timeRemaining}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-surface-light hover:bg-white/5 transition-colors"
              >
                <ExternalIcon className="w-4 h-4" />
                <span>กลับไปหน้าเว็บ</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogoutIcon className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              className="p-2 rounded-xl text-muted hover:text-surface-light hover:bg-white/5 transition-colors"
              title="กลับไปหน้าเว็บ"
            >
              <ExternalIcon className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              title="ออกจากระบบ"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function AdminContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { isCollapsed } = useContext(SidebarContext);
  const redirectingRef = useRef(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace("/admin/login");
    }
    if (isAuthenticated) {
      redirectingRef.current = false;
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Login page doesn't have sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <AdminSidebar />
      {/* Main Content - offset by sidebar width */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          isCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-dark/80 backdrop-blur-sm border-b border-muted/10 flex items-center px-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted">Admin</span>
            <span className="text-muted/50">/</span>
            <span className="text-surface-light font-medium">
              {getPageTitle(pathname)}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Get page title from pathname
function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "แดชบอร์ด";
  if (pathname.startsWith("/admin/stores")) return "จัดการร้าน";
  if (pathname.startsWith("/admin/events")) return "จัดการอีเวนท์";
  if (pathname.startsWith("/admin/provinces")) return "จังหวัด";
  if (pathname.startsWith("/admin/categories")) return "ประเภทร้าน";
  if (pathname.startsWith("/admin/ads")) return "โฆษณา";
  if (pathname.startsWith("/admin/contacts")) return "ข้อความติดต่อ";
  return "Admin";
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Component to connect Toast to Auth
function AuthToastConnector() {
  const { showToast } = useToast();

  useEffect(() => {
    setAuthToastCallback(showToast);
    return () => setAuthToastCallback(null);
  }, [showToast]);

  return null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthToastConnector />
        <SidebarProvider>
          <AdminContent>{children}</AdminContent>
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

// Icon Components
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
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

function EventIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CategoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function AdIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22s-7-3.5-7-9.5V5l7-3 7 3v7.5c0 6-7 9.5-7 9.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ContactIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function CollapseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
