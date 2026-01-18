import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateCategoryPageSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Badge } from "@/components/ui/Badge";
import { AdSection } from "@/components/ads/AdSection";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; province?: string }>;
}

async function getCategoryDetail(slug: string) {
  try {
    return await api.public.getCategoryDetail(slug);
  } catch {
    return null;
  }
}

async function getStores(
  categorySlug: string,
  provinceSlug?: string,
  page: number = 1
) {
  try {
    return await api.public.getStores({
      category: categorySlug,
      province: provinceSlug,
      page,
      pageSize: 12,
    });
  } catch {
    return null;
  }
}

// T077: Generate SEO metadata for Category Landing page
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryDetail(slug);

  if (!category) {
    return {
      title: "ไม่พบประเภท",
    };
  }

  const title = `${category.name} ที่ดีที่สุดในประเทศไทย`;
  const description = `รวม${category.name}ที่ดีที่สุดทั่วประเทศไทย พบ ${category.totalStoreCount} ร้านพร้อมรายละเอียดและข้อมูลติดต่อครบถ้วน`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${SITE_URL}/category/${category.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam, province: provinceSlug } = await searchParams;

  const category = await getCategoryDetail(slug);

  if (!category) {
    notFound();
  }

  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const storesData = await getStores(slug, provinceSlug, currentPage);
  const stores = storesData?.items || [];
  const totalPages = storesData?.totalPages || 1;
  const totalCount = storesData?.totalCount || 0;

  // T156: JSON-LD structured data for SEO using schema generators
  const categorySchema = generateCategoryPageSchema(category);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "หน้าแรก", url: "/" },
    { name: category.name, url: `/category/${category.slug}` },
  ]);

  return (
    <>
      {/* Category Page JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />
      {/* T156: BreadcrumbList JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-darker">
        {/* Category Header */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-darker to-dark">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted mb-4">
              <Link href="/" className="hover:text-primary transition-colors">
                หน้าแรก
              </Link>
              <span>/</span>
              <span className="text-surface-light">{category.name}</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">{category.name}</span>
                <span className="text-surface-light"> ในประเทศไทย</span>
              </h1>

              <div className="flex items-center gap-3 text-muted mb-4">
                <span>{category.totalStoreCount} ร้าน</span>
                <span>•</span>
                <span>{category.provinceCounts.length} จังหวัด</span>
              </div>

              <p className="text-muted leading-relaxed max-w-2xl">
                รวม{category.name}
                ที่ดีที่สุดจากทั่วประเทศไทย พร้อมรายละเอียดและข้อมูลติดต่อครบถ้วน
              </p>
            </div>
          </div>
        </section>

        {/* T109: Targeted Ad Section for Category */}
        <AdSection
          targeting={{ category: slug }}
          sponsoredTitle={`${category.name} สปอนเซอร์`}
        />

        {/* Province Filter Section */}
        {category.provinceCounts.length > 0 && (
          <section className="py-6 bg-dark border-b border-muted/10">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/category/${slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !provinceSlug
                      ? "bg-primary text-white"
                      : "bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20"
                  }`}
                >
                  ทุกจังหวัด ({category.totalStoreCount})
                </Link>
                {category.provinceCounts.map((prov) => (
                  <Link
                    key={prov.id}
                    href={`/category/${slug}?province=${prov.slug}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      provinceSlug === prov.slug
                        ? "bg-primary text-white"
                        : "bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20"
                    }`}
                  >
                    {prov.name} ({prov.storeCount})
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
                {provinceSlug
                  ? `${category.name} ใน${category.provinceCounts.find((p) => p.slug === provinceSlug)?.name || "จังหวัด"}`
                  : `${category.name} ทั้งหมด`}
              </h2>
              <p className="text-sm text-muted">{totalCount} ร้าน</p>
            </div>

            <StoreGrid
              stores={stores}
              isLoading={false}
              emptyMessage={`ไม่พบ${category.name}ในขณะนี้`}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <CategoryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  categorySlug={slug}
                  provinceSlug={provinceSlug}
                />
              </div>
            )}
          </div>
        </section>

        {/* Province Quick Links */}
        <section className="py-12 bg-dark border-t border-muted/10">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-surface-light mb-6">
              {category.name} ตามจังหวัด
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {category.provinceCounts.slice(0, 12).map((prov) => (
                <Link
                  key={prov.id}
                  href={`/province/${prov.slug}?category=${slug}`}
                  className="flex items-center justify-between px-4 py-3 bg-dark-lighter rounded-xl hover:bg-muted/20 transition-colors group"
                >
                  <span className="text-muted group-hover:text-surface-light transition-colors">
                    {prov.name}
                  </span>
                  <Badge variant="default" size="sm">
                    {prov.storeCount}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Pagination component with server-side links
interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  categorySlug: string;
  provinceSlug?: string;
}

function CategoryPagination({
  currentPage,
  totalPages,
  categorySlug,
  provinceSlug,
}: CategoryPaginationProps) {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (provinceSlug) params.set("province", provinceSlug);
    const queryString = params.toString();
    return `/category/${categorySlug}${queryString ? `?${queryString}` : ""}`;
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
