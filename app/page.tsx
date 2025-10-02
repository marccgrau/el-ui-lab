// app/page.tsx  ←  stays a Server Component (no 'use client')
import { Suspense } from 'react';
import HomeClient from '@/components/cards/HomeClient';

export default function Page() {
  return (
    <Suspense fallback={null /* or a skeleton */}>
      <HomeClient /> {/* calls useSearchParams inside */}
    </Suspense>
  );
}
