import { Badge } from "@/components/ui/Badge";

interface AdPackageCardProps {
  name: string;
  description: string;
  features: string[];
  price: string;
  popular?: boolean;
  onSelect?: () => void;
}

// T091: Ad package card for advertise page
export function AdPackageCard({
  name,
  description,
  features,
  price,
  popular = false,
  onSelect,
}: AdPackageCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
        popular
          ? "border-primary bg-gradient-to-b from-primary/10 to-transparent scale-105"
          : "border-muted/20 bg-dark-lighter hover:border-muted/40"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="primary">แนะนำ</Badge>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-surface-light">{name}</h3>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-bold text-gradient">{price}</span>
        <span className="text-muted"> / เดือน</span>
      </div>

      <ul className="flex-1 space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-muted">{feature}</span>
          </li>
        ))}
      </ul>

      {onSelect && (
        <button
          onClick={onSelect}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
            popular
              ? "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
              : "bg-dark border border-muted/30 text-surface-light hover:bg-muted/10"
          }`}
        >
          เลือกแพ็กเกจ
        </button>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
