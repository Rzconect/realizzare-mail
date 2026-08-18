export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col space-y-6 animate-fadeIn">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200/80 rounded-md animate-pulse" />
          <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-9 w-32 bg-indigo-200/60 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Main Content Area Skeleton Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-72 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 w-36 bg-slate-100 rounded-xl animate-pulse" />
        </div>

        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-slate-200 rounded" />
                <div className="h-4 w-40 bg-slate-200 rounded-md" />
              </div>
              <div className="h-4 w-52 bg-slate-200 rounded-md" />
              <div className="h-4 w-24 bg-slate-200 rounded-md" />
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
              <div className="h-4 w-20 bg-slate-200 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
