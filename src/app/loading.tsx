export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <div className="h-5 w-28 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </main>
    </div>
  );
}
