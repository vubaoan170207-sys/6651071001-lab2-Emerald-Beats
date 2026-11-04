import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div
      className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between shadow-lg animate-pulse"
      aria-hidden="true"
    >
      <div>
        {/* Cover Skeleton */}
        <div className="relative aspect-square w-full rounded-xl bg-slate-700/70 mb-4 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
        </div>

        {/* Title & Artist Skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-5 bg-slate-700/80 rounded-md w-3/4" />
          <div className="h-4 bg-slate-700/50 rounded-md w-1/2" />
        </div>

        {/* Genre & Album Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 bg-slate-700/60 rounded-full w-20" />
          <div className="h-4 bg-slate-700/40 rounded-md w-24" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
        <div className="h-5 bg-slate-700/70 rounded-md w-20" />
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-slate-700/80" />
          <div className="w-9 h-9 rounded-full bg-slate-700/80" />
        </div>
      </div>
    </div>
  );
};
