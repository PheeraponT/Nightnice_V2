import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateProvincePageSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { AdSection } from "@/components/ads/AdSection";

interface ProvincePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}

async function getProvinceDetail(slug: string) {
  try {
    return await api.public.getProvinceDetail(slug);
  } catch {
    return null;
  }
}

async function getStores(
  provinceSlug: string,
  categorySlug?: string,
  page: number = 1
) {
  try {
    return await api.public.getStores({
      province: provinceSlug,
      category: categorySlug,
      page,
      pageSize: 12,
    });
  } catch {
    return null;
  }
}

// T075: Generate SEO metadata for Province Landing page
export async function generateMetadata({
  params,
}: ProvincePageProps): Promise<Metadata> {
  const { slug } = await params;
  const province = await getProvinceDetail(slug);

  if (!province) {
    return {
      title: "ไม่พบจังหวัด",
    };
  }

  const title = `ร้านกลางคืนใน${province.name} - ${province.regionName}`;
  const description =
    province.seoDescription ||
    `รวมร้านบาร์ ผับ ร้านเหล้า และร้านกลางคืนที่ดีที่สุดใน${province.name} ${province.regionName} พบ ${province.totalStoreCount} ร้านพร้อมรายละเอียดและข้อมูลติดต่อ`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${SITE_URL}/province/${province.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/province/${province.slug}`,
    },
  };
}

export default async function ProvincePage({
  params,
  searchParams,
}: ProvincePageProps) {
  const { slug } = await params;
  const { page: pageParam, category: categorySlug } = await searchParams;

  const province = await getProvinceDetail(slug);

  if (!province) {
    notFound();
  }

  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const storesData = await getStores(slug, categorySlug, currentPage);
  const stores = storesData?.items || [];
  const totalPages = storesData?.totalPages || 1;
  const totalCount = storesData?.totalCount || 0;

  // T156: JSON-LD structured data for SEO using schema generators
  const provinceSchema = generateProvincePageSchema(province);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "หน้าแรก", url: "/" },
    { name: province.name, url: `/province/${province.slug}` },
  ]);

  return (
    <>
      {/* Province Page JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(provinceSchema) }}
      />
      {/* T156: BreadcrumbList JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-darker">
        {/* Province Header */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-darker to-dark">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted mb-4">
              <Link href="/" className="hover:text-primary transition-colors">
                หน้าแรก
              </Link>
              <span>/</span>
              <span className="text-surface-light">{province.name}</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">ร้านกลางคืนใน</span>
                <span className="text-surface-light">{province.name}</span>
              </h1>

              <div className="flex items-center gap-3 text-muted mb-4">
                <Badge variant="default">{province.regionName}</Badge>
                <span>•</span>
                <span>{province.totalStoreCount} ร้าน</span>
              </div>

              {province.seoDescription && (
                <p className="text-muted leading-relaxed max-w-2xl">
                  {province.seoDescription}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* T108: Targeted Ad Section for Province */}
        <AdSection
          targeting={{ province: slug }}
          sponsoredTitle={`ร้านสปอนเซอร์ใน${province.name}`}
        />

        {/* Category Filter Section */}
        {province.categoryCounts.length > 0 && (
          <section className="py-6 bg-dark border-b border-muted/10">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/province/${slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !categorySlug
                      ? "bg-primary text-white"
                      : "bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20"
                  }`}
                >
                  ทั้งหมด ({province.totalStoreCount})
                </Link>
                {province.categoryCounts.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/province/${slug}?category=${cat.slug}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      categorySlug === cat.slug
                        ? "bg-primary text-white"
                        : "bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20"
                    }`}
                  >
                    {cat.name} ({cat.storeCount})
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Stores Grid */}
        <section className="py-12 bg-darker">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-surface-light">
                {categorySlug
                  ? `${province.categoryCounts.find((c) => c.slug === categorySlug)?.name || "ร้าน"} ใน${province.name}`
                  : `ร้านทั้งหมดใน${province.name}`}
              </h2>
              <p className="text-sm text-muted">{totalCount} ร้าน</p>
            </div>

            <StoreGrid
              stores={stores}
              isLoading={false}
              emptyMessage={`ไม่พบร้านใน${province.name}`}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <ProvincePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  provinceSlug={slug}
                  categorySlug={categorySlug}
                />
              </div>
            )}
          </div>
        </section>

        {/* Related Provinces Section */}
        <section className="py-12 bg-dark border-t border-muted/10">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-surface-light mb-6">
              จังหวัดอื่นๆ ใน{province.regionName}
            </h2>
            <p className="text-muted">
              ดู
              <Link
                href="/"
                className="text-primary hover:text-primary/80 mx-1"
              >
                จังหวัดทั้งหมด
              </Link>
              หรือค้นหาร้านในหน้าแรก
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

// Pagination component with server-side links
interface ProvincePaginationProps {
  currentPage: number;
  totalPages: number;
  provinceSlug: string;
  categorySlug?: string;
}

function ProvincePagination({
  currentPage,
  totalPages,
  provinceSlug,
  categorySlug,
}: ProvincePaginationProps) {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (categorySlug) params.set("category", categorySlug);
    const queryString = params.toString();
    return `/province/${provinceSlug}${queryString ? `?${queryString}` : ""}`;
  };

  const pages: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <nav className="flex justify-center items-center gap-1">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 text-sm text-muted hover:text-surface-light transition-colors"
        >
          ก่อนหน้า
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm text-muted/50">ก่อนหน้า</span>
      )}

      {/* Page Numbers */}
      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              page === currentPage
                ? "bg-primary text-white"
                : "text-muted hover:text-surface-light hover:bg-muted/10"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 text-sm text-muted hover:text-surface-light transition-colors"
        >
          ถัดไป
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm text-muted/50">ถัดไป</span>
      )}
    </nav>
  );
}
