import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { PRICE_RANGES, FACILITIES } from "@/lib/constants";

interface StoreInfoProps {
  openTime?: string | null;
  closeTime?: string | null;
  priceRange?: number | null;
  address?: string | null;
  facilities?: string[];
  className?: string;
}

export function StoreInfo({
  openTime,
  closeTime,
  priceRange,
  address,
  facilities = [],
  className,
}: StoreInfoProps) {
  const priceLabel = priceRange
    ? PRICE_RANGES.find((p) => p.value === priceRange)
    : null;

  const facilityItems = facilities
    .map((key) => FACILITIES.find((f) => f.key === key))
    .filter(Boolean);

  const hasAnyInfo = openTime || closeTime || priceRange || address || facilities.length > 0;

  if (!hasAnyInfo) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Opening Hours */}
      {(openTime || closeTime) && (
        <div className="flex items-start gap-3">
          <ClockIcon className="w-5 h-5 text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted">เวลาเปิด-ปิด</p>
            <p className="text-surface-light font-medium">
              {openTime && closeTime
                ? `${openTime} - ${closeTime}`
                : openTime || closeTime}
            </p>
          </div>
        </div>
      )}

      {/* Price Range */}
      {priceLabel && (
        <div className="flex items-start gap-3">
          <CurrencyIcon className="w-5 h-5 text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted">ระดับราคา</p>
            <p className="text-surface-light font-medium">
              {priceLabel.label}{" "}
              <span className="text-muted text-sm">({priceLabel.description})</span>
            </p>
          </div>
        </div>
      )}

      {/* Address */}
      {address && (
        <div className="flex items-start gap-3">
          <LocationIcon className="w-5 h-5 text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted">ที่อยู่</p>
            <p className="text-surface-light">{address}</p>
          </div>
        </div>
      )}

      {/* Facilities */}
      {facilityItems.length > 0 && (
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-5 h-5 text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted mb-2">สิ่งอำนวยความสะดวก</p>
            <div className="flex flex-wrap gap-2">
              {facilityItems.map((facility) => (
                <Badge key={facility!.key} variant="default" size="sm">
                  <span className="mr-1">{facility!.icon}</span>
                  {facility!.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon components
function ClockIcon({ className }: { className?: string }) {
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CurrencyIcon({ className }: { className?: string }) {
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
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
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
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
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
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
