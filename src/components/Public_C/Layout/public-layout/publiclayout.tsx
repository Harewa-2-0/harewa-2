'use client';

import { ReactNode } from 'react';
import Header from '../header/header';
import Footer from '../footer/footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
