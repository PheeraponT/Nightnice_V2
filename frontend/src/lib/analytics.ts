// T158: Analytics event utilities for GTM/GA4

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

// Ensure dataLayer exists
function ensureDataLayer() {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
  }
}

// Push event to dataLayer
function pushToDataLayer(event: Record<string, unknown>) {
  ensureDataLayer();
  if (typeof window !== "undefined") {
    window.dataLayer.push(event);
  }
}

// T160: View store event
export function trackViewStore(storeData: {
  storeId: string;
  storeName: string;
  storeSlug: string;
  province?: string;
  categories?: string[];
}) {
  pushToDataLayer({
    event: "view_store",
    store_id: storeData.storeId,
    store_name: storeData.storeName,
    store_slug: storeData.storeSlug,
    province: storeData.province || "",
    categories: storeData.categories?.join(",") || "",
  });
}

// T161: Contact action events
export function trackClickCall(storeData: {
  storeId: string;
  storeName: string;
  phone: string;
}) {
  pushToDataLayer({
    event: "click_call",
    store_id: storeData.storeId,
    store_name: storeData.storeName,
    phone: storeData.phone,
  });
}

export function trackClickLine(storeData: {
  storeId: string;
  storeName: string;
  lineId: string;
}) {
  pushToDataLayer({
    event: "click_line",
    store_id: storeData.storeId,
    store_name: storeData.storeName,
    line_id: storeData.lineId,
  });
}

export function trackClickMap(storeData: {
  storeId: string;
  storeName: string;
}) {
  pushToDataLayer({
    event: "click_map",
    store_id: storeData.storeId,
    store_name: storeData.storeName,
  });
}

export function trackClickFacebook(storeData: {
  storeId: string;
  storeName: string;
}) {
  pushToDataLayer({
    event: "click_facebook",
    store_id: storeData.storeId,
    store_name: storeData.storeName,
  });
}

export function trackClickInstagram(storeData: {
  storeId: string;
  storeName: string;
}) {
  pushToDataLayer({
    event: "click_instagram",
    store_id: storeData.storeId,
    store_name: storeData.storeName,
  });
}

// T162: Search events
export function trackSearch(searchData: {
  searchTerm: string;
  resultsCount: number;
}) {
  pushToDataLayer({
    event: "search",
    search_term: searchData.searchTerm,
    results_count: searchData.resultsCount,
  });
}

// T163: Filter events
export function trackFilterProvince(filterData: {
  province: string;
  provinceSlug: string;
}) {
  pushToDataLayer({
    event: "filter_province",
    province_name: filterData.province,
    province_slug: filterData.provinceSlug,
  });
}

export function trackFilterCategory(filterData: {
  category: string;
  categorySlug: string;
}) {
  pushToDataLayer({
    event: "filter_category",
    category_name: filterData.category,
    category_slug: filterData.categorySlug,
  });
}

// Page view event (enhanced)
export function trackPageView(pageData: {
  pagePath: string;
  pageTitle: string;
  pageType?: string;
}) {
  pushToDataLayer({
    event: "page_view",
    page_path: pageData.pagePath,
    page_title: pageData.pageTitle,
    page_type: pageData.pageType || "general",
  });
}

// Contact form submission
export function trackContactSubmit(formData: {
  inquiryType: string;
  success: boolean;
}) {
  pushToDataLayer({
    event: "contact_submit",
    inquiry_type: formData.inquiryType,
    success: formData.success,
  });
}

// Ad events
export function trackAdImpression(adData: {
  adId: string;
  adType: string;
  position?: string;
}) {
  pushToDataLayer({
    event: "ad_impression",
    ad_id: adData.adId,
    ad_type: adData.adType,
    position: adData.position || "unknown",
  });
}

export function trackAdClick(adData: {
  adId: string;
  adType: string;
  targetUrl?: string;
}) {
  pushToDataLayer({
    event: "ad_click",
    ad_id: adData.adId,
    ad_type: adData.adType,
    target_url: adData.targetUrl || "",
  });
}
