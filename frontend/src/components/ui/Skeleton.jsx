import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return <div className={`skeleton rounded-2xl ${className}`} {...props} />;
}

export function SkeletonCard() {
  return (
    <div className="soft-card p-5 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="soft-card p-6 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="flex gap-3">
        <Skeleton className="h-3 flex-1 rounded-full" />
        <Skeleton className="h-3 flex-1 rounded-full" />
        <Skeleton className="h-3 flex-1 rounded-full" />
      </div>
    </div>
  );
}

export default Skeleton;
