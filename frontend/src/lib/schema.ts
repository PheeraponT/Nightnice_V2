import type { StoreDetailDto, ProvinceDetailDto, CategoryDetailDto } from "./api";

// T154: JSON-LD schema generators for SEO

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nightnice.co.th";
const SITE_NAME = "Nightnice Thailand";

// Organization schema for the website
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "แหล่งรวมร้านกลางคืน ผับ บาร์ ร้านเหล้า ทั่วประเทศไทย",
    sameAs: [],
  };
}

// WebSite schema with search action
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// T155: LocalBusiness schema for store detail pages
export function generateLocalBusinessSchema(store: StoreDetailDto) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/store/${store.slug}`,
    name: store.name,
    url: `${SITE_URL}/store/${store.slug}`,
  };

  if (store.description) {
    schema.description = store.description;
  }

  if (store.logoUrl) {
    schema.image = store.logoUrl;
  }

  if (store.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.provinceName,
      addressCountry: "TH",
    };
  }

  if (store.latitude && store.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: store.latitude,
      longitude: store.longitude,
    };
  }

  if (store.phone) {
    schema.telephone = store.phone;
  }

  if (store.openTime && store.closeTime) {
    schema.openingHoursSpecification = {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: store.openTime,
      closes: store.closeTime,
    };
  }

  if (store.priceRange) {
    const priceRangeSymbols = ["฿", "฿฿", "฿฿฿", "฿฿฿฿"];
    schema.priceRange = priceRangeSymbols[store.priceRange - 1] || "฿฿";
  }

  return schema;
}

// T156: BreadcrumbList schema generator
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// Province landing page schema
export function generateProvincePageSchema(province: ProvinceDetailDto) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `ร้านกลางคืนใน${province.name}`,
    description:
      province.seoDescription ||
      `รวมร้านกลางคืน ผับ บาร์ ร้านเหล้า ใน${province.name} ${province.totalStoreCount} ร้าน`,
    url: `${SITE_URL}/province/${province.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      "@type": "Place",
      name: province.name,
      address: {
        "@type": "PostalAddress",
        addressRegion: province.name,
        addressCountry: "TH",
      },
    },
  };
}

// Category landing page schema
export function generateCategoryPageSchema(category: CategoryDetailDto) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} ทั่วประเทศไทย`,
    description: `รวม${category.name}ทั่วประเทศไทย ${category.totalStoreCount} ร้าน`,
    url: `${SITE_URL}/category/${category.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

// ItemList schema for store listings
export function generateStoreListSchema(
  stores: Array<{ name: string; slug: string; logoUrl?: string | null }>,
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: stores.length,
    itemListElement: stores.map((store, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        name: store.name,
        url: `${SITE_URL}/store/${store.slug}`,
        ...(store.logoUrl && { image: store.logoUrl }),
      },
    })),
  };
}
