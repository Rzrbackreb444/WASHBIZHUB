import { cn } from "@/lib/utils";

interface SuccessIllustrationProps {
  size?: number;
  className?: string;
}

export function SuccessIllustration({
  size = 200,
  className,
}: SuccessIllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      data-testid="illustration-success"
      aria-hidden="true"
    >
      <circle
        cx="100"
        cy="100"
        r="65"
        fill="#b8860b"
        opacity="0.1"
      />
      <circle
        cx="100"
        cy="100"
        r="50"
        stroke="#b8860b"
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx="100"
        cy="100"
        r="42"
        fill="#b8860b"
        opacity="0.15"
      />
      <path
        d="M75 100 L92 117 L130 79"
        stroke="#1e3a5f"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle
        cx="45"
        cy="55"
        r="6"
        fill="#b8860b"
        opacity="0.4"
      />
      <circle
        cx="155"
        cy="50"
        r="5"
        fill="#1e3a5f"
        opacity="0.3"
      />
      <circle
        cx="160"
        cy="140"
        r="6"
        fill="#b8860b"
        opacity="0.35"
      />
      <circle
        cx="40"
        cy="145"
        r="5"
        fill="#1e3a5f"
        opacity="0.25"
      />
      <path
        d="M55 35 L60 25 L65 35"
        stroke="#b8860b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M135 165 L140 175 L145 165"
        stroke="#1e3a5f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.4"
      />
      <circle
        cx="175"
        cy="95"
        r="4"
        fill="#b8860b"
        opacity="0.3"
      />
      <circle
        cx="25"
        cy="100"
        r="4"
        fill="#1e3a5f"
        opacity="0.25"
      />
    </svg>
  );
}

export type { SuccessIllustrationProps };
