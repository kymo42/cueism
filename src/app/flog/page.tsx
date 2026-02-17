import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Flog — Golf Rangefinder for Fitbit',
    description: 'FLOG: When you just wanna know how far it is. GPS golf rangefinder app for Fitbit Versa 3 and Sense.',
};

export default function FlogPage() {
    return (
        <>
            {/* Hero — split layout */}
            <section style={{
                padding: 'var(--space-3xl) 0',
                background: 'var(--color-bg)',
            }}>
                <div className="container" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-2xl)',
                    alignItems: 'center',
                }}>
                    {/* Left — text content */}
                    <div>
                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                            fontStyle: 'italic',
                            marginTop: 0,
                            marginBottom: 'var(--space-xl)',
                        }}>Flog</h1>

                        <div style={{
                            background: 'var(--color-surface)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-lg)',
                            marginBottom: 'var(--space-xl)',
                        }}>
                            <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                                when you just wanna know how far it is . . . . !
                            </p>
                            <p style={{ margin: 'var(--space-xs) 0 0', color: 'var(--color-text-muted)' }}>
                                every golfer
                            </p>
                        </div>

                        <h3 style={{ marginBottom: 'var(--space-sm)', fontSize: 'var(--text-sm)' }}>
                            ⌚ Device Compatibility
                        </h3>
                        <p style={{ margin: '0 0 var(--space-sm)', fontSize: 'var(--text-sm)' }}>
                            <strong>FLOG</strong> is built specifically for the following Fitbit models:
                        </p>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 var(--space-md)',
                            fontSize: 'var(--text-sm)',
                        }}>
                            <li>✅ Fitbit Versa 3</li>
                            <li>✅ Fitbit Sense</li>
                        </ul>

                        <p style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-accent-hover)',
                            marginBottom: 'var(--space-xs)',
                        }}>
                            <strong>Caution</strong>
                        </p>
                        <p style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--space-xl)',
                        }}>
                            <strong>Other models:</strong> This app will not work on older models (Versa 1, 2,
                            or Lite) or the newer Google-era watches (Versa 4 or Sense 2) due
                            to Fitbit software limitations.
                        </p>

                        <a
                            href="https://gallery.fitbit.com/details/a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--primary"
                        >
                            Download App
                        </a>
                    </div>

                    {/* Right — hero image */}
                    <div style={{
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                    }}>
                        <img
                            src="/images/flog/6PVBZKUQOZAIVI26G3X2BSO7FY.webp"
                            alt="Golfer on the course"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Discover / Features — photos above text */}
            <section style={{
                padding: 'var(--space-3xl) 0',
                background: 'var(--color-surface)',
            }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                        <h2 style={{ marginTop: 0 }}>Discover Our Golf<br />Rangefinder Highlights</h2>
                        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                            Learn about how our Fitbit app offers precise distance measurements and
                            intuitive controls to elevate your golfing experience.
                        </p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--space-xl)',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                aspectRatio: '4/3',
                                marginBottom: 'var(--space-md)',
                            }}>
                                <img
                                    src="/images/flog/_89865295_89865294.jpg"
                                    alt="Accurate Distance Tracking"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <h3 style={{ marginBottom: 'var(--space-xs)' }}>Accurate Distance Tracking</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                Instantly measure yardage to the middle of the green for smarter club selection.
                            </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                aspectRatio: '4/3',
                                marginBottom: 'var(--space-md)',
                            }}>
                                <img
                                    src="/images/flog/che-castro-putt.jpg"
                                    alt="Seamless Fitbit Integration"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <h3 style={{ marginBottom: 'var(--space-xs)' }}>Seamless Fitbit Integration</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                Effortlessly sync with your Fitbit device to access distance data on your wrist.
                            </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                aspectRatio: '4/3',
                                marginBottom: 'var(--space-md)',
                            }}>
                                <img
                                    src="/images/flog/32980320-4977-48b6-a84f-81e48e26a4c5_570.jpeg"
                                    alt="User-Friendly Interface"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <h3 style={{ marginBottom: 'var(--space-xs)' }}>User-Friendly Interface</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                Navigate the app with ease, designed for quick use between shots on the course.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works — horizontal 3-column */}
            <section style={{ padding: 'var(--space-3xl) 0' }}>
                <div className="container">
                    <h2 style={{ marginTop: 0 }}>How It Works</h2>
                    <p style={{
                        color: 'var(--color-text-muted)',
                        maxWidth: '700px',
                        marginBottom: 'var(--space-2xl)',
                    }}>
                        Follow these simple steps to easily download and use our golf rangefinder app
                        on your Fitbit. 1st time you use the app will be to set the centre of each green,
                        once you do it then it will be there every time you need it.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--space-xl)',
                    }}>
                        <div>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-full)',
                                border: '2px solid var(--color-text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 'var(--text-lg)',
                                marginBottom: 'var(--space-md)',
                            }}>①</div>
                            <h3 style={{ marginBottom: 'var(--space-xs)' }}>Step One: Download the App</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                Start by downloading the flog app from the Fitbit gallery to access precise
                                golf course distances after setup.
                            </p>
                        </div>
                        <div>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-full)',
                                border: '2px solid var(--color-text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 'var(--text-lg)',
                                marginBottom: 'var(--space-md)',
                            }}>②</div>
                            <h3 style={{ marginBottom: 'var(--space-xs)' }}>Step Two: Sync and Set Up</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                Connect the app with your Fitbit device and plot your Home course greens
                                using your watch to mark the centre.
                            </p>
                        </div>
                        <div>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-full)',
                                border: '2px solid var(--color-text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 'var(--text-lg)',
                                marginBottom: 'var(--space-md)',
                            }}>③</div>
                            <h3 style={{ marginBottom: 'var(--space-xs)' }}>Step Three: Enjoy Your Game</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                Use the app during your next round to get accurate distance measurements
                                and improve your club selection.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials — dark background */}
            <section style={{
                padding: 'var(--space-3xl) 0',
                background: '#1A1A1A',
                color: 'var(--color-white)',
            }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                        <h2 style={{ color: 'var(--color-white)', marginTop: 0 }}>
                            Golfers&apos; Feedback and Insights
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
                            Our clients&apos; testimonials speak volumes about our services and commitment.
                            Get an insight into their experiences.
                        </p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--space-xl)',
                    }}>
                        {/* Testimonial 1 — Che */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#FFD700', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-sm)', letterSpacing: '2px' }}>
                                ★★★★★
                            </div>
                            <p style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: 'var(--text-sm)',
                                lineHeight: 1.7,
                                marginBottom: 'var(--space-lg)',
                            }}>
                                The app&apos;s accuracy and ease of use have truly elevated my golfing experience. Highly recommended!
                            </p>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                                margin: '0 auto var(--space-xs)',
                            }}>
                                <img
                                    src="/images/flog/che.jpg"
                                    alt="Che Guevara"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)' }}>Che Guevara</p>
                            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)' }}>
                                Amateur Golfer
                            </p>
                        </div>

                        {/* Testimonial 2 — Trump */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#FFD700', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-sm)', letterSpacing: '2px' }}>
                                ★★★★★
                            </div>
                            <p style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: 'var(--text-sm)',
                                lineHeight: 1.7,
                                marginBottom: 'var(--space-lg)',
                            }}>
                                A must-have tool that combines precision and simplicity, helping me make smarter shots every round.
                            </p>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                                margin: '0 auto var(--space-xs)',
                            }}>
                                <img
                                    src="/images/flog/images.jpeg"
                                    alt="Don J Trump"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)' }}>Don J Trump</p>
                            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)' }}>
                                Golf Enthusiast
                            </p>
                        </div>

                        {/* Testimonial 3 — Fidel */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#FFD700', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-sm)', letterSpacing: '2px' }}>
                                ★★★★★
                            </div>
                            <p style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: 'var(--text-sm)',
                                lineHeight: 1.7,
                                marginBottom: 'var(--space-lg)',
                            }}>
                                This app provides reliable distance measurements that have improved my course strategy dramatically.
                            </p>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                                margin: '0 auto var(--space-xs)',
                            }}>
                                <img
                                    src="/images/flog/fidel_watching.jpeg"
                                    alt="Fidel Castro"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)' }}>Fidel Castro</p>
                            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)' }}>
                                Professional Coach
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA — PDF Download */}
            <section style={{
                padding: 'var(--space-3xl) 0',
                background: '#111',
                color: 'var(--color-white)',
            }}>
                <div className="container" style={{ maxWidth: '600px' }}>
                    <h2 style={{
                        color: 'var(--color-white)',
                        marginTop: 0,
                        lineHeight: 1.3,
                    }}>
                        Enhance Your Golf<br />Game with accurate data
                    </h2>
                    <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: 'var(--space-xl)',
                        lineHeight: 1.7,
                    }}>
                        Discover how our app simplifies distance tracking, boosts your accuracy, and improves
                        every shot on the course. Download and read the PDF below to get started quickly and effortlessly.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                        <a
                            href="/docs/FLOG-User-Manual.pdf"
                            style={{
                                color: 'var(--color-white)',
                                textDecoration: 'underline',
                                fontSize: 'var(--text-sm)',
                            }}
                        >
                            FLOG User Manual
                        </a>
                        <a
                            href="/docs/FLOG-User-Manual.pdf"
                            download
                            style={{
                                color: 'var(--color-white)',
                                textDecoration: 'underline',
                                fontSize: 'var(--text-sm)',
                            }}
                        >
                            Download
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
