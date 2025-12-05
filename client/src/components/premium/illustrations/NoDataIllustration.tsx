import { cn } from "@/lib/utils";

interface NoDataIllustrationProps {
  size?: number;
  className?: string;
}

export function NoDataIllustration({
  size = 200,
  className,
}: NoDataIllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      data-testid="illustration-no-data"
      aria-hidden="true"
    >
      <rect
        x="35"
        y="45"
        width="130"
        height="110"
        rx="8"
        stroke="#1e3a5f"
        strokeWidth="4"
        fill="none"
        opacity="0.3"
      />
      <rect
        x="45"
        y="55"
        width="110"
        height="90"
        rx="6"
        fill="#1e3a5f"
        opacity="0.08"
      />
      <rect
        x="55"
        y="70"
        width="90"
        height="8"
        rx="4"
        fill="#1e3a5f"
        opacity="0.15"
      />
      <rect
        x="55"
        y="90"
        width="70"
        height="8"
        rx="4"
        fill="#1e3a5f"
        opacity="0.15"
      />
      <rect
        x="55"
        y="110"
        width="50"
        height="8"
        rx="4"
        fill="#1e3a5f"
        opacity="0.15"
      />
      <circle
        cx="140"
        cy="120"
        r="30"
        fill="white"
        stroke="#b8860b"
        strokeWidth="4"
      />
      <path
        d="M130 115 L140 125 L155 105"
        stroke="#b8860b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0"
      />
      <line
        x1="130"
        y1="110"
        x2="150"
        y2="130"
        stroke="#b8860b"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="150"
        y1="110"
        x2="130"
        y2="130"
        stroke="#b8860b"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="165"
        cy="50"
        r="5"
        fill="#b8860b"
        opacity="0.4"
      />
      <circle
        cx="30"
        cy="80"
        r="4"
        fill="#1e3a5f"
        opacity="0.3"
      />
      <circle
        cx="25"
        cy="160"
        r="6"
        fill="#b8860b"
        opacity="0.25"
      />
    </svg>
  );
}

export type { NoDataIllustrationProps };
