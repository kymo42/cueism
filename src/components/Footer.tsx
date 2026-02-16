import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__grid">
                    <div className="footer__brand">
                        <h3>cueism</h3>
                        <p>
                            Crafting custom 3D-printed billiard gear for every player.
                            Made by humans in Australia with the smallest carbon footprint possible.
                        </p>
                    </div>

                    <div>
                        <h4 className="footer__heading">Shop</h4>
                        <ul className="footer__links">
                            <li><Link href="/shop">All Products</Link></li>
                            <li><Link href="/shop">Chalk Holders</Link></li>
                            <li><Link href="/shop">Racks</Link></li>
                            <li><Link href="/shop">Accessories</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer__heading">Info</h4>
                        <ul className="footer__links">
                            <li><Link href="/about">About</Link></li>
                            <li><Link href="/news">News</Link></li>
                            <li><Link href="/flog">Flog</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer__heading">Legal</h4>
                        <ul className="footer__links">
                            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link href="/returns-policy">Returns Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer__bottom">
                    <span>© {currentYear} cueism. All rights reserved.</span>
                    <div className="footer__social">
                        <a
                            href="https://www.instagram.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
