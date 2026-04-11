import React from 'react';

interface SkeletonProps {
  count?: number;
  height?: string;
  width?: string;
  className?: string;
  rounded?: boolean;
}

export const SkeletonLine: React.FC<SkeletonProps> = ({
  count = 1,
  height = 'h-4',
  width = 'w-full',
  className = '',
  rounded = false
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} ${width} ${rounded ? 'rounded-full' : 'rounded'} bg-gray-200 animate-pulse ${className}`}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </>
  );
};

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-6 space-y-4 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <SkeletonLine height="h-4" width="w-2/3" />
              <SkeletonLine height="h-3" width="w-1/3" />
            </div>
          </div>
          <SkeletonLine count={2} height="h-3" className="space-y-2" />
          <div className="flex space-x-2">
            <div className="h-6 w-16 rounded-full bg-gray-200" />
            <div className="h-6 w-20 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-4 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <SkeletonLine height="h-4" width="w-1/3" />
            <SkeletonLine height="h-4" width="w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: string; className?: string }> = ({
  size = 'w-8 h-8',
  className = ''
}) => (
  <div className={`flex justify-center items-center ${className}`}>
    <div className={`${size} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`} />
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-6 p-6">
    <SkeletonLine height="h-8" width="w-1/3" />
    <SkeletonCard count={3} />
  </div>
);
