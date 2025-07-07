'use client';

import { ReactNode } from 'react';
import Header from './header';
import Footer from './footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
