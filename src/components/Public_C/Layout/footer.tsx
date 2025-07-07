'use client';

import Image from 'next/image';
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
              <li><a href="#" className="hover:text-[#FFE181] transition">About Us</a></li>
              <li><a href="#" className="hover:text-[#FFE181] transition">Help Centre</a></li>
              <li><a href="#" className="hover:text-[#FFE181] transition">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#FFE181] transition">Ready to Wear</a></li>
              <li><a href="#" className="hover:text-[#FFE181] transition">Trending Fashion</a></li>
              <li><a href="#" className="hover:text-[#FFE181] transition">Designers</a></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail size={16} /> support@harewa.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} /> +234 800 000 0000
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} /> Lagos, Nigeria
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
      <div className="max-w-7xl mx-auto text-sm flex flex-col md:flex-row justify-center items-center gap-8 px-2">
        <span>© 2025 HAREWA</span>
        <div className="flex items-center gap-4">
          <span>All Rights Reserved</span>
          <span className="hidden md:inline">|</span>
          <a href="#" className="text-blue-400 hover:text-blue-300 transition">Terms and Conditions</a>
          <span className="hidden md:inline">|</span>
          <a href="#" className="text-blue-400 hover:text-blue-300 transition">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
