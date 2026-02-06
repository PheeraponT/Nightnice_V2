"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ManagedEntityType, type AdminEntityClaimDto, type AdminEntityUpdateRequestDto, type AdminEntityProposalDto } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type TabKey = "claims" | "updates" | "proposals";

const TAB_CONFIG: Record<TabKey, { label: string; decisionLabels: { approve: string; reject: string }; statusOptions: string[] }> = {
  claims: {
    label: "คำขอสิทธิ์ดูแล",
    decisionLabels: { approve: "อนุมัติ", reject: "ปฏิเสธ" },
    statusOptions: ["Pending", "Approved", "Rejected"],
  },
  updates: {
    label: "แจ้งอัปเดตข้อมูล",
    decisionLabels: { approve: "ยืนยันแล้ว", reject: "ปฏิเสธ" },
    statusOptions: ["Pending", "Accepted", "Rejected"],
  },
  proposals: {
    label: "คำเสนอร้าน/อีเวนท์ใหม่",
    decisionLabels: { approve: "เผยแพร่", reject: "ปฏิเสธ" },
    statusOptions: ["Pending", "Approved", "Rejected"],
  },
};

const ENTITY_FILTERS: { label: string; value?: ManagedEntityType }[] = [
  { label: "ทั้งหมด" },
  { label: "ร้าน", value: "Store" },
  { label: "อีเวนท์", value: "Event" },
];

export default function AdminModerationPage() {
  const { getToken } = useAuth();
  const token = getToken();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>("claims");
  const [entityFilter, setEntityFilter] = useState<ManagedEntityType | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("Pending");

  useEffect(() => {
    setStatusFilter(TAB_CONFIG[activeTab].statusOptions[0]);
    setEntityFilter(undefined);
  }, [activeTab]);

  const moderationQuery = useQuery({
    queryKey: ["admin-moderation", activeTab, entityFilter, statusFilter],
    enabled: Boolean(token),
    queryFn: () => {
      if (!token) throw new Error("missing token");
      const params = {
        entityType: entityFilter,
        status: statusFilter,
        page: 1,
        pageSize: 25,
      };
      if (activeTab === "claims") {
        return api.admin.getModerationClaims(token, params);
      }
      if (activeTab === "updates") {
        return api.admin.getModerationUpdates(token, params);
      }
      return api.admin.getModerationProposals(token, params);
    },
  });

  const decisionMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "Approved" | "Rejected" | "Accepted" }) => {
      if (!token) throw new Error("missing token");
      if (activeTab === "claims") {
        if (decision === "Accepted") throw new Error("invalid decision");
        return api.admin.decideClaim(token, id, decision as "Approved" | "Rejected");
      }
      if (activeTab === "updates") {
        const mapped = decision === "Approved" ? "Accepted" : "Rejected";
        return api.admin.decideUpdateRequest(token, id, mapped as "Accepted" | "Rejected");
      }
      if (decision === "Accepted") throw new Error("invalid decision");
      return api.admin.decideProposal(token, id, decision as "Approved" | "Rejected");
    },
    onSuccess: () => {
      showToast("อัปเดตสถานะแล้ว", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-moderation"] });
    },
    onError: () => showToast("อัปเดตไม่สำเร็จ", "error"),
  });

  const records = moderationQuery.data?.items ?? [];
  const isLoading = moderationQuery.isLoading || moderationQuery.isRefetching;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-night/80 via-night/50 to-darker p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.4em] text-primary-light">Moderation Center</p>
        <h1 className="mt-2 text-3xl font-display font-semibold text-surface-light">
          จัดการคำขอจากชุมชน
        </h1>
        <p className="text-sm text-muted max-w-2xl mt-1">
          ตรวจสอบคำขอสิทธิ์ดูแล แจ้งข้อมูลไม่ตรง และข้อเสนอร้าน/อีเวนท์ใหม่
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {(Object.keys(TAB_CONFIG) as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200",
              activeTab === tab ? "bg-primary/20 border-primary/40 text-primary-light shadow-glow-blue" : "bg-night/50 border-white/10 text-muted hover:text-surface-light"
            )}
          >
            {TAB_CONFIG[tab].label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-[0.3em] text-muted">ประเภท</span>
          {ENTITY_FILTERS.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setEntityFilter(filter.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition",
                entityFilter === filter.value
                  ? "bg-accent/20 border-accent/40 text-accent-light"
                  : "border-white/10 text-muted hover:text-surface-light"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-[0.3em] text-muted">สถานะ</span>
          {TAB_CONFIG[activeTab].statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition",
                statusFilter === status
                  ? "bg-primary/20 border-primary/40 text-primary-light"
                  : "border-white/10 text-muted hover:text-surface-light"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <section className="rounded-2xl border border-white/10 bg-night/60 p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 w-full rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-muted">ไม่มีรายการในสถานะนี้</div>
        ) : (
          records.map((record) => (
            <ModerationCard
              key={(record as any).id}
              tab={activeTab}
              record={record}
              onDecision={(decision) =>
                decisionMutation.mutate({ id: (record as any).id, decision })
              }
              disableActions={decisionMutation.isLoading}
            />
          ))
        )}
      </section>
    </div>
  );
}

