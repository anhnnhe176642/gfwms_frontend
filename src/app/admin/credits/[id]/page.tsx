'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreditRegistrationDetailView } from '@/components/admin/credit-registration-management';
import { ROUTES } from '@/config/routes';

export default function CreditRegistrationDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.CREDITS.DETAIL}>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <CreditRegistrationDetailView registrationId={id} />
      </div>
    </ProtectedRoute>
  );
}
