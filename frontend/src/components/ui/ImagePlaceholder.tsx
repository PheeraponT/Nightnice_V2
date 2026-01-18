import { cn } from "@/lib/utils";

export interface ImagePlaceholderProps {
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "portrait";
  iconSize?: "sm" | "md" | "lg";
}

const aspectRatios = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
  portrait: "aspect-[3/4]",
};

const iconSizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

function ImagePlaceholder({
  className,
  aspectRatio = "video",
  iconSize = "md",
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "bg-darker rounded-card",
        "border border-muted/20",
        aspectRatios[aspectRatio],
        className
      )}
      aria-label="ไม่มีรูปภาพ"
    >
      <svg
        className={cn("text-muted/40", iconSizes[iconSize])}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

export { ImagePlaceholder };
