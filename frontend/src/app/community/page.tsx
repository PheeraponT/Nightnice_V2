"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CommunityPostCard, type CommunityPost } from "@/components/community/CommunityPostCard";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { MOOD_OPTIONS, type MoodId } from "@/lib/mood";
import { cn, resolveImageUrl } from "@/lib/utils";
import { api, ApiError, type CommunityPostDto, type StoreListDto } from "@/lib/api";
import { getIdToken } from "@/lib/firebase";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

type ImageSlotStatus = "uploading" | "uploaded" | "error";

type DraftImage = {
  previewUrl: string;
  serverUrl: string;
  alt: string;
  status: ImageSlotStatus;
} | null;

interface DraftPost {
  title: string;
  content: string;
  moodId: MoodId;
  vibeTagIds: string[];
  images: DraftImage[];
}

const VIBE_TAG_OPTIONS = [
  { id: "vinyl-only", label: "Vinyl Only" },
  { id: "bartender-talk", label: "Bartender Talk" },
  { id: "laser-beam", label: "Laser Beam" },
  { id: "rooftop-air", label: "Rooftop Air" },
  { id: "secret-door", label: "Secret Door" },
  { id: "mezcal-journey", label: "Mezcal Journey" },
  { id: "neo-disco", label: "Neo Disco" },
];

const createDefaultDraft = (): DraftPost => ({
  title: "",
  content: "",
  moodId: "chill",
  vibeTagIds: [],
  images: [null, null, null],
});

interface LightboxState {
  images: CommunityPost["images"];
  index: number;
}

