import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const RadarChartInner = lazy(() => import("./RadarChartInner"));

interface LazyRadarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      pointBackgroundColor: string;
    }[];
  };
  options: Record<string, unknown>;
}

export function LazyRadarChart({ data, options }: LazyRadarChartProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      }
    >
      <RadarChartInner data={data} options={options} />
    </Suspense>
  );
}
