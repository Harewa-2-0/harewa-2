'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AdminUnauthorizedPage() {
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();
  const { user, hasHydratedAuth } = useAuthStore();

  const from = useMemo(() => search.get('from') || '/', [search]);
  const reason = useMemo(
    () => search.get('reason') || 'This area is for regular users.',
    [search]
  );

  useEffect(() => {
    if (!hasHydratedAuth) return;

    const on403 = pathname?.startsWith('/403');

    if (!user && !on403) {
      const url = new URL('/signin', window.location.origin);
      url.searchParams.set('returnTo', from);
      router.replace(url.toString());
      return;
    }

    if (user && user.role !== 'admin' && !on403) {
      router.replace('/403');
      return;
    }
  }, [user, hasHydratedAuth, router, from, pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="relative rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl ring-1 ring-black/5 border border-gray-200">
          {/* Top accent */}
          <div className="absolute inset-x-0 -top-[2px] h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-t-2xl" />

          <div className="p-8 md:p-10 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 mb-5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              403 • Admin account detected
            </div>

            {/* Illustration (bigger, no pulse) */}
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
              <Image
                src="/unauthorized.png"
                alt="Access Restricted"
                width={128}
                height={128}
                className=""
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                priority
              />
            </div>

            {/* Headline */}
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              User Access Required
            </h1>

            {/* Subcopy */}
            <p className="mt-3 text-gray-600 leading-relaxed">
              {reason} You’re signed in as an <span className="font-medium">admin</span>.
              {from && (
                <>
                  {' '}You tried to open{' '}
                  <span className="font-mono text-sm px-1.5 py-0.5 rounded bg-gray-100 text-gray-800">
                    {from}
                  </span>.
                </>
              )}
            </p>

            {/* Actions (single-line labels) */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8941F] text-white font-semibold px-5 py-3 transition-colors whitespace-nowrap text-sm md:text-base"
              >
                Go to Admin Dashboard
              </Link>

              <Link
                href={{ pathname: '/signin', query: { returnTo: from || '/' } }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 font-semibold px-5 py-3 transition-colors whitespace-nowrap text-sm md:text-base"
              >
                Sign in as User
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          If you believe this is an error, please contact your workspace administrator.
        </p>
      </div>
    </div>
  );
}
