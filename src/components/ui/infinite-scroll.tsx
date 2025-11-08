'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface InfiniteScrollProps {
  next: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  children: React.ReactNode;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  next,
  hasMore,
  isLoading,
  threshold = 1,
  children,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          next();
        }
      },
      { threshold }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, next, threshold]);

  return <div ref={observerTarget}>{children}</div>;
};

export default InfiniteScroll;
