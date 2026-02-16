import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop',
    description: 'Browse our range of custom 3D-printed billiard accessories. Made in Australia from recycled materials.',
};

// Real Stripe products — descriptions from Stripe export
const PRODUCTS = [
    {
        slug: 'chalkable',
        name: 'Chalkable',
        price: 'From $5.00',
        description: 'A robust, reliable chalk holder that ensures chalk sees through its full life span. Handles varied chalk sizes with easy removal.',
        badge: 'Popular',
    },
    {
        slug: 'cheatstick',
        name: 'cheatStick',
        price: '$14.00',
        description: 'Execute hard-to-reach shots easily from any angle, including off the cushion. Fits various cues.',
    },
    {
        slug: 'racksafe9',
        name: 'Racksafe9',
        price: '$20.00',
        description: 'Innovative protective case for your Turtle or Magic Rack. Designed for serious rotation pool players.',
    },
    {
        slug: 'racksafe8',
        name: 'RackSafe8',
        price: '$20.00',
        description: 'Precision rack template for 8-ball. Perfect racks every single time.',
    },
];

export default function ShopPage() {
    return (
        <>
            <div className="page-header">
                <h1>Shop</h1>
                <p>
                    Custom 3D-printed billiard accessories. Every piece individually printed,
                    never mass-produced. Made in Australia from recycled materials.
                </p>
            </div>

            <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
                <div className="product-grid">
                    {PRODUCTS.map((product) => (
                        <Link
                            key={product.slug}
                            href={`/shop/${product.slug}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="card">
                                <div className="card__image-wrapper">
                                    <div
                                        className="card__image"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            gap: 'var(--space-sm)',
                                            color: 'var(--color-text-muted)',
                                            fontFamily: 'var(--font-heading)',
                                            background: 'linear-gradient(135deg, #F5F5F4, #E7E5E4)',
                                        }}
                                    >
                                        <span style={{ fontSize: 'var(--text-2xl)' }}>{product.name}</span>
                                        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)' }}>
                                            cueism
                                        </span>
                                    </div>
                                    {product.badge && <span className="card__badge">{product.badge}</span>}
                                </div>
                                <div className="card__body">
                                    <h3 className="card__title">{product.name}</h3>
                                    <p className="card__description">{product.description}</p>
                                    <div className="card__price">
                                        {product.price} <span>gst</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
