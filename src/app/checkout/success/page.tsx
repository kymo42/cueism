'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    return (
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-4xl) var(--space-lg)', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>✓</div>
            <h1 style={{ color: 'var(--color-success)' }}>Order Confirmed!</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xl)' }}>
                Thank you for your purchase. Your order is being prepared and will
                be 3D printed to perfection.
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2xl)' }}>
                A confirmation email has been sent to your email address.
                {sessionId && (
                    <><br />Order reference: <code>{sessionId.slice(0, 20)}...</code></>
                )}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                <Link href="/shop" className="btn btn--primary">
                    Continue Shopping
                </Link>
                <Link href="/" className="btn btn--outline">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="container" style={{ textAlign: 'center', padding: 'var(--space-4xl)' }}>
                <p>Loading...</p>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