type ModerationCardProps =
  | {
      tab: "claims";
      record: AdminEntityClaimDto;
      onDecision: (decision: "Approved" | "Rejected") => void;
      disableActions: boolean;
    }
  | {
      tab: "updates";
      record: AdminEntityUpdateRequestDto;
      onDecision: (decision: "Approved" | "Rejected") => void;
      disableActions: boolean;
    }
  | {
      tab: "proposals";
      record: AdminEntityProposalDto;
      onDecision: (decision: "Approved" | "Rejected") => void;
      disableActions: boolean;
    };

function ModerationCard({ tab, record, onDecision, disableActions }: ModerationCardProps) {
  const statusLabel =
    tab === "updates" && record.status === "Accepted" ? "Approved" : record.status;
  const isPending = record.status === "Pending";

  return (
    <article className="rounded-2xl border border-white/10 bg-night/70 p-4 shadow-card">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-1">
            {tab === "claims" ? "คำขอสิทธิ์" : tab === "updates" ? "แจ้งอัปเดต" : "คำเสนอรายการใหม่"}
          </p>
          <h3 className="text-lg font-semibold text-surface-light">
            {tab === "claims"
              ? record.entityName || "ไม่พบชื่อร้าน/อีเวนท์"
              : tab === "updates"
              ? record.entityName || "ไม่พบชื่อ"
              : record.name}
          </h3>
          <p className="text-sm text-muted">
            {tab === "proposals"
              ? `ประเภท: ${record.entityType}`
              : `โดย ${"submittedByName" in record ? record.submittedByName : (record as AdminEntityClaimDto).requestedByName}`}
          </p>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "inline-flex px-3 py-1 rounded-full text-xs font-semibold border",
              statusLabel === "Pending"
                ? "border-amber-400/30 text-amber-300 bg-amber-500/10"
                : statusLabel === "Approved" || statusLabel === "Accepted"
                  ? "border-success/30 text-success bg-success/10"
                  : "border-red-400/30 text-red-300 bg-red-500/10"
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Payload / Details */}
      <div className="mt-4 space-y-3 text-sm text-muted">
        {tab !== "proposals" && "entitySlug" in record && record.entitySlug && (
          <p>
            <span className="text-surface-light">Slug:</span> {record.entitySlug}
          </p>
        )}
        {tab === "claims" && (record as AdminEntityClaimDto).evidenceUrl && (
          <p>
            <span className="text-surface-light">หลักฐาน:</span>{" "}
            <a href={(record as AdminEntityClaimDto).evidenceUrl} target="_blank" className="text-primary-light underline">
              {(record as AdminEntityClaimDto).evidenceUrl}
            </a>
          </p>
        )}
        {tab === "updates" && (
          <>
            {(record as AdminEntityUpdateRequestDto).proofMediaUrl && (
              <p>
                <span className="text-surface-light">ลิงก์สลิป/รูป:</span>{" "}
                <a href={(record as AdminEntityUpdateRequestDto).proofMediaUrl} target="_blank" className="text-primary-light underline">
                  {(record as AdminEntityUpdateRequestDto).proofMediaUrl}
                </a>
              </p>
            )}
            {(record as AdminEntityUpdateRequestDto).externalProofUrl && (
              <p>
                <span className="text-surface-light">โพสต์โซเชียล:</span>{" "}
                <a href={(record as AdminEntityUpdateRequestDto).externalProofUrl} target="_blank" className="text-primary-light underline">
                  {(record as AdminEntityUpdateRequestDto).externalProofUrl}
                </a>
              </p>
            )}
          </>
        )}
        {tab === "proposals" && (record as AdminEntityProposalDto).referenceUrl && (
          <p>
            <span className="text-surface-light">แหล่งอ้างอิง:</span>{" "}
            <a href={(record as AdminEntityProposalDto).referenceUrl} target="_blank" className="text-primary-light underline">
              {(record as AdminEntityProposalDto).referenceUrl}
            </a>
          </p>
        )}
        <PayloadViewer payloadJson={"payloadJson" in record ? record.payloadJson : JSON.stringify({ notes: (record as AdminEntityClaimDto).notes })} />
      </div>

      {isPending && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => onDecision("Approved")}
            disabled={disableActions}
            className="px-4 py-2 rounded-xl bg-success/20 text-success border border-success/40 text-sm font-semibold hover:bg-success/30 disabled:opacity-50"
          >
            {TAB_CONFIG[tab].decisionLabels.approve}
          </button>
          <button
            onClick={() => onDecision("Rejected")}
            disabled={disableActions}
            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-sm font-semibold hover:bg-red-500/30 disabled:opacity-50"
          >
            {TAB_CONFIG[tab].decisionLabels.reject}
          </button>
        </div>
      )}
    </article>
  );
}

function PayloadViewer({ payloadJson }: { payloadJson: string }) {
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    parsed = null;
  }

  if (!parsed || Object.keys(parsed).length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-black/20 border border-white/5 p-3 text-xs font-mono text-muted overflow-auto">
      {Object.entries(parsed).map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <span className="text-primary-light">{key}:</span>
          <span>{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
