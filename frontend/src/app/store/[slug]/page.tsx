import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { resolveImageUrl } from "@/lib/utils";
import { StoreGallery } from "@/components/store/StoreGallery";
import { StoreInfo } from "@/components/store/StoreInfo";
import { ContactButtons } from "@/components/store/ContactButtons";
import { NearbyStores } from "@/components/store/NearbyStores";
import { Badge } from "@/components/ui/Badge";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

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

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${SITE_URL}/store/${store.slug}`,
      images: store.bannerUrl || store.logoUrl
        ? [{ url: store.bannerUrl || store.logoUrl! }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: store.bannerUrl || store.logoUrl
        ? [store.bannerUrl || store.logoUrl!]
        : undefined,
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

      <div className="min-h-screen bg-darker">
        {/* Banner Image */}
        <div className="relative h-64 md:h-96 bg-dark-lighter">
          {store.bannerUrl ? (
            <Image
              src={resolveImageUrl(store.bannerUrl) || ""}
              alt={store.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <ImagePlaceholder aspectRatio="wide" className="h-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Store Header */}
              <div className="bg-dark-lighter rounded-2xl p-6 border border-muted/20">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  {store.logoUrl && (
                    <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden border border-muted/20">
                      <Image
                        src={resolveImageUrl(store.logoUrl) || ""}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted mb-2">
                      <Link
                        href="/"
                        className="hover:text-primary transition-colors"
                      >
                        หน้าแรก
                      </Link>
                      <span>/</span>
                      {store.provinceName && (
                        <>
                          <Link
                            href={`/province/${store.provinceSlug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {store.provinceName}
                          </Link>
                          <span>/</span>
                        </>
                      )}
                      <span className="text-surface-light truncate">
                        {store.name}
                      </span>
                    </nav>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-surface-light mb-2">
                      {store.name}
                    </h1>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {store.isFeatured && (
                        <Badge variant="primary" size="sm">
                          แนะนำ
                        </Badge>
                      )}
                      {store.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                        >
                          <Badge variant="default" size="sm">
                            {category.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>

                    {/* Location */}
                    {store.provinceName && (
                      <p className="text-muted flex items-center gap-1.5">
                        <LocationIcon className="w-4 h-4" />
                        <span>
                          {store.provinceName}
                          {store.regionName && `, ${store.regionName}`}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="mt-6">
                  <ContactButtons
                    phone={store.phone}
                    lineId={store.lineId}
                    googleMapUrl={store.googleMapUrl}
                    facebookUrl={store.facebookUrl}
                    instagramUrl={store.instagramUrl}
                  />
                </div>
              </div>

              {/* Gallery */}
              {store.images && store.images.length > 0 && (
                <div className="bg-dark-lighter rounded-2xl p-6 border border-muted/20">
                  <h2 className="text-lg font-semibold text-surface-light mb-4">
                    รูปภาพ
                  </h2>
                  <StoreGallery images={store.images} storeName={store.name} />
                </div>
              )}

              {/* Description */}
              {store.description && (
                <div className="bg-dark-lighter rounded-2xl p-6 border border-muted/20">
                  <h2 className="text-lg font-semibold text-surface-light mb-4">
                    รายละเอียด
                  </h2>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-muted leading-relaxed whitespace-pre-wrap">
                      {store.description}
                    </p>
                  </div>
                </div>
              )}

              {/* T086: Nearby Stores */}
              <NearbyStores
                storeSlug={store.slug}
                hasCoordinates={store.latitude !== null && store.longitude !== null}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Store Info Card */}
              <div className="bg-dark-lighter rounded-2xl p-6 border border-muted/20 sticky top-24">
                <h2 className="text-lg font-semibold text-surface-light mb-4">
                  ข้อมูลร้าน
                </h2>
                <StoreInfo
                  openTime={store.openTime}
                  closeTime={store.closeTime}
                  priceRange={store.priceRange}
                  address={store.address}
                  facilities={store.facilities}
                />

                {/* Map Link */}
                {store.googleMapUrl && (
                  <div className="mt-6 pt-6 border-t border-muted/20">
                    <a
                      href={store.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-dark border border-muted/30 rounded-xl text-surface-light hover:bg-muted/10 transition-colors"
                    >
                      <MapIcon className="w-5 h-5" />
                      <span>เปิดใน Google Maps</span>
                    </a>
                  </div>
                )}

                {/* Share */}
                <div className="mt-6 pt-6 border-t border-muted/20">
                  <p className="text-sm text-muted mb-3">แชร์ร้านนี้</p>
                  <div className="flex gap-2">
                    <ShareButton
                      platform="facebook"
                      url={`${SITE_URL}/store/${store.slug}`}
                    />
                    <ShareButton
                      platform="twitter"
                      url={`${SITE_URL}/store/${store.slug}`}
                      text={`${store.name} - ${SITE_NAME}`}
                    />
                    <ShareButton
                      platform="line"
                      url={`${SITE_URL}/store/${store.slug}`}
                      text={`${store.name} - ${SITE_NAME}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Icon components
function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  );
}

// Share Button Component
interface ShareButtonProps {
  platform: "facebook" | "twitter" | "line";
  url: string;
  text?: string;
}

function ShareButton({ platform, url, text }: ShareButtonProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = text ? encodeURIComponent(text) : "";

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
  };

  const icons = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    line: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
      </svg>
    ),
  };

  const colors = {
    facebook: "hover:text-[#1877F2]",
    twitter: "hover:text-surface-light",
    line: "hover:text-[#00B900]",
  };

  return (
    <a
      href={shareUrls[platform]}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-2.5 bg-dark border border-muted/30 rounded-lg text-muted ${colors[platform]} transition-colors`}
      aria-label={`แชร์ใน ${platform}`}
    >
      {icons[platform]}
    </a>
  );
}
