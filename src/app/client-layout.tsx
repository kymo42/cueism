'use client';

import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CookieConsent from '@/components/CookieConsent';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <CookieConsent />
        </CartProvider>
    );
}
