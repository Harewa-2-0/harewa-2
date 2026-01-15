'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-6 px-8">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        {/* Left: Logo + Socials */}
        <div className="w-full md:w-[30%] space-y-4">
          <Image src="/logo.webp" alt="Harewa Logo" width={120} height={40} />
          <p className="text-sm">Follow us on social media</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#FFE181] transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-[#FFE181] transition">
              <MessageSquare size={20} />
            </a>
            <a href="#" className="hover:text-[#FFE181] transition">
              <Instagram size={20} />
            </a>
          </div>
        </div>

        {/* Right: 4 Columns */}
        <div className="w-full md:w-[65%] grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/home" className="hover:text-[#FFE181] transition">About Us</Link></li>
              <li><Link href="/home" className="hover:text-[#FFE181] transition">Help Centre</Link></li>
              <li><Link href="/home" className="hover:text-[#FFE181] transition">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link href="/shop" className="hover:text-[#FFE181] transition">Ready to Wear</Link></li>
              <li><Link href="/trending-fashion" className="hover:text-[#FFE181] transition">Trending Fashion</Link></li>
              <li><Link href="/home" className="hover:text-[#FFE181] transition">Designers</Link></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:admin@harewa.com" className="hover:text-[#FFE181] transition">
                  admin@harewa.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+16789076332" className="hover:text-[#FFE181] transition">
                  +1.678.907.6332
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  3099 Loring Rd NW<br />
                  Kennesaw, GA 30152, USA
                </span>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-3">Payment</h4>
            <div className="flex flex-row sm:flex-row md:flex-col items-center sm:items-center md:items-start gap-3">
              <Image src="/mastercard.svg" alt="Mastercard" width={40} height={30} />
              <Image src="/interswitch.svg" alt="Interswitch" width={65} height={35} />
              <Image src="/paystack.svg" alt="Paystack" width={65} height={35} />
              <Image src="/visa.svg" alt="Visa" width={40} height={30} />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-white/40" />

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto text-sm flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 px-2">
        <span className="text-gray-400">© 2026 HAREWA. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-[#FFE181] transition text-gray-300">Terms and Conditions</Link>
          <span className="text-gray-600">|</span>
          <Link href="/privacy" className="hover:text-[#FFE181] transition text-gray-300">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
