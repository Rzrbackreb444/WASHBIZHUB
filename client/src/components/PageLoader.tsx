import { Suspense, ComponentType, lazy } from "react";
import {
  PageSkeleton,
  DashboardSkeleton,
  HomeSkeleton,
  MapSkeleton,
  FormSkeleton,
  TableSkeleton,
  CardSkeleton,
  CleanbiSkeleton,
} from "@/components/Skeletons";

type SkeletonType = 
  | "page"
  | "dashboard"
  | "home"
  | "map"
  | "form"
  | "table"
  | "card"
  | "cleanbi"
  | "cards";

interface PageLoaderProps {
  children: React.ReactNode;
  skeleton?: SkeletonType;
  fallback?: React.ReactNode;
}

function getSkeletonComponent(type: SkeletonType): React.ReactNode {
  switch (type) {
    case "dashboard":
      return <DashboardSkeleton />;
    case "home":
      return <HomeSkeleton />;
    case "map":
      return <MapSkeleton />;
    case "form":
      return <FormSkeleton fields={6} columns={2} variant="glass" />;
    case "table":
      return <TableSkeleton rows={8} columns={5} variant="glass" />;
    case "card":
      return <CardSkeleton variant="glass" />;
    case "cleanbi":
      return <CleanbiSkeleton />;
    case "cards":
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} variant="glass" />
          ))}
        </div>
      );
    case "page":
    default:
      return <PageSkeleton />;
  }
}

export function PageLoader({ 
  children, 
  skeleton = "page",
  fallback 
}: PageLoaderProps) {
  const skeletonFallback = fallback || getSkeletonComponent(skeleton);
  
  return (
    <Suspense fallback={skeletonFallback}>
      {children}
    </Suspense>
  );
}

export function withPageLoader<P extends object>(
  Component: ComponentType<P>,
  skeletonType: SkeletonType = "page"
) {
  return function WrappedComponent(props: P) {
    return (
      <PageLoader skeleton={skeletonType}>
        <Component {...props} />
      </PageLoader>
    );
  };
}

export function createLazyPage<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  skeletonType: SkeletonType = "page"
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyPage(props: P) {
    return (
      <PageLoader skeleton={skeletonType}>
        <LazyComponent {...props} />
      </PageLoader>
    );
  };
}

interface ContentLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: SkeletonType;
  fallback?: React.ReactNode;
  minHeight?: string;
}

export function ContentLoader({
  isLoading,
  children,
  skeleton = "card",
  fallback,
  minHeight,
}: ContentLoaderProps) {
  if (isLoading) {
    const skeletonElement = fallback || getSkeletonComponent(skeleton);
    return (
      <div 
        className="animate-in fade-in duration-300" 
        style={{ minHeight }}
        data-testid="content-loader-skeleton"
      >
        {skeletonElement}
      </div>
    );
  }

  return (
    <div 
      className="animate-in fade-in duration-300"
      data-testid="content-loader-content"
    >
      {children}
    </div>
  );
}

export { 
  PageSkeleton,
  DashboardSkeleton,
  HomeSkeleton,
  MapSkeleton,
  FormSkeleton,
  TableSkeleton,
  CardSkeleton,
  CleanbiSkeleton,
};
