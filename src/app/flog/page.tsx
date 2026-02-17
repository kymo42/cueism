import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Flog — Golf Rangefinder for Fitbit',
    description: 'FLOG: When you just wanna know how far it is. GPS golf rangefinder app for Fitbit Versa 3 and Sense.',
};

export default function FlogPage() {
    return (
        <>
            <section className="hero">
                <h1 className="hero__title">Flog</h1>
                <p className="hero__subtitle">
                    When you just wanna know how far it is . . . . !<br />
                    Every golfer deserves accurate distance data.
                </p>
                <div className="hero__actions">
                    <a
                        href="https://gallery.fitbit.com/details/a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--primary btn--lg"
                    >
                        Download App
                    </a>
                    <a
                        href="https://github.com/kymo42/flog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--outline btn--lg"
                    >
                        View on GitHub
                    </a>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                        <h2 style={{ marginTop: 0 }}>⌚ Device Compatibility</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            FLOG is built specifically for the following Fitbit models:
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', maxWidth: '500px', margin: '0 auto var(--space-2xl)' }}>
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                            <h3 style={{ color: 'var(--color-success)' }}>✅ Fitbit Versa 3</h3>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                            <h3 style={{ color: 'var(--color-success)' }}>✅ Fitbit Sense</h3>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'var(--color-accent-light)', borderRadius: 'var(--radius-md)', maxWidth: '500px', margin: '0 auto' }}>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-accent-hover)' }}>
                            ⚠️ <strong>Caution:</strong> This app will not work on older models (Versa 1, 2, or Lite)
                            or newer Google-era watches (Versa 4 or Sense 2) due to Fitbit software limitations.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section" style={{ background: 'var(--color-surface)' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginTop: 0 }}>Features</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)', marginTop: 'var(--space-xl)' }}>
                        <div>
                            <h3>Accurate Distance Tracking</h3>
                            <p>Instantly measure yardage to the middle of the green for smarter club selection.</p>
                        </div>
                        <div>
                            <h3>Seamless Fitbit Integration</h3>
                            <p>Effortlessly sync with your Fitbit device to access distance data on your wrist.</p>
                        </div>
                        <div>
                            <h3>User-Friendly Interface</h3>
                            <p>Navigate the app with ease, designed for quick use between shots on the course.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container container--narrow">
                    <h2 style={{ textAlign: 'center', marginTop: 0 }}>How It Works</h2>

                    <div style={{ display: 'grid', gap: 'var(--space-xl)', marginTop: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--color-accent)', color: 'var(--color-white)', fontWeight: 700, width: '40px', height: '40px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                            <div>
                                <h3 style={{ marginBottom: 'var(--space-xs)' }}>Download the App</h3>
                                <p style={{ margin: 0 }}>Start by downloading the FLOG app from the Fitbit gallery.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--color-accent)', color: 'var(--color-white)', fontWeight: 700, width: '40px', height: '40px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                            <div>
                                <h3 style={{ marginBottom: 'var(--space-xs)' }}>Sync and Set Up</h3>
                                <p style={{ margin: 0 }}>Connect with your Fitbit and plot your home course greens using your watch to mark the centre.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--color-accent)', color: 'var(--color-white)', fontWeight: 700, width: '40px', height: '40px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
                            <div>
                                <h3 style={{ marginBottom: 'var(--space-xs)' }}>Enjoy Your Game</h3>
                                <p style={{ margin: 0 }}>Use the app during your next round to get accurate distance measurements and improve your club selection.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section" style={{ background: 'var(--color-primary)', textAlign: 'center', color: 'var(--color-white)' }}>
                <div className="container">
                    <h2 style={{ color: 'var(--color-white)', marginTop: 0 }}>Enhance Your Golf Game</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto var(--space-xl)' }}>
                        Discover how FLOG simplifies distance tracking, boosts your accuracy, and improves every shot on the course.
                    </p>
                    <a
                        href="/docs/FLOG-User-Manual.pdf"
                        className="btn btn--primary btn--lg"
                    >
                        Download User Manual (PDF)
                    </a>
                </div>
            </section>
        </>
    );
}
