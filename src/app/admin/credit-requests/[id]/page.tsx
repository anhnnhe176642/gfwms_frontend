import { CreditRequestDetailContent } from './CreditRequestDetailContent';

export default async function CreditRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <CreditRequestDetailContent id={id} />;
}
