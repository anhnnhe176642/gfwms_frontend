'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { IsLoading } from '@/components/common/IsLoading';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || undefined;

  return <VerifyEmailForm defaultEmail={email} />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<IsLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
