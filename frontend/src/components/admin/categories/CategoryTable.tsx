"use client";

import type { AdminCategoryDto } from "@/lib/api";

interface CategoryTableProps {
  categories: AdminCategoryDto[];
  onEdit: (category: AdminCategoryDto) => void;
  onDelete: (category: AdminCategoryDto) => void;
}

// T134: Category table component
export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="bg-darker rounded-xl border border-muted/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-muted/20 bg-dark/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">ลำดับ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">ประเภทร้าน</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">จำนวนร้าน</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/10">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-dark/30 transition-colors">
                <td className="px-4 py-3 text-sm text-muted">{category.sortOrder}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-surface-light">
                    {category.iconEmoji && `${category.iconEmoji} `}
                    {category.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted">{category.slug}</td>
                <td className="px-4 py-3 text-sm text-surface-light">{category.storeCount}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => onEdit(category)}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    disabled={category.storeCount > 0}
                    className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    title={category.storeCount > 0 ? "ไม่สามารถลบประเภทที่มีร้านค้าอยู่" : ""}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  ยังไม่มีประเภทร้าน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
