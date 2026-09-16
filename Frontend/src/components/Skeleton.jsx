import React from 'react';

export const SkeletonBase = ({ className, style }) => (
  <div 
    className={`relative overflow-hidden bg-gray-50 dark:bg-gray-700/40 rounded-md ${className}`} 
    style={style}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white dark:via-gray-600/30 to-transparent" />
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-50 dark:border-gray-700/50 shadow-sm space-y-3">
    <SkeletonBase className="aspect-square w-full rounded-none" />
    <div className="p-3 space-y-3">
      <div className="flex gap-1">
        {Array(5).fill(0).map((_, i) => (
          <SkeletonBase key={i} className="h-3 w-3 rounded-full" />
        ))}
      </div>
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <SkeletonBase className="h-6 w-16" />
        <SkeletonBase className="h-6 w-12 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white dark:bg-gray-800/30 rounded-xl border border-gray-50 dark:border-gray-700/50 overflow-hidden shadow-sm">
    <div className="bg-gray-50/50 dark:bg-gray-700/30 p-4 border-b border-gray-50 dark:border-gray-700/50 flex gap-4">
      {Array(cols).fill(0).map((_, i) => (
        <SkeletonBase key={i} className="h-4 flex-1" />
      ))}
    </div>
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="p-4 flex gap-4">
          {Array(cols).fill(0).map((_, j) => (
            <SkeletonBase key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm h-full">
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <SkeletonBase className="h-6 w-40" />
        <SkeletonBase className="h-4 w-24" />
      </div>
      <SkeletonBase className="h-8 w-24 rounded-lg" />
    </div>
    <div className="h-64 flex items-end gap-3 px-2">
      {Array(12).fill(0).map((_, i) => (
        <SkeletonBase key={i} className="flex-1" style={{ height: `${Math.random() * 60 + 30}%`, opacity: 0.5 + (i * 0.04) }} />
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <SkeletonBase className="h-8 w-48" />
        <SkeletonBase className="h-4 w-64" />
      </div>
      <SkeletonBase className="h-10 w-32 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SkeletonBase className="h-32 w-full rounded-xl" />
      <SkeletonBase className="h-32 w-full rounded-xl" />
      <SkeletonBase className="h-32 w-full rounded-xl" />
      <SkeletonBase className="h-32 w-full rounded-xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonChart />
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800/40 rounded-xl p-6 border border-gray-50 dark:border-gray-700/50 shadow-sm h-full space-y-6">
          <SkeletonBase className="h-6 w-32" />
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <SkeletonBase className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonBase className="h-4 w-full" />
                  <SkeletonBase className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
