import CustomizationDetailPage from '@/components/Protected/admin/pages/customizations/CustomizationDetailPage';

interface CustomizationDetailRouteProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ customerName?: string; customerEmail?: string }>;
}

export default async function CustomizationDetailRoute({ params, searchParams }: CustomizationDetailRouteProps) {
  const { id } = await params;
  const { customerName, customerEmail } = await searchParams;
  
  return (
    <CustomizationDetailPage 
      customizationId={id} 
      customerName={customerName}
      customerEmail={customerEmail}
    />
  );
}
