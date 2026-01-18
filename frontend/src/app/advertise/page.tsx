"use client";

import { useState } from "react";
import Link from "next/link";
import { AdPackageCard } from "@/components/ads/AdPackageCard";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE_NAME } from "@/lib/constants";

// Ad packages data
const packages = [
  {
    id: "basic",
    name: "Basic",
    description: "เหมาะสำหรับร้านที่ต้องการเริ่มต้น",
    price: "ติดต่อสอบถาม",
    features: [
      "แสดงผลบนหน้าค้นหา",
      "รูปโปรไฟล์ร้าน",
      "ข้อมูลติดต่อพื้นฐาน",
      "รายงานสถิติรายเดือน",
    ],
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    description: "เหมาะสำหรับร้านที่ต้องการเพิ่มยอดลูกค้า",
    price: "ติดต่อสอบถาม",
    features: [
      "ทุกอย่างใน Basic",
      "แบนเนอร์โปรโมทบนหน้าแรก",
      "แสดงผลเด่นในผลการค้นหา",
      "รูปภาพ Gallery สูงสุด 10 รูป",
      "รายงานสถิติแบบเรียลไทม์",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "สำหรับเครือข่ายร้านหรือแบรนด์ใหญ่",
    price: "ติดต่อสอบถาม",
    features: [
      "ทุกอย่างใน Premium",
      "หลายสาขาในบัญชีเดียว",
      "API สำหรับจัดการข้อมูล",
      "Account Manager เฉพาะ",
      "แคมเปญโฆษณาแบบ Custom",
      "Priority Support 24/7",
    ],
    popular: false,
  },
];

// T093 & T094: Advertise page with SEO metadata
export default function AdvertisePage() {
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>();

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    // Scroll to contact form
    document.getElementById("contact-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-darker">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-darker to-dark">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              หน้าแรก
            </Link>
            <span>/</span>
            <span className="text-surface-light">ลงโฆษณา</span>
          </nav>

          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">โปรโมทร้านของคุณ</span>
              <br />
              <span className="text-surface-light">กับ {SITE_NAME}</span>
            </h1>
            <p className="text-lg text-muted mb-8 max-w-xl mx-auto">
              เข้าถึงลูกค้าที่กำลังมองหาร้านกลางคืนในประเทศไทย
              ด้วยแพลตฟอร์มที่ออกแบบมาเพื่อธุรกิจกลางคืนโดยเฉพาะ
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gradient">
                  1,000+
                </p>
                <p className="text-sm text-muted mt-1">ร้านค้าในระบบ</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gradient">
                  77
                </p>
                <p className="text-sm text-muted mt-1">จังหวัดทั่วไทย</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gradient">
                  50k+
                </p>
                <p className="text-sm text-muted mt-1">ผู้เข้าชมต่อเดือน</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-surface-light mb-3">
              แพ็กเกจโฆษณา
            </h2>
            <p className="text-muted max-w-lg mx-auto">
              เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณ ทีมงานจะติดต่อกลับเพื่อให้รายละเอียดเพิ่มเติม
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <AdPackageCard
                key={pkg.id}
                name={pkg.name}
                description={pkg.description}
                price={pkg.price}
                features={pkg.features}
                popular={pkg.popular}
                onSelect={() => handlePackageSelect(pkg.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-darker">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-surface-light mb-3">
              ทำไมต้องโฆษณากับเรา?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <BenefitCard
              icon={<TargetIcon />}
              title="เข้าถึงกลุ่มเป้าหมาย"
              description="ผู้ใช้ที่กำลังมองหาร้านกลางคืนโดยเฉพาะ"
            />
            <BenefitCard
              icon={<ChartIcon />}
              title="รายงานสถิติ"
              description="ติดตามประสิทธิภาพโฆษณาแบบเรียลไทม์"
            />
            <BenefitCard
              icon={<MapIcon />}
              title="ครอบคลุมทั่วไทย"
              description="แสดงผลในทุกจังหวัดทั่วประเทศ"
            />
            <BenefitCard
              icon={<SupportIcon />}
              title="ซัพพอร์ตเต็มที่"
              description="ทีมงานพร้อมดูแลและให้คำปรึกษา"
            />
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 bg-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-surface-light mb-3">
                ติดต่อเรา
              </h2>
              <p className="text-muted">
                กรอกข้อมูลด้านล่าง ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง
              </p>
            </div>

            <div className="bg-dark-lighter rounded-2xl p-6 md:p-8 border border-muted/20">
              <ContactForm selectedPackage={selectedPackage} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-darker">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-surface-light mb-3">
              คำถามที่พบบ่อย
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FaqItem
              question="ต้องใช้เวลานานแค่ไหนกว่าร้านจะแสดงบนเว็บไซต์?"
              answer="หลังจากที่เราได้รับข้อมูลและรูปภาพครบถ้วน ร้านของคุณจะแสดงบนเว็บไซต์ภายใน 1-2 วันทำการ"
            />
            <FaqItem
              question="สามารถแก้ไขข้อมูลร้านได้หรือไม่?"
              answer="ได้ครับ คุณสามารถแจ้งขอแก้ไขข้อมูลได้ตลอดเวลา ทีมงานจะดำเนินการให้ภายใน 24 ชั่วโมง"
            />
            <FaqItem
              question="มีสัญญาขั้นต่ำหรือไม่?"
              answer="เราไม่มีสัญญาระยะยาวบังคับ สามารถยกเลิกได้ทุกเมื่อโดยแจ้งล่วงหน้า 30 วัน"
            />
            <FaqItem
              question="รองรับการชำระเงินแบบไหนบ้าง?"
              answer="รองรับการโอนเงินผ่านธนาคาร, PromptPay และบัตรเครดิต"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// Benefit Card Component
interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="text-center p-6 bg-dark-lighter rounded-2xl border border-muted/20">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-surface-light mb-2">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

// FAQ Item Component
interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="p-5 bg-dark-lighter rounded-xl border border-muted/20">
      <h3 className="font-medium text-surface-light mb-2">{question}</h3>
      <p className="text-sm text-muted">{answer}</p>
    </div>
  );
}

// Icon Components
function TargetIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" strokeWidth="2" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
