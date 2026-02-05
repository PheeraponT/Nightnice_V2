import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { resolveImageUrl } from "@/lib/utils";
import { StoreGallery } from "@/components/store/StoreGallery";
import { StoreDetailClient } from "@/components/store/StoreDetailClient";
import { NearbyStores } from "@/components/store/NearbyStores";
import { StoreEvents } from "@/components/store/StoreEvents";
import { StoreReviews } from "@/components/store/StoreReviews";
import { Badge } from "@/components/ui/Badge";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { StoreMoodAndVibe } from "@/components/store/StoreMoodAndVibe";
import { buildMoodSnapshot, buildSnapshotFromInsight } from "@/lib/mood";

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

async function getStore(slug: string) {
  try {
    return await api.public.getStoreBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug);

  if (!store) {
    return {
      title: "ไม่พบร้าน",
    };
  }

  const title = `${store.name} - ${store.provinceName || "ประเทศไทย"}`;
  const description =
    store.description ||
    `ข้อมูลและรายละเอียดของ ${store.name} ${store.categories.map((c) => c.name).join(", ")} ใน${store.provinceName || "ประเทศไทย"}`;

  const ogImage = resolveImageUrl(store.bannerUrl || store.logoUrl);

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${SITE_URL}/store/${store.slug}`,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/store/${store.slug}`,
    },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStore(slug);

  if (!store) {
    notFound();
  }

  const moodContext = {
    id: store.id,
    name: store.name,
    description: store.description,
    categories: store.categories.map((category) => ({ name: category.name })),
    priceRange: store.priceRange,
    provinceName: store.provinceName,
    regionName: store.regionName,
  };

  const moodSnapshot = store.moodInsight
    ? buildSnapshotFromInsight(moodContext, store.moodInsight)
    : buildMoodSnapshot(moodContext);

  // T155: JSON-LD structured data for SEO using schema generators
  const localBusinessSchema = generateLocalBusinessSchema(store);

  // T156: BreadcrumbList schema
  const breadcrumbItems = [
    { name: "หน้าแรก", url: "/" },
    ...(store.provinceName && store.provinceSlug
      ? [{ name: store.provinceName, url: `/province/${store.provinceSlug}` }]
      : []),
    { name: store.name, url: `/store/${store.slug}` },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      {/* T155: LocalBusiness JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {/* T156: BreadcrumbList JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-night">
        {/* Header Section - Clean design without banner */}
        <section className="relative py-8 md:py-12 bg-gradient-hero overflow-hidden">
          {/* Decorative glow elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted mb-6">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <HomeIcon className="w-4 h-4" />
                หน้าแรก
              </Link>
              <ChevronRightIcon className="w-4 h-4" />
              {store.provinceName && (
                <>
                  <Link
                    href={`/province/${store.provinceSlug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {store.provinceName}
                  </Link>
                  <ChevronRightIcon className="w-4 h-4" />
                </>
              )}
              <span className="text-surface-light truncate max-w-[200px]">
                {store.name}
              </span>
            </nav>

            {/* Store Header */}
            <div className="flex items-start gap-5">
              {/* Logo or First Store Image */}
              {(store.logoUrl || (store.images && store.images.length > 0)) && (
                <div className="relative w-20 h-20 md:w-28 md:h-28 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-night-lighter">
                  <Image
                    src={resolveImageUrl(store.logoUrl || store.images?.[0]?.imageUrl || "") || ""}
                    alt={store.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                    priority
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Categories & Featured Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {store.isFeatured && (
                    <Badge variant="primary" size="sm" className="bg-gold/20 text-gold border-gold/30">
                      <StarIcon className="w-3 h-3 mr-1" />
                      แนะนำ
                    </Badge>
                  )}
                  {store.categories.map((category) => (
                    <Link key={category.id} href={`/category/${category.slug}`}>
                      <Badge variant="default" size="sm" className="hover:bg-white/10 cursor-pointer">
                        {category.name}
                      </Badge>
                    </Link>
                  ))}
                </div>

                {/* Store Name */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-surface-light mb-2">
                  {store.name}
                </h1>

                {/* Location */}
                {store.provinceName && (
                  <p className="text-muted flex items-center gap-2">
                    <LocationIcon className="w-4 h-4" />
                    <span>
                      {store.provinceName}
                      {store.regionName && ` • ${store.regionName}`}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Client-side interactive components (favorites, floating bar) */}
        <StoreDetailClient
          store={store}
          siteUrl={SITE_URL}
        />

        {/* Featured Image Section */}
        {store.images && store.images.length > 0 && (
          <section className="relative z-10 -mt-4">
            <div className="container mx-auto px-4">
              <div className="relative aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden border border-white/10 shadow-card">
                <Image
                  src={resolveImageUrl(store.images[0]?.imageUrl) || ""}
                  alt={store.images[0]?.altText || `${store.name} - รูปหลัก`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="relative z-10 py-8 pb-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions Card */}
                <div className="bg-night-lighter/80 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-card">
                  <div className="flex flex-wrap gap-3">
                    {store.phone && (
                      <a
                        href={`tel:${store.phone}`}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-success/10 text-success hover:bg-success/20 border border-success/30 rounded-xl transition-all duration-200 cursor-pointer"
                        data-event="click_call"
                      >
                        <PhoneIcon className="w-5 h-5" />
                        <span className="font-medium">โทร</span>
                      </a>
                    )}
                    {store.lineId && (
                      <a
                        href={`https://line.me/R/ti/p/${store.lineId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-[#00B900]/10 text-[#00B900] hover:bg-[#00B900]/20 border border-[#00B900]/30 rounded-xl transition-all duration-200 cursor-pointer"
                        data-event="click_line"
                      >
                        <LineIcon className="w-5 h-5" />
                        <span className="font-medium">LINE</span>
                      </a>
                    )}
                    {store.googleMapUrl && (
                      <a
                        href={store.googleMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30 rounded-xl transition-all duration-200 cursor-pointer"
                        data-event="click_map"
                      >
                        <MapIcon className="w-5 h-5" />
                        <span className="font-medium">แผนที่</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Gallery Section */}
                {store.images && store.images.length > 0 && (
                  <div className="bg-night-lighter/80 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-lg font-display font-semibold text-surface-light">
                        รูปภาพ
                      </h2>
                      <span className="text-sm text-muted">({store.images.length} รูป)</span>
                    </div>
                    <StoreGallery images={store.images} storeName={store.name} />
                  </div>
                )}

                {/* Description Section */}
                {store.description && (
                  <div className="bg-night-lighter/80 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <DocumentIcon className="w-5 h-5 text-accent" />
                      </div>
                      <h2 className="text-lg font-display font-semibold text-surface-light">
                        รายละเอียด
                      </h2>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <p className="text-muted leading-relaxed whitespace-pre-wrap text-base">
                        {store.description}
                      </p>
                    </div>
                  </div>
                )}

                <StoreMoodAndVibe snapshot={moodSnapshot} />

                {/* Store Events */}
                <StoreEvents storeSlug={store.slug} />

                {/* Nearby Stores */}
                <NearbyStores
                  storeSlug={store.slug}
                  hasCoordinates={store.latitude !== null && store.longitude !== null}
                />

                {/* Reviews Section */}
                <StoreReviews storeId={store.id} />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Store Info Card */}
                <div className="bg-night-lighter/80 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-card lg:sticky lg:top-24">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <InfoIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-display font-semibold text-surface-light">
                      ข้อมูลร้าน
                    </h2>
                  </div>

                  <StoreInfoSection
                    openTime={store.openTime}
                    closeTime={store.closeTime}
                    priceRange={store.priceRange}
                    address={store.address}
                    facilities={store.facilities}
                  />

                  {/* Social Links */}
                  {(store.facebookUrl || store.instagramUrl) && (
                    <div className="mt-6 pt-5 border-t border-white/10">
                      <p className="text-sm text-muted mb-3">โซเชียลมีเดีย</p>
                      <div className="flex gap-3">
                        {store.facebookUrl && (
                          <a
                            href={store.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-11 h-11 rounded-xl bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2]/20 border border-[#1877F2]/30 transition-all duration-200 cursor-pointer"
                            aria-label="Facebook"
                          >
                            <FacebookIcon className="w-5 h-5" />
                          </a>
                        )}
                        {store.instagramUrl && (
                          <a
                            href={store.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10 flex items-center justify-center text-[#E1306C] hover:from-[#833AB4]/20 hover:via-[#FD1D1D]/20 hover:to-[#F77737]/20 border border-[#E1306C]/30 transition-all duration-200 cursor-pointer"
                            aria-label="Instagram"
                          >
                            <InstagramIcon className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Share Section */}
                  <div className="mt-6 pt-5 border-t border-white/10">
                    <p className="text-sm text-muted mb-3">แชร์ร้านนี้</p>
                    <ShareButtons
                      url={`${SITE_URL}/store/${store.slug}`}
                      title={`${store.name} - ${SITE_NAME}`}
                      platforms={["facebook", "twitter", "line", "copy"]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Store Info Section Component
import { PRICE_RANGES, FACILITIES } from "@/lib/constants";

function StoreInfoSection({
  openTime,
  closeTime,
  priceRange,
  address,
  facilities = [],
}: {
  openTime?: string | null;
  closeTime?: string | null;
  priceRange?: number | null;
  address?: string | null;
  facilities?: string[];
}) {
  const priceLabel = priceRange
    ? PRICE_RANGES.find((p) => p.value === priceRange)
    : null;

  const facilityItems = facilities
    .map((key) => FACILITIES.find((f) => f.key === key))
    .filter(Boolean);

  const hasAnyInfo = openTime || closeTime || priceRange || address || facilities.length > 0;

  if (!hasAnyInfo) {
    return <p className="text-muted text-sm">ยังไม่มีข้อมูลร้าน</p>;
  }

  return (
    <div className="space-y-4">
      {/* Opening Hours */}
      {(openTime || closeTime) && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-night/50">
          <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
            <ClockIcon className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">เวลาเปิด-ปิด</p>
            <p className="text-surface-light font-medium">
              {openTime && closeTime
                ? `${openTime} - ${closeTime}`
                : openTime || closeTime}
            </p>
          </div>
        </div>
      )}

      {/* Price Range */}
      {priceLabel && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-night/50">
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
            <CurrencyIcon className="w-4 h-4 text-gold" />
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">ระดับราคา</p>
            <p className="text-surface-light font-medium">
              {priceLabel.label}{" "}
              <span className="text-muted text-sm">({priceLabel.description})</span>
            </p>
          </div>
        </div>
      )}

      {/* Address */}
      {address && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-night/50">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <LocationIcon className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">ที่อยู่</p>
            <p className="text-surface-light text-sm">{address}</p>
          </div>
        </div>
      )}

      {/* Facilities */}
      {facilityItems.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted mb-3">สิ่งอำนวยความสะดวก</p>
          <div className="flex flex-wrap gap-2">
            {facilityItems.map((facility) => (
              <span
                key={facility!.key}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-night/50 border border-white/10 rounded-lg text-muted"
              >
                <span>{facility!.icon}</span>
                {facility!.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Icon components
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
