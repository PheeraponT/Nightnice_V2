"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { api, type ManagedEntityType } from "@/lib/api";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { getIdToken } from "@/lib/firebase";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type ProposalField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "date";
};

interface EntityProposalTriggerProps {
  entityType: ManagedEntityType;
}

export function EntityProposalTrigger({ entityType }: EntityProposalTriggerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signInWithGoogle } = useFirebaseAuth();
  const { showToast } = useToast();

  const fieldPresets = useMemo<ProposalField[]>(() => {
    if (entityType === "Event") {
      return [
        { key: "store_name", label: "ชื่อร้าน/สถานที่จัด", placeholder: "Nightnice Bar" },
        { key: "province", label: "จังหวัด", placeholder: "กรุงเทพมหานคร" },
        { key: "date", label: "วันที่จัด", type: "date" },
        { key: "start_time", label: "เวลาเริ่ม", placeholder: "20:00" },
        { key: "details", label: "รายละเอียดไลน์อัป / โปรโมชั่น", type: "textarea", placeholder: "DJ / Live band / โปร..." },
        { key: "contact", label: "ช่องทางติดต่อผู้จัด", placeholder: "@line / facebook / โทร" },
      ];
    }
    return [
      { key: "province", label: "จังหวัด", placeholder: "เชียงใหม่" },
      { key: "address", label: "ที่ตั้ง (ย่าน/ซอย)", placeholder: "นิมมาน ซอย 10" },
      { key: "style", label: "แนวร้าน / จุดเด่น", type: "textarea", placeholder: "Neon bar, craft cocktail..." },
      { key: "contact", label: "เบอร์ / LINE / เพจ", placeholder: "081-xxx-xxxx" },
      { key: "hours", label: "เวลาเปิด-ปิด", placeholder: "19:00-02:00" },
    ];
  }, [entityType]);

  const ensureAuth = async () => {
    if (!user) {
      showToast("กรุณาเข้าสู่ระบบก่อนเสนอรายการใหม่", "error");
      await signInWithGoogle();
      return null;
    }
    const token = await getIdToken();
    if (!token) {
      showToast("ไม่พบโทเค็นผู้ใช้", "error");
      return null;
    }
    return token;
  };

  const handleSubmit = async () => {
    const token = await ensureAuth();
    if (!token) return;

    if (!name.trim()) {
      showToast("กรุณากรอกชื่อให้ครบถ้วน", "error");
      return;
    }

    const fields = Object.fromEntries(
      Object.entries(fieldValues).filter(([, value]) => value && value.trim() !== "")
    );

    try {
      setIsSubmitting(true);
      await api.moderation.submitProposal(token, {
        entityType,
        name: name.trim(),
        fields,
        referenceUrl: referenceUrl || undefined,
      });
      showToast("ส่งคำเสนอแล้ว ทีมงานจะตรวจสอบก่อนเผยแพร่", "success");
      setName("");
      setReferenceUrl("");
      setFieldValues({});
      setOpen(false);
    } catch (error) {
      console.error(error);
      showToast("ส่งคำเสนอไม่สำเร็จ ลองใหม่ภายหลัง", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = entityType === "Event" ? "เสนออีเวนท์ใหม่" : "เสนอร้านใหม่";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors",
          entityType === "Event"
            ? "bg-accent/15 text-accent-light border border-accent/40 hover:bg-accent/25"
            : "bg-primary/15 text-primary-light border border-primary/40 hover:bg-primary/25"
        )}
      >
        {title}
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl bg-night-lighter/95 border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display text-surface-light">{title}</h3>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-surface-light transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted block mb-1">ชื่อ{entityType === "Event" ? "อีเวนท์" : "ร้าน"}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-night/60 border border-white/10 px-4 py-2.5 text-sm text-surface-light focus:outline-none focus:border-primary/40"
                  placeholder={entityType === "Event" ? "NEON PULSE x DJ XYZ" : "Nightnice Hideout"}
                />
              </div>

              {fieldPresets.map((field) => (
                <div key={field.key}>
                  <label className="text-sm text-muted block mb-1">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={fieldValues[field.key] || ""}
                      onChange={(e) =>
                        setFieldValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl bg-night/60 border border-white/10 px-4 py-2.5 text-sm text-surface-light focus:outline-none focus:border-primary/40 min-h-[100px]"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      type={field.type === "date" ? "date" : "text"}
                      value={fieldValues[field.key] || ""}
                      onChange={(e) =>
                        setFieldValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl bg-night/60 border border-white/10 px-4 py-2.5 text-sm text-surface-light focus:outline-none focus:border-primary/40"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="text-sm text-muted block mb-1">ลิงก์อ้างอิง (รีวิว, โพสต์, ภาพ)</label>
                <input
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="w-full rounded-2xl bg-night/60 border border-white/10 px-4 py-2.5 text-sm text-surface-light focus:outline-none focus:border-primary/40"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "w-full py-3 rounded-2xl text-sm font-semibold transition-colors",
                  isSubmitting
                    ? "bg-white/10 text-muted cursor-not-allowed"
                    : entityType === "Event"
                      ? "bg-accent text-night hover:bg-accent/90"
                      : "bg-primary text-night hover:bg-primary/90"
                )}
              >
                {isSubmitting ? "กำลังส่ง..." : "ส่งคำเสนอ"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
