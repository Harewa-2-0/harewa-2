'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';

export default function AnnouncementBar() {
  const {
    isAnnouncementVisible,           // user hasn't manually closed it
    hideAnnouncement,
    resetAnnouncement,
    isAnnouncementHiddenByScroll,    // hidden due to scroll
    hideAnnouncementByScroll,
    showAnnouncementByScroll,
  } = useUIStore();

  const barRef = useRef<HTMLDivElement | null>(null);

  // Debug
  // console.log('AnnouncementBar - isAnnouncementVisible:', isAnnouncementVisible);
  // console.log('AnnouncementBar - isAnnouncementHiddenByScroll:', isAnnouncementHiddenByScroll);

  // Reset announcement state on full page refresh
  useEffect(() => {
    resetAnnouncement();
    // initialize based on current scroll position (SSR safe: runs on client)
    const y = window.scrollY || 0;
    if (y > 120) hideAnnouncementByScroll();
    else showAnnouncementByScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Smooth & stable scroll behavior (hysteresis + rAF throttle)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    // Hysteresis to avoid threshold flapping
    const HIDE_AFTER = 120; // hide when scrolling down & past this
    const SHOW_BEFORE = 60; // show again when above this (smaller) level

    const update = () => {
      const current = window.scrollY;

      // direction
      const scrollingDown = current > lastScrollY;

      if (scrollingDown && current > HIDE_AFTER) {
        hideAnnouncementByScroll();
      } else if (!scrollingDown && current < SHOW_BEFORE) {
        showAnnouncementByScroll();
      }

      lastScrollY = current;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hideAnnouncementByScroll, showAnnouncementByScroll]);

  // Final visibility
  const shouldShowAnnouncement = isAnnouncementVisible && !isAnnouncementHiddenByScroll;

  // --- Keep a CSS var with the *actual* height so nav can offset correctly
  const setCssHeight = (px: number) => {
    document.documentElement.style.setProperty('--announcement-height', `${px}px`);
  };

  // Measure height when shown/hidden and on resize (useLayoutEffect to avoid layout jump)
  useLayoutEffect(() => {
    const el = barRef.current;
    const apply = () => setCssHeight(shouldShowAnnouncement && el ? el.offsetHeight : 0);

    apply();

    if (!el) return;

    // ResizeObserver to respond to content/line-wrap changes
    const ro = (window as any).ResizeObserver ? new (window as any).ResizeObserver(() => apply()) : null;
    ro?.observe(el);

    // Also update on window resize (breakpoints / font sizing)
    const onResize = () => apply();
    window.addEventListener('resize', onResize);

    return () => {
      ro?.disconnect?.();
      window.removeEventListener('resize', onResize);
    };
  }, [shouldShowAnnouncement]);

  return (
    <AnimatePresence initial={false}>
      {shouldShowAnnouncement && (
        <motion.div
          ref={barRef}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 w-full bg-white text-black text-sm md:text-base py-2 px-4 flex items-center justify-center z-50 border-b border-gray-200"
        >
          <p className="text-center max-w-full">
            🔥 Promo Sales for Ready-made Agbada – Use Code{' '}
            <span className="font-semibold text-[#D4AF37]">AJJ346A1</span>
            &nbsp;
            <a href="/shop" className="underline hover:text-[#D4AF37] text-[#D4AF37]">
              Shop Now
            </a>
          </p>

          <button
            onClick={hideAnnouncement}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
            aria-label="Close announcement"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
