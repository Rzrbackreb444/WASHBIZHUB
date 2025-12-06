import { cn } from "@/lib/utils";

interface EmptySearchIllustrationProps {
  size?: number;
  className?: string;
}

export function EmptySearchIllustration({
  size = 200,
  className,
}: EmptySearchIllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      data-testid="illustration-empty-search"
      aria-hidden="true"
    >
      <circle
        cx="80"
        cy="80"
        r="50"
        stroke="#1e3a5f"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.2"
      />
      <circle
        cx="80"
        cy="80"
        r="50"
        stroke="#1e3a5f"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="200"
        strokeDashoffset="50"
      />
      <line
        x1="118"
        y1="118"
        x2="160"
        y2="160"
        stroke="#1e3a5f"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle
        cx="80"
        cy="80"
        r="25"
        fill="#C8A661"
        opacity="0.15"
      />
      <path
        d="M70 75 L75 80 L90 65"
        stroke="#C8A661"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
      <circle
        cx="155"
        cy="45"
        r="6"
        fill="#C8A661"
        opacity="0.4"
      />
      <circle
        cx="170"
        cy="60"
        r="4"
        fill="#1e3a5f"
        opacity="0.3"
      />
      <circle
        cx="40"
        cy="140"
        r="5"
        fill="#C8A661"
        opacity="0.3"
      />
    </svg>
  );
}

export type { EmptySearchIllustrationProps };
