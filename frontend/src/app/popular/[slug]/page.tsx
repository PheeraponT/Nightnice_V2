import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { api, type PopularStoreDto, type StoreListDto } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateBreadcrumbSchema, generateStoreListSchema } from "@/lib/schema";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Badge } from "@/components/ui/Badge";

interface PopularPageProps {
  params: Promise<{ slug: string }>;
}

// ISR: Revalidate every 1 hour
export const revalidate = 3600;

async function getProvinceDetail(slug: string) {
  try {
    return await api.public.getProvinceDetail(slug);
  } catch {
    return null;
  }
}

async function getPopularStores(provinceSlug: string) {
  try {
    return await api.public.getPopularStores(provinceSlug, 24);
  } catch {
    return [];
  }
}

// Convert PopularStoreDto to StoreListDto for StoreGrid compatibility
function toStoreListDto(store: PopularStoreDto): StoreListDto {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    provinceName: store.provinceName,
    provinceSlug: store.provinceSlug,
    categoryNames: store.categoryNames,
    priceRange: store.priceRange,
    openTime: store.openTime,
    closeTime: store.closeTime,
    isFeatured: store.isFeatured,
    distanceKm: null,
  };
}

export async function generateMetadata({
  params,
}: PopularPageProps): Promise<Metadata> {
  const { slug } = await params;
  const province = await getProvinceDetail(slug);

  if (!province) {
    return { title: "ไม่พบจังหวัด" };
  }

  const title = `ร้านยอดนิยมใน${province.name} - ร้านกลางคืนที่คนเข้าชมมากที่สุด`;
  const description = `รวมร้านกลางคืนยอดนิยมใน${province.name} ${province.regionName} ที่มีผู้เข้าชมมากที่สุด บาร์ ผับ ร้านเหล้าแนะนำ`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${SITE_URL}/popular/${province.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/popular/${province.slug}`,
    },
  };
}

export default async function PopularPage({ params }: PopularPageProps) {
  const { slug } = await params;
  const province = await getProvinceDetail(slug);

  if (!province) {
    notFound();
  }

  const popularStores = await getPopularStores(slug);
  const stores = popularStores.map(toStoreListDto);

  // JSON-LD schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "หน้าแรก", url: "/" },
    { name: province.name, url: `/province/${province.slug}` },
    { name: "ร้านยอดนิยม", url: `/popular/${province.slug}` },
  ]);

  const storeListSchema = generateStoreListSchema(
    popularStores,
    `ร้านยอดนิยมใน${province.name}`
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeListSchema) }}
      />

      <div className="min-h-screen bg-darker">
        {/* Header Section */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-darker to-dark">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted mb-4">
              <Link href="/" className="hover:text-primary transition-colors">
                หน้าแรก
              </Link>
              <span>/</span>
              <Link
                href={`/province/${slug}`}
                className="hover:text-primary transition-colors"
              >
                {province.name}
              </Link>
              <span>/</span>
              <span className="text-surface-light">ร้านยอดนิยม</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">ร้านยอดนิยมใน</span>
                <span className="text-surface-light">{province.name}</span>
              </h1>

              <div className="flex items-center gap-3 text-muted mb-4">
                <Badge variant="primary" className="flex items-center gap-1">
                  <TrendingIcon className="w-3 h-3" />
                  ยอดนิยม
                </Badge>
                <Badge variant="default">{province.regionName}</Badge>
                <span>•</span>
                <span>{stores.length} ร้าน</span>
              </div>

              <p className="text-muted leading-relaxed max-w-2xl">
                รวมร้านกลางคืนที่มีผู้เข้าชมมากที่สุดใน{province.name}{" "}
                จัดอันดับตามความนิยมจากผู้ใช้งานจริง
              </p>
            </div>
          </div>
        </section>

        {/* Store Grid */}
        <section className="py-12 bg-darker">
          <div className="container mx-auto px-4">
            <StoreGrid
              stores={stores}
              isLoading={false}
              emptyMessage={`ยังไม่มีข้อมูลร้านยอดนิยมใน${province.name}`}
            />
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 bg-dark border-t border-muted/10">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-surface-light mb-6">
              ดูร้านประเภทอื่นใน{province.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/province/${slug}`}
                className="px-4 py-2 rounded-full bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20 transition-colors"
              >
                ร้านทั้งหมด
              </Link>
              <Link
                href={`/late-night/${slug}`}
                className="px-4 py-2 rounded-full bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20 transition-colors"
              >
                ร้านเปิดดึก
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function TrendingIcon({ className }: { className?: string }) {
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
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}