export default function CommunityPage() {
  const [selectedMood, setSelectedMood] = useState<"all" | MoodId>("all");
  const [draft, setDraft] = useState<DraftPost>(() => createDefaultDraft());
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [communityFeed, setCommunityFeed] = useState<CommunityPost[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [storeSearchResults, setStoreSearchResults] = useState<StoreListDto[]>([]);
  const [isSearchingStores, setIsSearchingStores] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreListDto | null>(null);
  const [myPostIds, setMyPostIds] = useState<Set<string>>(new Set());
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const { user, loading: authLoading, signInWithGoogle } = useFirebaseAuth();
  const { showToast } = useToast();

  const filteredPosts = useMemo(() => {
    if (selectedMood === "all") return communityFeed;
    return communityFeed.filter((post) => post.moodId === selectedMood);
  }, [selectedMood, communityFeed]);

  const heroStats = useMemo(
    () => [
      { label: "โพสต์ล่าสุด", value: communityFeed.length.toString(), hint: "อัปเดตในรอบสัปดาห์" },
      { label: "Mood tags", value: "18", hint: "กำลังถูกใช้งาน" },
      { label: "สมาชิกที่ติดตาม", value: "1.2K", hint: "กำลังรอเปิดเต็มรูปแบบ" },
    ],
    [communityFeed.length]
  );

  const fetchCommunityPosts = useCallback(
    async (mood: "all" | MoodId) => {
      setIsFeedLoading(true);
      try {
        const response = await api.public.getCommunityPosts({
          moodId: mood === "all" ? undefined : mood,
          pageSize: 8,
        });
        if (response.items.length === 0) {
          setCommunityFeed([]);
        } else {
          setCommunityFeed(response.items.map(mapCommunityPostDto));
        }
        setFeedError(null);
      } catch (error) {
        console.error("Failed to load community posts", error);
        setFeedError("โหลดโพสต์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        setCommunityFeed([]);
      } finally {
        setIsFeedLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCommunityPosts(selectedMood);
  }, [fetchCommunityPosts, selectedMood]);

  useEffect(() => {
    if (!user) {
      setMyPostIds(new Set());
      return;
    }
    (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const posts = await api.user.getMyCommunityPosts(token, 50);
        setMyPostIds(new Set(posts.map((p) => p.id)));
      } catch {
        // silent — not critical
      }
    })();
  }, [user]);

  useEffect(() => {
    if (storeSearchQuery.trim().length < 2) {
      setStoreSearchResults([]);
      return;
    }

    let isActive = true;
    setIsSearchingStores(true);
    const controller = new AbortController();

    (async () => {
      try {
        const results = await api.public.getStores({
          q: storeSearchQuery.trim(),
          pageSize: 5,
        });
        if (isActive) {
          setStoreSearchResults(results.items);
        }
      } catch (error) {
        console.error("Store search failed", error);
        if (isActive) {
          setStoreSearchResults([]);
        }
      } finally {
        if (isActive) {
          setIsSearchingStores(false);
        }
      }
    })();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [storeSearchQuery]);

  const handleDraftChange = (field: keyof DraftPost, value: string | MoodId | string[]) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleVibe = (tagId: string) => {
    setDraft((prev) => {
      const exists = prev.vibeTagIds.includes(tagId);
      let nextTags = exists
        ? prev.vibeTagIds.filter((id) => id !== tagId)
        : [...prev.vibeTagIds, tagId];
      if (nextTags.length > 3) {
        nextTags = nextTags.slice(nextTags.length - 3);
      }
      return { ...prev, vibeTagIds: nextTags };
    });
  };

  const imageInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleImageSlotClick = (index: number) => {
    imageInputRefs[index].current?.click();
  };

  const handleImageFileChange = async (index: number, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("รองรับเฉพาะ JPEG, PNG, WebP", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("ไฟล์ต้องมีขนาดไม่เกิน 5MB", "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setDraft((prev) => {
      const nextImages = [...prev.images];
      nextImages[index] = { previewUrl, serverUrl: "", alt: `รูปภาพ ${index + 1}`, status: "uploading" };
      return { ...prev, images: nextImages };
    });

    try {
      const token = await getIdToken();
      if (!token) {
        showToast("กรุณาเข้าสู่ระบบก่อนอัปโหลด", "error");
        setDraft((prev) => {
          const nextImages = [...prev.images];
          nextImages[index] = null;
          return { ...prev, images: nextImages };
        });
        URL.revokeObjectURL(previewUrl);
        return;
      }

      const result = await api.public.uploadCommunityPostImage(file, token);

      setDraft((prev) => {
        const nextImages = [...prev.images];
        nextImages[index] = { previewUrl, serverUrl: result.imageUrl, alt: `รูปภาพ ${index + 1}`, status: "uploaded" };
        return { ...prev, images: nextImages };
      });
    } catch (error) {
      console.error("Upload failed", error);
      showToast("อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง", "error");
      setDraft((prev) => {
        const nextImages = [...prev.images];
        nextImages[index] = { previewUrl, serverUrl: "", alt: `รูปภาพ ${index + 1}`, status: "error" };
        return { ...prev, images: nextImages };
      });
    }
  };

  const handleSelectStore = (store: StoreListDto) => {
    setSelectedStore(store);
    setStoreSearchQuery(store.name);
    setStoreSearchResults([]);
  };

  const handleClearSelectedStore = () => {
    setSelectedStore(null);
    setStoreSearchQuery("");
    setStoreSearchResults([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isPublishing) return;

    if (!draft.title.trim()) {
      showToast("กรุณาใส่หัวข้อโพสต์", "warning");
      return;
    }

    if (!draft.content.trim()) {
      showToast("เล่า vibe ของคืนนี้อีกนิดได้ไหม", "warning");
      return;
    }

    if (draft.images.some((img) => img?.status === "uploading")) {
      showToast("กรุณารอให้รูปอัปโหลดเสร็จก่อน", "warning");
      return;
    }

    const uploadedImages = draft.images.filter(
      (img): img is Exclude<DraftImage, null> => img !== null && img.status === "uploaded" && img.serverUrl !== ""
    );
    if (uploadedImages.length === 0) {
      showToast("ต้องมีภาพอย่างน้อย 1 ภาพเพื่อเล่าเรื่อง", "warning");
      return;
    }

    if (!editingPostId && !selectedStore) {
      showToast("กรุณาเลือกร้านที่ไป", "warning");
      return;
    }

    if (!user) {
      showToast("กรุณาเข้าสู่ระบบก่อนโพสต์", "warning");
      setIsComposerOpen(false);
      if (!authLoading) {
        void signInWithGoogle();
      }
      return;
    }

    try {
      setIsPublishing(true);
      const token = await getIdToken();
      if (!token) {
        showToast("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง", "error");
        return;
      }

      const imagePayload = uploadedImages.map((image) => ({
        url: image.serverUrl,
        altText: image.alt,
      }));

      if (editingPostId) {
        await api.public.updateCommunityPost(
          editingPostId,
          {
            title: draft.title.trim(),
            summary: draft.content.trim().slice(0, 240),
            story: draft.content.trim(),
            moodId: draft.moodId,
            moodMatch: 90,
            vibeTags: draft.vibeTagIds,
            images: imagePayload,
          },
          token
        );
        showToast("แก้ไขโพสต์เรียบร้อยแล้ว", "success", 3200);
      } else {
        const created = await api.public.createCommunityPost(
          {
            storeId: selectedStore!.id,
            title: draft.title.trim(),
            summary: draft.content.trim().slice(0, 240),
            story: draft.content.trim(),
            moodId: draft.moodId,
            moodMatch: 90,
            vibeTags: draft.vibeTagIds,
            images: imagePayload,
          },
          token
        );
        setMyPostIds((prev) => new Set(prev).add(created.id));
        showToast("โพสต์สร้างเรียบร้อยแล้ว!", "success", 3200);
      }

      await fetchCommunityPosts(selectedMood);
      handleCloseComposer();
    } catch (error) {
      console.error("Create community post error", error);
      if (error instanceof ApiError && error.data && typeof error.data === "object" && "message" in error.data) {
        showToast(String((error.data as { message: string }).message), "error", 3600);
      } else {
        showToast("เกิดข้อผิดพลาดในการบันทึกโพสต์", "error", 3600);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const cleanupDraftImages = useCallback(() => {
    draft.images.forEach((img) => {
      if (img?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
  }, [draft.images]);

  const handleCloseComposer = useCallback(() => {
    cleanupDraftImages();
    setDraft(createDefaultDraft());
    setSelectedStore(null);
    setStoreSearchQuery("");
    setStoreSearchResults([]);
    setEditingPostId(null);
    setIsComposerOpen(false);
  }, [cleanupDraftImages]);

  const handleRequestDelete = (postId: string) => {
    setDeletingPostId(postId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPostId) return;
    const postId = deletingPostId;
    setDeletingPostId(null);
    try {
      const token = await getIdToken();
      if (!token) {
        showToast("กรุณาเข้าสู่ระบบก่อน", "error");
        return;
      }
      await api.public.deleteCommunityPost(postId, token);
      setCommunityFeed((prev) => prev.filter((p) => p.id !== postId));
      setMyPostIds((prev) => { const next = new Set(prev); next.delete(postId); return next; });
      showToast("ลบโพสต์เรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("Delete post failed", error);
      showToast("ลบโพสต์ไม่สำเร็จ", "error");
    }
  };

  const handleEditPost = (post: CommunityPost) => {
    const postImages: DraftImage[] = post.images.slice(0, 3).map((img) => ({
      previewUrl: img.src,
      serverUrl: img.src,
      alt: img.alt ?? "",
      status: "uploaded" as const,
    }));
    while (postImages.length < 3) postImages.push(null);

    setDraft({
      title: post.title,
      content: post.story ?? post.summary ?? "",
      moodId: post.moodId,
      vibeTagIds: post.vibeTags.slice(0, 3),
      images: postImages,
    });

    setSelectedStore({
      id: "",
      name: post.store.name,
      slug: post.store.slug,
      description: null,
      logoUrl: null,
      bannerUrl: null,
      provinceName: post.store.provinceName ?? null,
      provinceSlug: null,
      categoryNames: [],
      priceRange: null,
      openTime: null,
      closeTime: null,
      isFeatured: false,
      distanceKm: null,
    } as StoreListDto);
    setStoreSearchQuery(post.store.name);

    setEditingPostId(post.id);
    setIsComposerOpen(true);
  };

  const openLightbox = (images: CommunityPost["images"], index: number) => {
    setLightbox({ images, index });
  };

  const handleLightboxNavigate = (direction: "next" | "prev") => {
    if (!lightbox) return;
    const total = lightbox.images.length;
    const delta = direction === "next" ? 1 : -1;
    const nextIndex = (lightbox.index + delta + total) % total;
    setLightbox({ ...lightbox, index: nextIndex });
  };

  return (
    <div className="bg-night text-surface-light">
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-accent/20 via-night to-night py-16">
        <div className="absolute inset-0">
          <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-primary/30 blur-[160px]" />
          <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-accent/20 blur-[140px]" />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-display font-bold leading-tight sm:text-5xl">
              Mood Community ที่เล่า{" "}
              <span className="text-gradient">ภาพ + เรื่อง + vibe</span>{" "}
              ในโพสต์เดียว
            </h1>
            <p className="text-lg text-muted">
              ชุมชนรวมรีวิวกลางคืนที่เล่าเรื่องผ่านภาพ 3 ใบ พร้อม mood & vibe tags เชื่อมกับร้านที่มีอยู่จริง
              เหมาะสำหรับการหาแรงบันดาลใจคืนถัดไป
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setIsComposerOpen(true)}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-glow-purple transition hover:-translate-y-0.5"
              >
                เขียนโพสต์ใหม่
              </button>
              <Link
                href="/stores"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-surface-light transition hover:bg-white/10"
              >
                หาแรงบันดาลใจจากร้าน
              </Link>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-muted">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Community Feed</p>
            <h2 className="text-3xl font-semibold">รีวิวพร้อม mood & vibe</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <MoodFilterButton
              label="ทั้งหมด"
              active={selectedMood === "all"}
              onClick={() => setSelectedMood("all")}
            />
            {MOOD_OPTIONS.map((mood) => (
              <MoodFilterButton
                key={mood.id}
                label={mood.title}
                active={selectedMood === mood.id}
                onClick={() => setSelectedMood(mood.id)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isFeedLoading ? (
            <div className="col-span-full rounded-2xl border border-white/10 bg-night/40 p-10 text-center text-muted animate-pulse">
              กำลังโหลดโพสต์ล่าสุด...
            </div>
          ) : feedError ? (
            <div className="col-span-full rounded-2xl border border-warning/30 bg-warning/5 p-10 text-center">
              <p className="text-warning">{feedError}</p>
              <button
                type="button"
                onClick={() => fetchCommunityPosts(selectedMood)}
                className="mt-3 text-sm text-primary-light hover:underline"
              >
                ลองโหลดอีกครั้ง
              </button>
            </div>
          ) : filteredPosts.length ? (
            filteredPosts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                currentUserId={myPostIds.has(post.id) ? post.author.id : null}
                onImageExpand={(images, index) => openLightbox(images, index)}
                onEdit={handleEditPost}
                onDelete={handleRequestDelete}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-white/10 bg-night/40 p-10 text-center text-muted">
              <p>ยังไม่มีโพสต์ในชุมชนตอนนี้</p>
              <p className="mt-1 text-sm">ลองกดปุ่ม &quot;เขียนโพสต์ใหม่&quot; เพื่อเป็นคนแรกที่เล่า vibe ของคืนนั้น</p>
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold">Guideline ย่อ</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>• โพสต์ต้องมีภาพ 3 ภาพ (กว้าง, รายละเอียด, คน/บรรยากาศ)</li>
              <li>• mood tag ให้เลือก 1 หลัก + vibe tag ไม่เกิน 3</li>
              <li>• ควรอ้างอิงร้านที่มีอยู่ในระบบ เพื่อเชื่อมกับรีวิวหลัก</li>
              <li>• tone การเขียน = เล่าประสบการณ์จริง + tips เล็ก ๆ</li>
            </ul>
            <div className="mt-5 rounded-2xl bg-night/60 p-4 text-xs text-muted">
              <p className="font-semibold text-surface-light">Roadmap</p>
              <p>Feb 2026: เตรียมเนื้อหา seed content</p>
              <p>Mar 2026: เปิด Community tab ให้ Early Adopter</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-night-lighter/30 p-6">
            <h3 className="text-xl font-semibold">หัวข้อที่คนอยากเห็น</h3>
            <div className="mt-4 grid gap-3">
              <TopicCard title="After office craft gin" description="Mood social + happy hour" />
              <TopicCard title="สายดนตรีสด" description="Live neo-soul, funk, city pop" />
              <TopicCard title="บาร์ลับในเชียงใหม่" description="Mood adventurous + solo" />
            </div>
            <Link
              href="/events"
              className="mt-5 inline-flex items-center text-sm text-primary-light hover:text-primary"
            >
              ดู event ที่จะไปรีวิว →
            </Link>
          </div>
        </div>
      </section>

      {isComposerOpen && (
        <ComposerModal
          draft={draft}
          isEditMode={editingPostId !== null}
          onClose={handleCloseComposer}
          onDraftChange={handleDraftChange}
          onImageSlotClick={handleImageSlotClick}
          onImageFileChange={handleImageFileChange}
          imageInputRefs={imageInputRefs}
          onToggleVibe={handleToggleVibe}
          onSubmit={handleSubmit}
          isSubmitting={isPublishing}
          storeSearchQuery={storeSearchQuery}
          onStoreSearchChange={setStoreSearchQuery}
          storeSearchResults={storeSearchResults}
          isSearchingStores={isSearchingStores}
          selectedStore={selectedStore}
          onSelectStore={handleSelectStore}
          onClearStore={handleClearSelectedStore}
        />
      )}
      {deletingPostId && (
        <ConfirmDeleteDialog
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingPostId(null)}
        />
      )}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </div>
  );
}

function MoodFilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
        active ? "border-primary/60 bg-primary/20 text-primary-light" : "border-white/10 text-muted hover:border-white/30"
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function TopicCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-night/50 p-4">
      <p className="text-sm font-semibold text-surface-light">{title}</p>
      <p className="text-xs text-muted">{description}</p>
    </div>
  );
}

const fallbackImageSet: Array<{ src: string; alt: string }> = [];

function mapCommunityPostDto(dto: CommunityPostDto): CommunityPost {
  const moodId = sanitizeMoodId(dto.moodId);
  const normalizedImages =
    dto.images && dto.images.length
      ? dto.images.map((image) => ({
          src: resolveImageUrl(image.url) || image.url,
          alt: image.altText || dto.title,
        }))
      : fallbackImageSet;

  return {
    id: dto.id,
    title: dto.title,
    summary: dto.summary ?? dto.story ?? "",
    story: dto.story ?? "",
    store: {
      name: dto.store.storeName,
      slug: dto.store.storeSlug,
      provinceName: dto.store.provinceName ?? "ทั่วประเทศ",
      moodMatch: dto.moodMatch ?? 90,
    },
    moodId,
    vibeTags: dto.vibeTags ?? [],
    images: ensureMinimumImages(normalizedImages),
    author: {
      id: dto.author.userId,
      name: dto.author.displayName ?? "Community Member",
      role: dto.author.displayName ? "Community Member" : "Nightnice ทีม",
    },
    postedAt: dto.createdAt,
  };
}

function sanitizeMoodId(value: string): MoodId {
  const fallback = MOOD_OPTIONS[0]?.id ?? "chill";
  const matched = MOOD_OPTIONS.find((mood) => mood.id === value);
  return (matched?.id ?? fallback) as MoodId;
}

function ensureMinimumImages(images: Array<{ src: string; alt: string }>) {
  return images.length > 0 ? images : fallbackImageSet;
}

interface ComposerModalProps {
  draft: DraftPost;
  isEditMode: boolean;
  onClose: () => void;
  onDraftChange: (field: keyof DraftPost, value: string | MoodId | string[]) => void;
  onImageSlotClick: (index: number) => void;
  onImageFileChange: (index: number, file: File) => void;
  imageInputRefs: React.RefObject<HTMLInputElement | null>[];
  onToggleVibe: (tagId: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  storeSearchQuery: string;
  onStoreSearchChange: (query: string) => void;
  storeSearchResults: StoreListDto[];
  isSearchingStores: boolean;
  selectedStore: StoreListDto | null;
  onSelectStore: (store: StoreListDto) => void;
  onClearStore: () => void;
}

function ComposerModal({
  draft,
  isEditMode,
  onClose,
  onDraftChange,
  onImageSlotClick,
  onImageFileChange,
  imageInputRefs,
  onToggleVibe,
  onSubmit,
  isSubmitting,
  storeSearchQuery,
  onStoreSearchChange,
  storeSearchResults,
  isSearchingStores,
  selectedStore,
  onSelectStore,
  onClearStore,
}: ComposerModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur" aria-hidden="true" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-night-lighter/80 p-6 sm:p-8 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{isEditMode ? "แก้ไขโพสต์" : "สร้างโพสต์"}</p>
            <h2 className="text-2xl font-semibold text-surface-light">ภาพ 3 ใบ + mood & vibe</h2>
            <p className="text-sm text-muted">{isEditMode ? "แก้ไขเนื้อหา รูปภาพ หรือ mood & vibe ของโพสต์นี้" : "อัปโหลดภาพ เลือก mood แล้วเล่า vibe ของคืนนั้น"}</p>
          </div>
          <Badge variant="accent" className="shrink-0">
            {isEditMode ? "Edit" : "Draft"}
          </Badge>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-muted hover:text-surface-light"
          aria-label="ปิด composer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {draft.images.map((image, index) => (
              <div key={`draft-image-${index}`} className="relative">
                <button
                  type="button"
                  onClick={() => onImageSlotClick(index)}
                  disabled={image?.status === "uploading"}
                  className={cn(
                    "relative aspect-square w-full overflow-hidden rounded-2xl border border-dashed border-white/20 bg-night/40 text-left transition hover:border-primary/40",
                    image?.status === "uploaded" && "border-solid border-primary/50",
                    image?.status === "uploading" && "border-yellow-500/40 cursor-wait",
                    image?.status === "error" && "border-red-500/40"
                  )}
                  aria-label="อัปโหลดภาพ"
                >
                  {image ? (
                    <>
                      <Image src={image.previewUrl} alt={image.alt} fill className="object-cover" sizes="120px" unoptimized />
                      {image.status === "uploading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                      {image.status === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-xs text-red-400">
                          <span>อัปโหลดล้มเหลว</span>
                          <span className="text-[10px] text-muted">แตะเพื่อลองใหม่</span>
                        </div>
                      )}
                      {image.status === "uploaded" && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500/80 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted">
                      <span className="text-3xl text-primary">+</span>
                      แตะเพื่อเพิ่มภาพ
                    </div>
                  )}
                </button>
                <input
                  ref={imageInputRefs[index]}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageFileChange(index, file);
                    e.target.value = "";
                  }}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">
            JPEG, PNG, WebP (สูงสุด 5MB) สูงสุด 3 ภาพ
          </p>

          <label className="space-y-2">
            <span className="text-sm font-medium">หัวข้อโพสต์</span>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => onDraftChange("title", e.target.value)}
              placeholder="เช่น Rooftop Breeze x Craft Gin"
              className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm outline-none focus:border-primary/40"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">เนื้อหา / เล่า vibe</span>
            <textarea
              value={draft.content}
              onChange={(e) => onDraftChange("content", e.target.value)}
              placeholder="สิ่งที่เกิดขึ้น บาร์เทนเดอร์คนไหน เพลงอะไร กลิ่น mood ไหน ฯลฯ"
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm outline-none focus:border-primary/40"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium">ร้านที่ไป</span>
            {selectedStore ? (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-light truncate">{selectedStore.name}</p>
                  {selectedStore.provinceName && (
                    <p className="text-xs text-muted">{selectedStore.provinceName}</p>
                  )}
                </div>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={onClearStore}
                    className="shrink-0 rounded-full border border-white/10 p-1.5 text-muted hover:text-surface-light transition"
                    aria-label="เปลี่ยนร้าน"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6l12 12M6 18L18 6" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={storeSearchQuery}
                  onChange={(e) => onStoreSearchChange(e.target.value)}
                  placeholder="ค้นหาชื่อร้าน..."
                  className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm outline-none focus:border-primary/40 placeholder:text-muted/50"
                />
                {isSearchingStores && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="h-4 w-4 border-2 border-white/20 border-t-primary rounded-full animate-spin block" />
                  </div>
                )}
                {storeSearchQuery.trim().length >= 2 && !isSearchingStores && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-2xl border border-white/10 bg-night-lighter/95 backdrop-blur-xl shadow-lg overflow-hidden">
                    {storeSearchResults.length > 0 ? (
                      storeSearchResults.map((store) => (
                        <button
                          key={store.id}
                          type="button"
                          onClick={() => onSelectStore(store)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/5"
                        >
                          {store.logoUrl ? (
                            <Image
                              src={resolveImageUrl(store.logoUrl) || ""}
                              alt={store.name}
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-lg object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs text-muted">
                              {store.name[0]}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-surface-light truncate">{store.name}</p>
                            <p className="text-xs text-muted truncate">
                              {[store.provinceName, ...(store.categoryNames?.slice(0, 2) ?? [])].filter(Boolean).join(" · ") || "—"}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-sm text-muted">
                        <p>ไม่พบร้าน &quot;{storeSearchQuery}&quot;</p>
                        <p className="mt-1 text-xs">ลองค้นหาด้วยชื่ออื่น หรือ<Link href="/stores" className="text-primary-light hover:underline" target="_blank">เสนอเพิ่มร้านใหม่</Link></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium">เลือก Mood หลัก</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  type="button"
                  key={mood.id}
                  onClick={() => onDraftChange("moodId", mood.id)}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-left text-sm transition",
                    draft.moodId === mood.id
                      ? "border-primary/60 bg-primary/10 text-surface-light"
                      : "border-white/10 text-muted hover:border-white/30"
                  )}
                  aria-pressed={draft.moodId === mood.id}
                >
                  <p className="font-semibold">{mood.title}</p>
                  <p className="text-xs text-muted">{mood.tagline}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Mood & vibe tags (สูงสุด 3)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {VIBE_TAG_OPTIONS.map((tag) => {
                const active = draft.vibeTagIds.includes(tag.id);
                return (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => onToggleVibe(tag.id)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                      active
                        ? "border-primary/50 bg-primary/20 text-primary-light"
                        : "border-white/10 text-muted hover:border-white/30"
                    )}
                    aria-pressed={active}
                  >
                    #{tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full rounded-2xl bg-gradient-to-r from-primary to-accent py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-glow-blue transition",
              isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5"
            )}
          >
            {isSubmitting ? "กำลังบันทึก..." : isEditMode ? "บันทึกการแก้ไข" : "บันทึกโพสต์"}
          </button>
          <p className="text-center text-xs text-muted">
            เมื่อระบบ Community เปิดโพสต์สาธารณะ เราจะนำ draft เหล่านี้ไปเป็น seed content
          </p>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-night-lighter/95 p-6 shadow-2xl backdrop-blur-xl text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-surface-light">ลบโพสต์นี้?</h3>
          <p className="mt-1 text-sm text-muted">เมื่อลบแล้วจะไม่สามารถกู้คืนได้</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-muted hover:bg-white/5 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500/90 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
          >
            ยืนยันลบ
          </button>
        </div>
      </div>
    </div>
  );
}

interface ImageLightboxProps {
  images: CommunityPost["images"];
  index: number;
  onClose: () => void;
  onNavigate: (direction: "next" | "prev") => void;
}

function ImageLightbox({ images, index, onClose, onNavigate }: ImageLightboxProps) {
  const current = images[index];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur" aria-hidden="true" onClick={onClose} />
      <div className="relative w-full max-w-5xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-[-3rem] rounded-full border border-white/30 p-2 text-white/80 hover:text-white"
          aria-label="ปิดภาพ"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-white/20 bg-night">
          <Image
            src={current.src}
            alt={current.alt ?? ""}
            fill
            className="object-cover"
            sizes="90vw"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white">
            <p>{current.alt}</p>
            <p className="text-xs text-white/70">
              รูป {index + 1}/{images.length}
            </p>
          </div>
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onNavigate("prev")}
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 p-3 text-white hover:bg-black/60"
              aria-label="รูปก่อนหน้า"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("next")}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 p-3 text-white hover:bg-black/60"
              aria-label="รูปถัดไป"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
