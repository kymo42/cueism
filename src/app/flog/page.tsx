import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Flog — Golf Rangefinder for Fitbit',
    description: 'FLOG: When you just wanna know how far it is. GPS golf rangefinder app for Fitbit Versa 3 and Sense.',
};

export default function FlogPage() {
    return (
        <>
            {/* Hero */}
            <section className="hero">
                <h1 className="hero__title">Flog</h1>
                <p className="hero__subtitle">
                    when you just wanna know how far it is . . . . !<br />
                    every golfer
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

            {/* Device Compatibility */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                        <a
                            href="https://github.com/kymo42/flog#-device-compatibility"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <h2 style={{ marginTop: 0 }}>⌚ Device Compatibility</h2>
                        </a>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            FLOG is built specifically for the following Fitbit models:
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--space-lg)',
                        maxWidth: '500px',
                        margin: '0 auto var(--space-2xl)',
                    }}>
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                            <h3 style={{ color: 'var(--color-success)' }}>✅ Fitbit Versa 3</h3>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                            <h3 style={{ color: 'var(--color-success)' }}>✅ Fitbit Sense</h3>
                        </div>
                    </div>

                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-md)',
                        background: 'var(--color-accent-light)',
                        borderRadius: 'var(--radius-md)',
                        maxWidth: '500px',
                        margin: '0 auto',
                    }}>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-accent-hover)' }}>
                            ⚠️ <strong>Caution — Other Models:</strong> This app will not work on older models (Versa 1, 2, or Lite)
                            or the newer Google-era watches (Versa 4 or Sense 2) due to Fitbit software limitations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Discover / Features */}
            <section className="section" style={{ background: 'var(--color-surface)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                        <h2 style={{ marginTop: 0 }}>Discover Our Golf Rangefinder Highlights</h2>
                        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                            Learn about how our Fitbit app offers precise distance measurements and
                            intuitive controls to elevate your golfing experience.
                        </p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'var(--space-xl)',
                    }}>
                        <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🎯</div>
                            <h3>Accurate Distance Tracking</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                Instantly measure yardage to the middle of the green for smarter club selection.
                            </p>
                        </div>
                        <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>⌚</div>
                            <h3>Seamless Fitbit Integration</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                Effortlessly sync with your Fitbit device to access distance data on your wrist.
                            </p>
                        </div>
                        <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>👆</div>
                            <h3>User-Friendly Interface</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                Navigate the app with ease, designed for quick use between shots on the course.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section">
                <div className="container container--narrow">
                    <h2 style={{ textAlign: 'center', marginTop: 0 }}>How It Works</h2>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto var(--space-2xl)' }}>
                        Follow these simple steps to easily download and use our golf rangefinder app on your Fitbit.
                        1st time you use the app will be to set the centre of each green, once you do it then it will be there every time you need it.
                    </p>

                    <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
                            <div style={{
                                background: 'var(--color-accent)',
                                color: 'var(--color-white)',
                                fontWeight: 700,
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: 'var(--text-lg)',
                            }}>1</div>
                            <div>
                                <h3 style={{ marginBottom: 'var(--space-xs)' }}>Download the App</h3>
                                <p style={{ margin: 0 }}>
                                    Start by downloading the FLOG app from the Fitbit gallery to access precise golf course distances after setup.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
                            <div style={{
                                background: 'var(--color-accent)',
                                color: 'var(--color-white)',
                                fontWeight: 700,
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: 'var(--text-lg)',
                            }}>2</div>
                            <div>
                                <h3 style={{ marginBottom: 'var(--space-xs)' }}>Sync and Set Up</h3>
                                <p style={{ margin: 0 }}>
                                    Connect the app with your Fitbit device and plot your Home course greens using your watch to mark the centre.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
                            <div style={{
                                background: 'var(--color-accent)',
                                color: 'var(--color-white)',
                                fontWeight: 700,
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: 'var(--text-lg)',
                            }}>3</div>
                            <div>
                                <h3 style={{ marginBottom: 'var(--space-xs)' }}>Enjoy Your Game</h3>
                                <p style={{ margin: 0 }}>
                                    Use the app during your next round to get accurate distance measurements and improve your club selection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section" style={{ background: 'var(--color-surface)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                        <h2 style={{ marginTop: 0 }}>Golfers&apos; Feedback and Insights</h2>
                        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                            Our clients&apos; testimonials speak volumes about our services and commitment.
                            Get an insight into their experiences.
                        </p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 'var(--space-xl)',
                    }}>
                        {/* Testimonial 1 — Che */}
                        <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                                margin: '0 auto var(--space-md)',
                            }}>
                                <img
                                    src="/images/flog/che.jpg"
                                    alt="Che Guevara"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                                &ldquo;The app&apos;s accuracy and ease of use have truly elevated my golfing experience. Highly recommended!&rdquo;
                            </p>
                            <h4 style={{ margin: 0 }}>Che Guevara</h4>
                            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                Amateur Golfer
                            </p>
                        </div>

                        {/* Testimonial 2 — Trump */}
                        <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                                margin: '0 auto var(--space-md)',
                            }}>
                                <img
                                    src="/images/flog/images.jpeg"
                                    alt="Don J Trump"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                                &ldquo;A must-have tool that combines precision and simplicity, helping me make smarter shots every round.&rdquo;
                            </p>
                            <h4 style={{ margin: 0 }}>Don J Trump</h4>
                            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                Golf Enthusiast
                            </p>
                        </div>

                        {/* Testimonial 3 — Fidel */}
                        <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                                margin: '0 auto var(--space-md)',
                            }}>
                                <img
                                    src="/images/flog/fidel_watching.jpeg"
                                    alt="Fidel Castro"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                                &ldquo;This app provides reliable distance measurements that have improved my course strategy dramatically.&rdquo;
                            </p>
                            <h4 style={{ margin: 0 }}>Fidel Castro</h4>
                            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                Professional Coach
                            </p>
                        </div>
                    </div>

                    {/* Fun banner image */}
                    <div style={{
                        marginTop: 'var(--space-2xl)',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        maxWidth: '700px',
                        margin: 'var(--space-2xl) auto 0',
                    }}>
                        <img
                            src="/images/flog/che-castro-putt.jpg"
                            alt="Famous golfers on the green"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>
                </div>
            </section>

            {/* CTA — PDF Download */}
            <section className="section" style={{ background: 'var(--color-primary)', textAlign: 'center', color: 'var(--color-white)' }}>
                <div className="container">
                    <h2 style={{ color: 'var(--color-white)', marginTop: 0 }}>Enhance Your Golf Game with Accurate Data</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto var(--space-xl)', fontSize: 'var(--text-lg)' }}>
                        Discover how our app simplifies distance tracking, boosts your accuracy, and improves
                        every shot on the course. Download and read the PDF below to get started quickly and effortlessly.
                    </p>
                    <a
                        href="/docs/FLOG-User-Manual.pdf"
                        className="btn btn--primary btn--lg"
                        style={{ background: 'var(--color-white)', color: 'var(--color-primary)' }}
                    >
                        Download User Manual (PDF)
                    </a>
                </div>
            </section>
        </>
    );
}
