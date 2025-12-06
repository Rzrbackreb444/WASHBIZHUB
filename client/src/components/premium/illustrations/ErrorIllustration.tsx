import { cn } from "@/lib/utils";

interface ErrorIllustrationProps {
  size?: number;
  className?: string;
}

export function ErrorIllustration({
  size = 200,
  className,
}: ErrorIllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      data-testid="illustration-error"
      aria-hidden="true"
    >
      <circle
        cx="100"
        cy="100"
        r="60"
        fill="#1e3a5f"
        opacity="0.08"
      />
      <circle
        cx="100"
        cy="100"
        r="50"
        stroke="#1e3a5f"
        strokeWidth="4"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M100 40 L110 95 L100 105 L90 95 Z"
        fill="#C8A661"
      />
      <circle
        cx="100"
        cy="125"
        r="8"
        fill="#C8A661"
      />
      <path
        d="M55 55 L65 65"
        stroke="#1e3a5f"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M145 55 L135 65"
        stroke="#1e3a5f"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M55 145 L65 135"
        stroke="#1e3a5f"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M145 145 L135 135"
        stroke="#1e3a5f"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle
        cx="40"
        cy="45"
        r="5"
        fill="#C8A661"
        opacity="0.3"
      />
      <circle
        cx="160"
        cy="150"
        r="6"
        fill="#1e3a5f"
        opacity="0.25"
      />
      <circle
        cx="170"
        cy="40"
        r="4"
        fill="#C8A661"
        opacity="0.4"
      />
      <circle
        cx="30"
        cy="155"
        r="5"
        fill="#C8A661"
        opacity="0.25"
      />
    </svg>
  );
}

export type { ErrorIllustrationProps };
