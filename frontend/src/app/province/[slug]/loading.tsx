// T164: Loading state for province landing page
export default function ProvinceLoading() {
  return (
    <div className="min-h-screen bg-darker">
      {/* Header Skeleton */}
      <section className="relative py-12 md:py-16 bg-gradient-to-b from-darker to-dark">
        <div className="container mx-auto px-4">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 w-32 bg-dark rounded mb-4 animate-pulse" />
          <div className="max-w-3xl">
            {/* Title Skeleton */}
            <div className="h-10 w-72 bg-dark rounded mb-3 animate-pulse" />
            {/* Meta Skeleton */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-20 bg-dark rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-dark rounded animate-pulse" />
            </div>
            {/* Description Skeleton */}
            <div className="h-4 w-full bg-dark rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-dark rounded mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Category Filter Skeleton */}
      <section className="py-6 bg-dark border-b border-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-darker rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Store Grid Skeleton */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-dark-lighter rounded-2xl overflow-hidden border border-muted/20">
                <div className="aspect-video bg-dark animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 w-3/4 bg-dark rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-dark rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-dark rounded-full animate-pulse" />
                    <div className="h-5 w-16 bg-dark rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
