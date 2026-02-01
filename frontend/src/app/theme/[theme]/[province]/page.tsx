import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { api, type ThemedStoreDto, type StoreListDto, type ThemeDto } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateBreadcrumbSchema, generateStoreListSchema } from "@/lib/schema";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Badge } from "@/components/ui/Badge";

interface ThemeProvincePageProps {
  params: Promise<{ theme: string; province: string }>;
}

// ISR: Revalidate every 1 hour
export const revalidate = 3600;

async function getThemes() {
  try {
    return await api.public.getThemes();
  } catch {
    return [];
  }
}

async function getProvinceDetail(slug: string) {
  try {
    return await api.public.getProvinceDetail(slug);
  } catch {
    return null;
  }
}

async function getThemedStores(themeSlug: string, provinceSlug: string) {
  try {
    return await api.public.getThemedStores(themeSlug, provinceSlug, 24);
  } catch {
    return [];
  }
}

// Convert ThemedStoreDto to StoreListDto for StoreGrid compatibility
function toStoreListDto(store: ThemedStoreDto): StoreListDto {
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

function getThemeBySlug(themes: ThemeDto[], slug: string): ThemeDto | undefined {
  return themes.find((t) => t.slug === slug);
}

export async function generateMetadata({
  params,
}: ThemeProvincePageProps): Promise<Metadata> {
  const { theme: themeSlug, province: provinceSlug } = await params;
  const [themes, province] = await Promise.all([
    getThemes(),
    getProvinceDetail(provinceSlug),
  ]);

  const theme = getThemeBySlug(themes, themeSlug);

  if (!theme || !province) {
    return { title: "ไม่พบข้อมูล" };
  }

  const title = `${theme.titleTh}ใน${province.name} - รวม${theme.titleTh}ที่ดีที่สุด`;
  const description = `รวม${theme.titleTh}ใน${province.name} ${province.regionName}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${SITE_URL}/theme/${theme.slug}/${province.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/theme/${theme.slug}/${province.slug}`,
    },
  };
}

export default async function ThemeProvincePage({
  params,
}: ThemeProvincePageProps) {
  const { theme: themeSlug, province: provinceSlug } = await params;
  const [themes, province, themedStores] = await Promise.all([
    getThemes(),
    getProvinceDetail(provinceSlug),
    getThemedStores(themeSlug, provinceSlug),
  ]);

  const theme = getThemeBySlug(themes, themeSlug);

  if (!theme || !province) {
    notFound();
  }

  const stores = themedStores.map(toStoreListDto);

  // JSON-LD schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "หน้าแรก", url: "/" },
    { name: theme.titleTh, url: `/theme/${theme.slug}` },
    { name: province.name, url: `/theme/${theme.slug}/${province.slug}` },
  ]);

  const storeListSchema = generateStoreListSchema(
    themedStores,
    `${theme.titleTh}ใน${province.name}`
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
                href={`/theme/${themeSlug}`}
                className="hover:text-primary transition-colors"
              >
                {theme.titleTh}
              </Link>
              <span>/</span>
              <span className="text-surface-light">{province.name}</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {theme.icon && <span className="mr-2">{theme.icon}</span>}
                <span className="text-gradient">{theme.titleTh}</span>
                <span className="text-surface-light ml-2">
                  ใน{province.name}
                </span>
              </h1>

              <div className="flex items-center gap-3 text-muted mb-4">
                <Badge variant="primary">{theme.titleEn}</Badge>
                <Badge variant="default">{province.regionName}</Badge>
                <span>•</span>
                <span>{stores.length} ร้าน</span>
              </div>

              {theme.description && (
                <p className="text-muted leading-relaxed max-w-2xl">
                  {theme.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Store Grid */}
        <section className="py-12 bg-darker">
          <div className="container mx-auto px-4">
            <StoreGrid
              stores={stores}
              isLoading={false}
              emptyMessage={`ยังไม่มี${theme.titleTh}ใน${province.name}`}
            />
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 bg-dark border-t border-muted/10">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-surface-light mb-6">
              ดูเพิ่มเติม
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/theme/${themeSlug}`}
                className="px-4 py-2 rounded-full bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20 transition-colors"
              >
                {theme.icon} {theme.titleTh}ทั่วไทย
              </Link>
              <Link
                href={`/province/${provinceSlug}`}
                className="px-4 py-2 rounded-full bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20 transition-colors"
              >
                ร้านทั้งหมดใน{province.name}
              </Link>
              <Link
                href={`/popular/${provinceSlug}`}
                className="px-4 py-2 rounded-full bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20 transition-colors"
              >
                ร้านยอดนิยมใน{province.name}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
