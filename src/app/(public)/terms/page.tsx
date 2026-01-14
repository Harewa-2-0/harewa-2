"use client"

import { Metadata } from 'next'
import Link from 'next/link'

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-[#D4AF37] transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-600 mb-8">Last Updated: January 14, 2026</p>

                <div className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Welcome to HAREWA ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our fashion-tech platform, including our website, mobile applications, and services (collectively, the "Platform").
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.
                        </p>
                    </section>

                    {/* Account Registration */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Account Registration</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            To access certain features of the Platform, you may be required to create an account. You agree to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Provide accurate, current, and complete information during registration</li>
                            <li>Maintain and promptly update your account information</li>
                            <li>Maintain the security of your password and account</li>
                            <li>Accept all responsibility for activities that occur under your account</li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                        </ul>
                    </section>

                    {/* Services */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Our Services</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            HAREWA provides the following services:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li><strong>Fashion Trends:</strong> Curated insights and trend forecasting</li>
                            <li><strong>E-Commerce:</strong> Ready-to-wear apparel, fabrics, and accessories marketplace</li>
                            <li><strong>AI Stylist:</strong> Personalized fashion recommendations powered by artificial intelligence</li>
                            <li><strong>Custom Design Services:</strong> Bespoke fashion design and customization</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
                        </p>
                    </section>

                    {/* Purchases and Payments */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Purchases and Payments</h2>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Product Listings</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            All product descriptions, images, and prices are subject to change without notice. We make every effort to display accurate information, but we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Pricing</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            All prices are listed in the applicable currency and are subject to change. We reserve the right to correct pricing errors. If a product is listed at an incorrect price, we may cancel any orders placed for that product.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Payment</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Payment must be received before we process your order. We accept various payment methods as indicated on the Platform. By providing payment information, you represent that you are authorized to use the payment method.
                        </p>
                    </section>

                    {/* Shipping and Returns */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Shipping and Returns</h2>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.1 Shipping</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Shipping times and costs vary based on your location and selected shipping method. We are not responsible for delays caused by customs, weather, or other factors beyond our control.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Returns and Refunds</h3>
                        <p className="text-gray-700 leading-relaxed">
                            We accept returns within 14 days of delivery for items in original condition with tags attached. Custom-made and personalized items are not eligible for return. Refunds will be processed to the original payment method within 7-10 business days of receiving the returned item.
                        </p>
                    </section>

                    {/* AI Stylist Service */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. AI Stylist Service</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Our AI Stylist provides personalized fashion recommendations based on your preferences and data you provide. You acknowledge that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Recommendations are generated by artificial intelligence and may not always meet your expectations</li>
                            <li>We do not guarantee the accuracy or suitability of AI-generated recommendations</li>
                            <li>You use AI recommendations at your own discretion</li>
                            <li>We collect and process data to improve AI recommendations as outlined in our Privacy Policy</li>
                        </ul>
                    </section>

                    {/* Intellectual Property */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            All content on the Platform, including text, graphics, logos, images, designs, and software, is the property of HAREWA or its licensors and is protected by copyright, trademark, and other intellectual property laws.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            You may not reproduce, distribute, modify, create derivative works, publicly display, or exploit any content without our express written permission.
                        </p>
                    </section>

                    {/* User Content */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. User Content</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You may submit reviews, comments, photos, and other content ("User Content"). By submitting User Content, you grant HAREWA a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content for marketing and promotional purposes.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            You represent that you own or have the necessary rights to submit User Content and that it does not violate any third-party rights or applicable laws.
                        </p>
                    </section>

                    {/* Prohibited Conduct */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Prohibited Conduct</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe on intellectual property rights</li>
                            <li>Transmit harmful code, viruses, or malware</li>
                            <li>Engage in fraudulent activities or impersonate others</li>
                            <li>Interfere with the Platform's operation or security</li>
                            <li>Scrape, harvest, or collect user data without permission</li>
                            <li>Use the Platform for unauthorized commercial purposes</li>
                        </ul>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, HAREWA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Our total liability for any claims arising from your use of the Platform shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
                        </p>
                    </section>

                    {/* Indemnification */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
                        <p className="text-gray-700 leading-relaxed">
                            You agree to indemnify and hold harmless HAREWA, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform, violation of these Terms, or infringement of any third-party rights.
                        </p>
                    </section>

                    {/* Dispute Resolution */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Dispute Resolution</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration in accordance with the rules of the applicable arbitration association, except where prohibited by law.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            You waive any right to participate in class action lawsuits or class-wide arbitration.
                        </p>
                    </section>

                    {/* Modifications */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Modifications to Terms</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Platform with a new "Last Updated" date. Your continued use of the Platform after changes constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    {/* Termination */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Termination</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may suspend or terminate your account and access to the Platform at any time, with or without cause or notice. Upon termination, your right to use the Platform will immediately cease.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Governing Law</h2>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which HAREWA operates, without regard to conflict of law principles.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have any questions about these Terms, please contact us:
                        </p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <p className="text-gray-700 mb-2"><strong>HAREWA</strong></p>
                            <p className="text-gray-700 mb-2">Email: <a href="mailto:admin@harewa.com" className="text-[#D4AF37] hover:underline">admin@harewa.com</a></p>
                            <p className="text-gray-700">Website: <a href="https://harewa.com" className="text-[#D4AF37] hover:underline">https://harewa.com</a></p>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-16">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                        <p>&copy; {new Date().getFullYear()} HAREWA. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
