import { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface StoreSlug {
  slug: string;
}

interface ProvinceSlug {
  slug: string;
}

interface CategorySlug {
  slug: string;
}

interface ThemeSlug {
  slug: string;
}

// T152: Dynamic sitemap for SEO
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nightnice.life";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/advertise`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    // Fetch stores for dynamic pages
    const storesResponse = await fetch(`${API_URL}/stores?pageSize=1000`, {
      next: { revalidate: 3600 },
    });
    const storesData = storesResponse.ok ? await storesResponse.json() : { items: [] };
    const storePages: MetadataRoute.Sitemap = (storesData.items || []).map(
      (store: StoreSlug) => ({
        url: `${baseUrl}/store/${store.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })
    );

    // Fetch provinces for landing pages
    const provincesResponse = await fetch(`${API_URL}/provinces`, {
      next: { revalidate: 86400 },
    });
    const provinces: ProvinceSlug[] = provincesResponse.ok
      ? await provincesResponse.json()
      : [];
    const provincePages: MetadataRoute.Sitemap = provinces.map((province) => ({
      url: `${baseUrl}/province/${province.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    // Fetch categories for landing pages
    const categoriesResponse = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 86400 },
    });
    const categories: CategorySlug[] = categoriesResponse.ok
      ? await categoriesResponse.json()
      : [];
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    // Generate popular pages for each province
    const popularPages: MetadataRoute.Sitemap = provinces.map((province) => ({
      url: `${baseUrl}/popular/${province.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // Generate late-night pages for each province
    const lateNightPages: MetadataRoute.Sitemap = provinces.map((province) => ({
      url: `${baseUrl}/late-night/${province.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // Fetch themes and generate theme pages
    const themesResponse = await fetch(`${API_URL}/seo/themes`, {
      next: { revalidate: 86400 },
    });
    const themes: ThemeSlug[] = themesResponse.ok
      ? await themesResponse.json()
      : [];

    const themePages: MetadataRoute.Sitemap = themes.map((theme) => ({
      url: `${baseUrl}/theme/${theme.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [
      ...staticPages,
      ...provincePages,
      ...categoryPages,
      ...popularPages,
      ...lateNightPages,
      ...themePages,
      ...storePages,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
