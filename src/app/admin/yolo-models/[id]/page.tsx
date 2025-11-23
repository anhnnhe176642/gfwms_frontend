'use client';

import { useParams } from 'next/navigation';
import { ModelDetailView } from '@/components/admin/yolo-model-management/ModelDetailView';

export default function Page() {
  const params = useParams();
  const modelId = params.id as string;

  return <ModelDetailView modelId={modelId} />;
}
