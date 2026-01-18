import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

// T094: SEO metadata for Advertise page
export const metadata: Metadata = {
  title: `ลงโฆษณาร้านกลางคืน | ${SITE_NAME}`,
  description: `โปรโมทร้านบาร์ ผับ ร้านเหล้าของคุณกับ ${SITE_NAME} เข้าถึงลูกค้าที่กำลังมองหาร้านกลางคืนในประเทศไทย พร้อมแพ็กเกจโฆษณาที่เหมาะกับทุกธุรกิจ`,
  openGraph: {
    title: `ลงโฆษณาร้านกลางคืน | ${SITE_NAME}`,
    description: `โปรโมทร้านของคุณกับ ${SITE_NAME} เข้าถึงลูกค้าที่กำลังมองหาร้านกลางคืนในประเทศไทย`,
    type: "website",
    url: `${SITE_URL}/advertise`,
  },
  twitter: {
    card: "summary_large_image",
    title: `ลงโฆษณาร้านกลางคืน | ${SITE_NAME}`,
    description: `โปรโมทร้านของคุณกับ ${SITE_NAME} เข้าถึงลูกค้าที่กำลังมองหาร้านกลางคืนในประเทศไทย`,
  },
  alternates: {
    canonical: `${SITE_URL}/advertise`,
  },
};

export default function AdvertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
