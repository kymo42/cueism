'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cueism_cookie_consent');
        if (!consent) {
            const timer = setTimeout(() => setShow(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cueism_cookie_consent', 'accepted');
        setShow(false);
    };

    const decline = () => {
        localStorage.setItem('cueism_cookie_consent', 'declined');
        setShow(false);
    };

    return (
        <div className={`cookie-banner ${show ? 'show' : ''}`}>
            <div className="cookie-banner__inner">
                <div className="cookie-banner__text">
                    We use cookies to improve your experience. By using our site, you consent to cookies.{' '}
                    <a href="/privacy-policy" style={{ textDecoration: 'underline' }}>
                        Learn more
                    </a>
                </div>
                <div className="cookie-banner__actions">
                    <button className="btn btn--sm btn--outline" onClick={decline}>
                        Decline
                    </button>
                    <button className="btn btn--sm btn--primary" onClick={accept}>
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
