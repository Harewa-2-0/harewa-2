"use client"

import { Metadata } from 'next'
import Link from 'next/link'

export default function PrivacyPolicy() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-600 mb-8">Last Updated: January 14, 2026</p>

                <div className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            At HAREWA ("we," "our," or "us"), we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fashion-tech platform.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            By using our Platform, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our Platform.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Personal Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We collect personal information that you voluntarily provide when you:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li>Create an account (name, email address, password)</li>
                            <li>Make a purchase (billing address, shipping address, payment information)</li>
                            <li>Use our AI Stylist (style preferences, body measurements, fashion interests)</li>
                            <li>Submit custom design requests (design specifications, measurements)</li>
                            <li>Contact customer support (communication history)</li>
                            <li>Subscribe to our newsletter (email address)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Automatically Collected Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            When you access our Platform, we automatically collect:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li>Device information (IP address, browser type, operating system)</li>
                            <li>Usage data (pages visited, time spent, click patterns)</li>
                            <li>Location data (approximate geographic location based on IP address)</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Third-Party Information</h3>
                        <p className="text-gray-700 leading-relaxed">
                            We may receive information about you from third parties, such as social media platforms if you choose to connect your account, payment processors, and analytics providers.
                        </p>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li><strong>Process Transactions:</strong> Fulfill orders, process payments, and arrange shipping</li>
                            <li><strong>Provide AI Services:</strong> Generate personalized fashion recommendations and style suggestions</li>
                            <li><strong>Improve Our Platform:</strong> Analyze usage patterns and enhance user experience</li>
                            <li><strong>Communicate:</strong> Send order confirmations, shipping updates, and customer support responses</li>
                            <li><strong>Marketing:</strong> Send promotional emails, newsletters, and personalized offers (with your consent)</li>
                            <li><strong>Security:</strong> Detect and prevent fraud, unauthorized access, and other illegal activities</li>
                            <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our Terms of Service</li>
                        </ul>
                    </section>

                    {/* How We Share Your Information */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We may share your information with:
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Service Providers</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Third-party vendors who perform services on our behalf, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li>Payment processors</li>
                            <li>Shipping and logistics companies</li>
                            <li>Email service providers</li>
                            <li>Analytics and marketing platforms</li>
                            <li>Cloud hosting providers</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Business Transfers</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            In connection with a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Legal Requirements</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            When required by law, court order, or to protect our rights, property, or safety.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.4 With Your Consent</h3>
                        <p className="text-gray-700 leading-relaxed">
                            We may share your information for other purposes with your explicit consent.
                        </p>
                    </section>

                    {/* Cookies and Tracking */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We use cookies, web beacons, and similar technologies to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li>Remember your preferences and settings</li>
                            <li>Understand how you use our Platform</li>
                            <li>Personalize content and advertisements</li>
                            <li>Analyze traffic and user behavior</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our Platform.
                        </p>
                    </section>

                    {/* Data Security */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We implement appropriate technical and organizational measures to protect your personal information, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Secure server infrastructure</li>
                            <li>Regular security audits and assessments</li>
                            <li>Access controls and authentication mechanisms</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Privacy Rights</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Depending on your location, you may have the following rights:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                            <li><strong>Restriction:</strong> Request limitation on how we process your data</li>
                            <li><strong>Object:</strong> Object to processing of your personal information</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            To exercise these rights, please contact us at <a href="mailto:admin@harewa.com" className="text-[#D4AF37] hover:underline">admin@harewa.com</a>. We will respond to your request within 30 days.
                        </p>
                    </section>

                    {/* Children's Privacy */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Our Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                        </p>
                    </section>

                    {/* International Data Transfers */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Platform, you consent to the transfer of your information to these countries.
                        </p>
                    </section>

                    {/* Third-Party Links */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Third-Party Links</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to review their privacy policies before providing any personal information.
                        </p>
                    </section>

                    {/* California Privacy Rights */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. California Privacy Rights (CCPA)</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li>Right to know what personal information is collected, used, and shared</li>
                            <li>Right to delete personal information</li>
                            <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                            <li>Right to non-discrimination for exercising your privacy rights</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            To exercise these rights, contact us at <a href="mailto:admin@harewa.com" className="text-[#D4AF37] hover:underline">admin@harewa.com</a>.
                        </p>
                    </section>

                    {/* GDPR Rights */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. European Privacy Rights (GDPR)</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li>Right to access your personal data</li>
                            <li>Right to rectification of inaccurate data</li>
                            <li>Right to erasure ("right to be forgotten")</li>
                            <li>Right to restrict processing</li>
                            <li>Right to data portability</li>
                            <li>Right to object to processing</li>
                            <li>Right to withdraw consent</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            You also have the right to lodge a complaint with your local data protection authority.
                        </p>
                    </section>

                    {/* Changes to Privacy Policy */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to This Privacy Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our Platform with a new "Last Updated" date. Your continued use of the Platform after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <p className="text-gray-700 mb-2"><strong>HAREWA</strong></p>
                            <p className="text-gray-700 mb-2">Privacy Officer</p>
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
