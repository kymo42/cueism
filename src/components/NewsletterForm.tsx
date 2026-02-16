'use client';

import { useState } from 'react';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <section className="newsletter-section">
            <h2>Stay in the Loop</h2>
            <p>Get the monthly billiard news roundup and product updates delivered to your inbox.</p>
            {status === 'success' ? (
                <p style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                    ✓ Thanks for subscribing!
                </p>
            ) : (
                <form className="newsletter-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={status === 'loading'}
                    />
                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </form>
            )}
            {status === 'error' && (
                <p style={{ color: '#FCA5A5', marginTop: 'var(--space-sm)', fontSize: 'var(--text-sm)' }}>
                    Something went wrong. Please try again.
                </p>
            )}
        </section>
    );
}
