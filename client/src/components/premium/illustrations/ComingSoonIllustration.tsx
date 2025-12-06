import { cn } from "@/lib/utils";

interface ComingSoonIllustrationProps {
  size?: number;
  className?: string;
}

export function ComingSoonIllustration({
  size = 200,
  className,
}: ComingSoonIllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      data-testid="illustration-coming-soon"
      aria-hidden="true"
    >
      <rect
        x="45"
        y="50"
        width="110"
        height="100"
        rx="12"
        stroke="#1e3a5f"
        strokeWidth="4"
        fill="none"
        opacity="0.3"
      />
      <rect
        x="55"
        y="60"
        width="90"
        height="80"
        rx="8"
        fill="#1e3a5f"
        opacity="0.08"
      />
      <circle
        cx="100"
        cy="100"
        r="30"
        stroke="#C8A661"
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx="100"
        cy="100"
        r="22"
        fill="#C8A661"
        opacity="0.15"
      />
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="80"
        stroke="#1e3a5f"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="100"
        x2="115"
        y2="105"
        stroke="#C8A661"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="100"
        cy="100"
        r="4"
        fill="#1e3a5f"
      />
      <path
        d="M70 35 L100 20 L130 35"
        stroke="#C8A661"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M85 25 L100 15 L115 25"
        stroke="#1e3a5f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.4"
      />
      <circle
        cx="165"
        cy="60"
        r="5"
        fill="#C8A661"
        opacity="0.4"
      />
      <circle
        cx="35"
        cy="85"
        r="4"
        fill="#1e3a5f"
        opacity="0.3"
      />
      <circle
        cx="170"
        cy="145"
        r="6"
        fill="#C8A661"
        opacity="0.25"
      />
      <circle
        cx="30"
        cy="160"
        r="5"
        fill="#1e3a5f"
        opacity="0.25"
      />
    </svg>
  );
}

export type { ComingSoonIllustrationProps };
