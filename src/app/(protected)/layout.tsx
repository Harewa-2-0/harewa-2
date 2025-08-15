import PublicLayout from "@/components/Public_C/Layout/public-layout/publiclayout";
import AuthBootstrap from "../auth-bootstrap";

export default function PublicPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthBootstrap />
      <PublicLayout>{children}</PublicLayout>
    </>
  );
}
