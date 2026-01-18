// T164: Loading state for store detail page
export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-darker">
      {/* Banner Skeleton */}
      <div className="relative h-64 md:h-96 bg-dark-lighter animate-pulse" />

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-dark-lighter rounded-2xl p-6 border border-muted/20">
              <div className="flex items-start gap-4">
                {/* Logo Skeleton */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-dark animate-pulse" />
                <div className="flex-1 space-y-3">
                  {/* Breadcrumb Skeleton */}
                  <div className="h-4 w-32 bg-dark rounded animate-pulse" />
                  {/* Title Skeleton */}
                  <div className="h-8 w-64 bg-dark rounded animate-pulse" />
                  {/* Categories Skeleton */}
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-dark rounded-full animate-pulse" />
                    <div className="h-6 w-20 bg-dark rounded-full animate-pulse" />
                  </div>
                  {/* Location Skeleton */}
                  <div className="h-4 w-40 bg-dark rounded animate-pulse" />
                </div>
              </div>
              {/* Contact Buttons Skeleton */}
              <div className="mt-6 flex gap-3">
                <div className="h-12 w-32 bg-dark rounded-xl animate-pulse" />
                <div className="h-12 w-32 bg-dark rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="bg-dark-lighter rounded-2xl p-6 border border-muted/20">
              <div className="h-6 w-24 bg-dark rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-dark rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-dark rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-dark rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-dark-lighter rounded-2xl p-6 border border-muted/20">
              <div className="h-6 w-24 bg-dark rounded mb-4 animate-pulse" />
              <div className="space-y-4">
                <div className="h-12 w-full bg-dark rounded animate-pulse" />
                <div className="h-12 w-full bg-dark rounded animate-pulse" />
                <div className="h-12 w-full bg-dark rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
