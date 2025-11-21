import CustomizationDetailPage from '@/components/Protected/admin/pages/customizations/CustomizationDetailPage';

interface CustomizationDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default async function CustomizationDetailRoute({ params }: CustomizationDetailRouteProps) {
  const { id } = await params;
  return <CustomizationDetailPage customizationId={id} />;
}
