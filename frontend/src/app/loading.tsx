// T164: Loading state for root pages
export default function Loading() {
  return (
    <div className="min-h-screen bg-darker flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted">กำลังโหลด...</p>
      </div>
    </div>
  );
}
