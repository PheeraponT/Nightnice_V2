"use client";

import { useState, type FormEvent } from "react";
import { useContactForm } from "@/hooks/useContactForm";

interface ContactFormProps {
  selectedPackage?: string;
  onSuccess?: () => void;
}

// T092: Contact form with validation
export function ContactForm({ selectedPackage, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: selectedPackage ? "advertising" : "general",
    message: "",
    storeName: "",
    packageInterest: selectedPackage || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const { mutate: submitForm, isPending } = useContactForm();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อ";
    }

    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (formData.phone && !/^[0-9-+() ]+$/.test(formData.phone)) {
      newErrors.phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
    }

    if (!formData.message.trim()) {
      newErrors.message = "กรุณากรอกข้อความ";
    } else if (formData.message.length > 2000) {
      newErrors.message = "ข้อความต้องไม่เกิน 2000 ตัวอักษร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validate()) return;

    submitForm(
      {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        inquiryType: formData.inquiryType,
        message: formData.message.trim(),
        storeName: formData.storeName.trim() || undefined,
        packageInterest: formData.packageInterest || undefined,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            setSuccessMessage(response.message);
            setFormData({
              name: "",
              email: "",
              phone: "",
              inquiryType: "general",
              message: "",
              storeName: "",
              packageInterest: "",
            });
            onSuccess?.();
          } else {
            setErrors({ form: response.message });
          }
        },
        onError: () => {
          setErrors({ form: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
        },
      }
    );
  };

  const inquiryTypes = [
    { value: "advertising", label: "สนใจลงโฆษณา" },
    { value: "partnership", label: "พาร์ทเนอร์ชิพ" },
    { value: "support", label: "ขอความช่วยเหลือ" },
    { value: "general", label: "อื่นๆ" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
          {successMessage}
        </div>
      )}

      {/* Form Error */}
      {errors.form && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {errors.form}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-surface-light mb-1.5">
          ชื่อ-นามสกุล <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.name ? "border-red-500" : "border-muted/30"
          }`}
          placeholder="กรุณากรอกชื่อ"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-surface-light mb-1.5">
          อีเมล <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.email ? "border-red-500" : "border-muted/30"
          }`}
          placeholder="example@email.com"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-surface-light mb-1.5">
          เบอร์โทรศัพท์
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.phone ? "border-red-500" : "border-muted/30"
          }`}
          placeholder="08X-XXX-XXXX"
        />
        {errors.phone && (
          <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Inquiry Type */}
      <div>
        <label className="block text-sm font-medium text-surface-light mb-1.5">
          ประเภทการติดต่อ <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.inquiryType}
          onChange={(e) =>
            setFormData({ ...formData, inquiryType: e.target.value })
          }
          className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {inquiryTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Store Name (for advertising inquiries) */}
      {formData.inquiryType === "advertising" && (
        <div>
          <label className="block text-sm font-medium text-surface-light mb-1.5">
            ชื่อร้าน
          </label>
          <input
            type="text"
            value={formData.storeName}
            onChange={(e) =>
              setFormData({ ...formData, storeName: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="ชื่อร้านของคุณ"
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-surface-light mb-1.5">
          ข้อความ <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          rows={5}
          className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
            errors.message ? "border-red-500" : "border-muted/30"
          }`}
          placeholder="รายละเอียดที่ต้องการติดต่อ..."
        />
        {errors.message && (
          <p className="text-red-400 text-sm mt-1">{errors.message}</p>
        )}
        <p className="text-muted text-xs mt-1 text-right">
          {formData.message.length}/2000
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "กำลังส่ง..." : "ส่งข้อความ"}
      </button>
    </form>
  );
}
