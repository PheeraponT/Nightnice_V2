import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { api, type ThemedStoreDto, type StoreListDto, type ThemeDto } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateBreadcrumbSchema, generateStoreListSchema } from "@/lib/schema";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Badge } from "@/components/ui/Badge";

interface ThemePageProps {
  params: Promise<{ theme: string }>;
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

async function getThemedStores(themeSlug: string) {
  try {
    return await api.public.getThemedStores(themeSlug, undefined, 24);
  } catch {
    return [];
  }
}

async function getProvinces() {
  try {
    return await api.public.getProvinces();
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
}: ThemePageProps): Promise<Metadata> {
  const { theme: themeSlug } = await params;
  const themes = await getThemes();
  const theme = getThemeBySlug(themes, themeSlug);

  if (!theme) {
    return { title: "ไม่พบธีม" };
  }

  const title = `${theme.titleTh}ทั่วประเทศไทย - รวม${theme.titleTh}ที่ดีที่สุด`;
  const description =
    theme.description ||
    `รวม${theme.titleTh}ทั่วประเทศไทย ${theme.storeCount} ร้าน`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${SITE_URL}/theme/${theme.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/theme/${theme.slug}`,
    },
  };
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { theme: themeSlug } = await params;
  const [themes, themedStores, provinces] = await Promise.all([
    getThemes(),
    getThemedStores(themeSlug),
    getProvinces(),
  ]);

  const theme = getThemeBySlug(themes, themeSlug);

  if (!theme) {
    notFound();
  }

  const stores = themedStores.map(toStoreListDto);

  // Get provinces with stores in this theme
  const provinceStoreCount = new Map<string, number>();
  themedStores.forEach((store) => {
    if (store.provinceSlug) {
      provinceStoreCount.set(
        store.provinceSlug,
        (provinceStoreCount.get(store.provinceSlug) || 0) + 1
      );
    }
  });

  const provincesWithStores = provinces
    .filter((p) => provinceStoreCount.has(p.slug))
    .map((p) => ({
      ...p,
      themeStoreCount: provinceStoreCount.get(p.slug) || 0,
    }))
    .sort((a, b) => b.themeStoreCount - a.themeStoreCount);

  // JSON-LD schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "หน้าแรก", url: "/" },
    { name: theme.titleTh, url: `/theme/${theme.slug}` },
  ]);

  const storeListSchema = generateStoreListSchema(
    themedStores,
    `${theme.titleTh}ทั่วประเทศไทย`
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
              <span className="text-surface-light">{theme.titleTh}</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {theme.icon && (
                  <span className="mr-2">{theme.icon}</span>
                )}
                <span className="text-gradient">{theme.titleTh}</span>
                <span className="text-surface-light ml-2">ทั่วประเทศไทย</span>
              </h1>

              <div className="flex items-center gap-3 text-muted mb-4">
                <Badge variant="primary">{theme.titleEn}</Badge>
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

        {/* Province Filter Section */}
        {provincesWithStores.length > 0 && (
          <section className="py-6 bg-dark border-b border-muted/10">
            <div className="container mx-auto px-4">
              <h2 className="text-sm font-medium text-muted mb-3">
                เลือกจังหวัด
              </h2>
              <div className="flex flex-wrap gap-2">
                {provincesWithStores.slice(0, 10).map((province) => (
                  <Link
                    key={province.id}
                    href={`/theme/${themeSlug}/${province.slug}`}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20"
                  >
                    {province.name} ({province.themeStoreCount})
                  </Link>
                ))}
                {provincesWithStores.length > 10 && (
                  <span className="px-4 py-2 text-sm text-muted">
                    +{provincesWithStores.length - 10} จังหวัด
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Store Grid */}
        <section className="py-12 bg-darker">
          <div className="container mx-auto px-4">
            <StoreGrid
              stores={stores}
              isLoading={false}
              emptyMessage={`ยังไม่มี${theme.titleTh}ในระบบ`}
            />
          </div>
        </section>

        {/* Other Themes Section */}
        <section className="py-12 bg-dark border-t border-muted/10">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-surface-light mb-6">
              ธีมอื่นๆ
            </h2>
            <div className="flex flex-wrap gap-3">
              {themes
                .filter((t) => t.slug !== themeSlug)
                .map((t) => (
                  <Link
                    key={t.slug}
                    href={`/theme/${t.slug}`}
                    className="px-4 py-2 rounded-full bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20 transition-colors"
                  >
                    {t.icon && <span className="mr-1">{t.icon}</span>}
                    {t.titleTh} ({t.storeCount})
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
