import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'cueism Privacy Policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
    return (
        <>
            <div className="page-header">
                <h1>Privacy Policy</h1>
            </div>

            <div className="prose">
                <p><strong>Last updated:</strong> January 2025</p>

                <h2>1. Information We Collect</h2>
                <p>
                    When you make a purchase through our store, we collect information necessary to
                    process your order, including your name, shipping address, email address, and
                    payment information. Payment processing is handled securely by Stripe — we never
                    store your credit card details on our servers.
                </p>

                <h2>2. How We Use Your Information</h2>
                <p>We use your personal information to:</p>
                <ul>
                    <li>Process and fulfil your orders</li>
                    <li>Calculate shipping costs via Australia Post</li>
                    <li>Send you order confirmations and shipping updates</li>
                    <li>Respond to your inquiries</li>
                    <li>Send our monthly newsletter (only if you subscribe)</li>
                </ul>

                <h2>3. Third-Party Services</h2>
                <p>We use the following third-party services:</p>
                <ul>
                    <li><strong>Stripe</strong> — for secure payment processing</li>
                    <li><strong>Australia Post</strong> — for shipping rate calculation and delivery</li>
                    <li><strong>Google</strong> — for newsletter management via Google Sheets</li>
                    <li><strong>Cloudflare</strong> — for website hosting and CDN</li>
                </ul>

                <h2>4. Cookies</h2>
                <p>
                    We use essential cookies to maintain your shopping cart state. Analytics cookies
                    are only used with your consent. You can manage your cookie preferences at any time.
                </p>

                <h2>5. Data Retention</h2>
                <p>
                    We retain your order information for accounting and legal purposes as required by
                    Australian law. Newsletter subscriptions can be cancelled at any time.
                </p>

                <h2>6. Your Rights</h2>
                <p>
                    Under the Australian Privacy Act 1988, you have the right to access, correct, or
                    delete your personal information. Contact us at any time to exercise these rights.
                </p>

                <h2>7. Contact</h2>
                <p>
                    For privacy-related inquiries, please contact us through our{' '}
                    <a href="/contact">contact page</a>.
                </p>
            </div>
        </>
    );
}
