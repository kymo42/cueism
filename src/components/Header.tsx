'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
    const { totalItems, setCartOpen } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const navLinks = [
        { href: '/shop', label: 'Shop' },
        { href: '/news', label: 'News' },
        { href: '/about', label: 'About' },
        { href: '/flog', label: 'Flog' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
            <div className="header__inner">
                <Link href="/" className="header__logo">
                    cueism
                </Link>

                <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={pathname === link.href ? 'active' : ''}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="header__actions">
                    <button
                        className="header__cart-btn"
                        onClick={() => setCartOpen(true)}
                        aria-label="Open cart"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="m1 1 4 2 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {totalItems > 0 && (
                            <span className="header__cart-badge">{totalItems}</span>
                        )}
                    </button>

                    <button
                        className="header__menu-toggle"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {mobileOpen ? (
                                <path d="M18 6 6 18M6 6l12 12" />
                            ) : (
                                <>
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile nav panel */}
            {mobileOpen && (
                <div className="header__mobile-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={pathname === link.href ? 'active' : ''}
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}

            <style jsx>{`
        .header__nav--open {
          display: flex;
        }
        .header__mobile-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .header__mobile-nav {
            display: flex;
            flex-direction: column;
            padding: var(--space-md) var(--space-lg) var(--space-lg);
            border-top: 1px solid var(--color-border-light);
          }
          .header__mobile-nav a {
            padding: var(--space-sm) 0;
            font-size: var(--text-base);
            font-weight: 500;
            color: var(--color-secondary);
            text-decoration: none;
          }
          .header__mobile-nav a:hover,
          .header__mobile-nav a.active {
            color: var(--color-accent);
          }
        }
      `}</style>
        </header>
    );
}
