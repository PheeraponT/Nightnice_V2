"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { api, type ManagedEntityType } from "@/lib/api";
import { getIdToken } from "@/lib/firebase";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type FieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
};

interface EntityContributionActionsProps {
  entityType: ManagedEntityType;
  entitySlug: string;
  entityName: string;
}

export function EntityContributionActions({
  entityType,
  entitySlug,
  entityName,
}: EntityContributionActionsProps) {
  const [activeModal, setActiveModal] = useState<null | "claim" | "update">(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [claimNotes, setClaimNotes] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [proofMediaUrl, setProofMediaUrl] = useState("");
  const [externalProofUrl, setExternalProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signInWithGoogle } = useFirebaseAuth();
  const { showToast } = useToast();

  const fieldPresets = useMemo<FieldConfig[]>(() => {
    if (entityType === "Event") {
      return [
        { key: "start_time", label: "เวลาเริ่ม", placeholder: "20:00" },
        { key: "end_time", label: "เวลาจบ", placeholder: "02:00" },
        { key: "lineup", label: "ไลน์อัป / Special guest", placeholder: "DJ XX" },
        { key: "ticket_info", label: "รายละเอียดตั๋วหรือโปรโมชั่น", placeholder: "Early bird ฿399" },
      ];
    }
    return [
      { key: "open_time", label: "เวลาเปิด", placeholder: "19:00" },
      { key: "close_time", label: "เวลาปิด", placeholder: "02:00" },
      { key: "promotion", label: "โปรโมชั่นล่าสุด", placeholder: "Happy Hour 20:00-22:00" },
      { key: "contact", label: "เบอร์ติดต่อ / LINE", placeholder: "081-xxx-xxxx" },
    ];
  }, [entityType]);

  useEffect(() => {
    setFieldValues(
      fieldPresets.reduce<Record<string, string>>((acc, field) => {
        acc[field.key] = "";
        return acc;
      }, {})
    );
  }, [fieldPresets]);

  const ensureAuth = async () => {
    if (!user) {
      showToast("กรุณาเข้าสู่ระบบก่อนส่งคำขอ", "error");
      await signInWithGoogle();
      return null;
    }
    const token = await getIdToken();
    if (!token) {
      showToast("ไม่พบโทเค็นผู้ใช้", "error");
    }
    return token;
  };

  const handleSubmitClaim = async () => {
    const token = await ensureAuth();
    if (!token) return;

    try {
      setIsSubmitting(true);
      await api.moderation.submitClaim(token, {
        entityType,
        entitySlug,
        evidenceUrl: evidenceUrl || undefined,
        notes: claimNotes || undefined,
      });
      showToast("ส่งคำขอรับสิทธิ์แล้ว ทีมงานจะตรวจสอบภายใน 48 ชม.", "success");
      setEvidenceUrl("");
      setClaimNotes("");
      setActiveModal(null);
    } catch (error) {
      console.error(error);
      showToast("ส่งคำขอไม่สำเร็จ ลองอีกครั้ง", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUpdate = async () => {
    const token = await ensureAuth();
    if (!token) return;

    const payload = Object.fromEntries(
      Object.entries(fieldValues).filter(([, value]) => value && value.trim() !== "")
    );

    if (Object.keys(payload).length === 0) {
      showToast("กรุณากรอกอย่างน้อย 1 รายการ", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.moderation.submitUpdate(token, {
        entityType,
        entitySlug,
        fields: payload,
        proofMediaUrl: proofMediaUrl || undefined,
        externalProofUrl: externalProofUrl || undefined,
      });
      showToast("ส่งข้อมูลอัปเดตแล้ว ขอบคุณที่ช่วยให้ข้อมูลสดใหม่!", "success");
      setFieldValues(fieldPresets.reduce<Record<string, string>>((acc, field) => ({ ...acc, [field.key]: "" }), {}));
      setProofMediaUrl("");
      setExternalProofUrl("");
      setActiveModal(null);
    } catch (error) {
      console.error(error);
      showToast("ส่งข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => setActiveModal("claim")}
          className="px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary-light text-sm font-semibold hover:bg-primary/20 transition-colors"
        >
          เจ้าของร้าน/งาน? Claim เลย
        </button>
        <button
          onClick={() => setActiveModal("update")}
          className="px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent-light text-sm font-semibold hover:bg-accent/20 transition-colors"
        >
          แจ้งข้อมูลไม่ตรง
        </button>
      </div>

      {activeModal === "claim" && (
        <Modal title={`ขอสิทธิ์ดูแล${entityType === "Event" ? "อีเวนท์" : "ร้าน"}`} onClose={() => setActiveModal(null)}>
          <p className="text-sm text-muted mb-4">
            ส่งคำขอเพื่อยืนยันว่าเป็นผู้ดูแล {entityName}. ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted block mb-1">ลิงก์หลักฐาน (เช่น ใบอนุญาต, โพสต์ทางการ)</label>
              <input
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full rounded-2xl bg-night/40 border border-white/10 px-4 py-2.5 text-sm text-surface-light focus:outline-none focus:border-primary/50"
                placeholder="https://"
              />
            </div>
            <div>
              <label className="text-sm text-muted block mb-1">รายละเอียดเพิ่มเติม</label>
              <textarea
                value={claimNotes}
                onChange={(e) => setClaimNotes(e.target.value)}
                className="w-full rounded-2xl bg-night/40 border border-white/10 px-4 py-2.5 text-sm text-surface-light focus:outline-none focus:border-primary/50 min-h-[100px]"
                placeholder="ชื่อผู้ดูแล ช่องทางติดต่อ ฯลฯ"
              />
            </div>
            <button
              onClick={handleSubmitClaim}
              disabled={isSubmitting}
              className={cn(
                "w-full py-3 rounded-2xl text-sm font-semibold transition-colors",
                isSubmitting ? "bg-primary/30 text-muted cursor-not-allowed" : "bg-primary text-night hover:bg-primary/90"
              )}
            >
              {isSubmitting ? "กำลังส่ง..." : "ส่งคำขอ"}
            </button>
          </div>
        </Modal>
      )}

      {activeModal === "update" && (
        <Modal title="ส่งข้อมูลล่าสุด" onClose={() => setActiveModal(null)}>
          <p className="text-sm text-muted mb-4">ช่วยแจ้งข้อมูลล่าสุดเกี่ยวกับ {entityName} เพื่อให้ชุมชนได้รับข้อมูลที่แม่นยำ</p>
          <div className="space-y-4">
            {fieldPresets.map((field) => (
              <div key={field.key}>
                <label className="text-sm text-muted block mb-1">{field.label}</label>
                <input
                  value={fieldValues[field.key] || ""}
                  onChange={(e) =>
                    setFieldValues((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl bg-night/40 border border-white/10 px-4 py-2.5 text-sm text-surface-light focus:outline-none focus:border-accent/40"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted block mb-1">ลิงก์สลิป/ใบเสร็จ/รูปประกอบ</label>
                <input
                  value={proofMediaUrl}
                  onChange={(e) => setProofMediaUrl(e.target.value)}
                  className="w-full rounded-2xl bg-night/40 border border-white/10 px-4 py-2.5 text-sm text-surface-light focus:outline-none focus:border-accent/40"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="text-sm text-muted block mb-1">ลิงก์โพสต์โซเชียล (ถ้ามี)</label>
                <input
                  value={externalProofUrl}
                  onChange={(e) => setExternalProofUrl(e.target.value)}
                  className="w-full rounded-2xl bg-night/40 border border-white/10 px-4 py-2.5 text-sm text-surface-light focus:outline-none focus:border-accent/40"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
            <button
              onClick={handleSubmitUpdate}
              disabled={isSubmitting}
              className={cn(
                "w-full py-3 rounded-2xl text-sm font-semibold transition-colors",
                isSubmitting ? "bg-accent/20 text-muted cursor-not-allowed" : "bg-accent text-night hover:bg-accent/90"
              )}
            >
              {isSubmitting ? "กำลังส่ง..." : "ส่งข้อมูลล่าสุด"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-night-lighter/90 border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display text-surface-light">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-surface-light transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
