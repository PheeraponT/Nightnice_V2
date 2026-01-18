"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// Admin dashboard page
export default function AdminDashboardPage() {
  const { user } = useAuth();

  const quickLinks = [
    {
      href: "/admin/stores",
      title: "จัดการร้าน",
      description: "เพิ่ม แก้ไข ลบร้านค้า",
      icon: "🏪",
    },
    {
      href: "/admin/stores/new",
      title: "เพิ่มร้านใหม่",
      description: "สร้างร้านค้าใหม่ในระบบ",
      icon: "➕",
    },
    {
      href: "/admin/provinces",
      title: "จัดการจังหวัด",
      description: "แก้ไขข้อมูล SEO จังหวัด",
      icon: "🗺️",
    },
    {
      href: "/admin/categories",
      title: "จัดการประเภทร้าน",
      description: "เพิ่ม แก้ไข ลบประเภทร้าน",
      icon: "📁",
    },
    {
      href: "/admin/ads",
      title: "โฆษณา",
      description: "จัดการโฆษณาและแคมเปญ",
      icon: "📢",
    },
    {
      href: "/admin/contacts",
      title: "ข้อความติดต่อ",
      description: "ดูข้อความจากผู้ใช้",
      icon: "📧",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-light mb-2">
          ยินดีต้อนรับ, {user?.username}
        </h1>
        <p className="text-muted">จัดการเว็บไซต์ Nightnice Thailand</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="p-6 bg-darker rounded-xl border border-muted/20 hover:border-primary/30 transition-colors group"
          >
            <div className="text-3xl mb-3">{link.icon}</div>
            <h3 className="font-semibold text-surface-light group-hover:text-primary transition-colors">
              {link.title}
            </h3>
            <p className="text-sm text-muted mt-1">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
