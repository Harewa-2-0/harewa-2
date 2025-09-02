import { ReactNode } from 'react';
import AdminLayout from '@/components/protected/admin/layout/AdminLayout';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: AdminLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
