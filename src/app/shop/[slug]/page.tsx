'use client';

import { useCart } from '@/components/CartProvider';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Real Stripe products — descriptions from Stripe export
// Prices will come from Stripe Prices API once keys are configured
const PRODUCT_DATA: Record<string, {
    stripeId: string;
    name: string;
    description: string;
    features: string[];
    price: number; // cents — placeholder until Stripe prices are fetched
    priceDisplay: string;
    category: string;
    variants?: { id: string; name: string; price: number }[];
}> = {
    chalkable: {
        stripeId: 'prod_TzE3cuqSIEkMdp',
        name: 'Chalkable',
        description: 'Chalkable is a robust, reliable solution that ensures a piece of chalk will see through its full life span and the player won\'t be kicking around a rubber thing on the floor. Although a rigid format, Chalkable will handle a varied size of chalks — for the small one a little electrical tape works. The design allows for the larger blocks by reducing the overall surface area of contact and the massive opening at the bottom will make removal easy every time.',
        features: [
            'Handles varied chalk sizes — small to large blocks',
            'Massive bottom opening for easy chalk removal',
            'Rigid format for durability and reliability',
            'Printed from recycled PET',
        ],
        price: 500,
        priceDisplay: 'From $5.00',
        category: 'Chalk Holders',
    },
    cheatstick: {
        stripeId: 'prod_TzDsrqMVLdK7qP',
        name: 'cheatStick',
        description: 'Sick of the nasty shots against the rail? Execute your hard-to-reach shots easily from any angle, including off the cushion.',
        features: [
            'Intuitive design handles all angles and heights, even off the rail',
            'Fits on various cues, not just your break cue',
            'Have your initials, numbers, or icons printed on it',
            'Environmentally conscious — printed from recycled PET',
            'Fits snugly into any pool bag',
        ],
        price: 1400,
        priceDisplay: '$14.00',
        category: 'Cueing',
    },
    racksafe9: {
        stripeId: 'prod_TzDi5si4JukLvf',
        name: 'Racksafe9',
        description: 'Trying to protect your Turtle or Magic Rack from getting nicked, lost, or bent is kinda frustrating. Innovative protective case designed for all serious rotation pool players.',
        features: [
            'Locally made — handcrafted in Sydney',
            'Convenient portability — designed to hang off your bag',
            'Can be equipped with an RFID chip for your digital contact info',
            'Have your name, text, or initials printed on it',
            'Choose an individual icon from Google Material Icons',
            'Treat yourself!',
        ],
        price: 2000,
        priceDisplay: '$20.00',
        category: 'Accessories',
    },
    racksafe8: {
        stripeId: 'prod_RackSafe8', // Update with real Stripe product ID
        name: 'RackSafe8',
        description: 'Precision rack template for 8-ball. Get perfect racks every single time with this precisely engineered template. No more loose racks or unfair breaks.',
        features: [
            'Precision-engineered for perfect 8-ball racks',
            'Durable 3D-printed construction',
            'Lightweight and portable',
            'Made from recycled materials',
            'Made in Australia',
        ],
        price: 2000,
        priceDisplay: '$20.00',
        category: 'Racks',
    },
};

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const product = PRODUCT_DATA[slug];

    const [selectedVariant, setSelectedVariant] = useState(
        product?.variants?.[0]?.id || ''
    );
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();

    if (!product) {
        return (
            <div className="container" style={{ padding: 'var(--space-4xl) var(--space-lg)', textAlign: 'center' }}>
                <h1>Product not found</h1>
                <p>The product you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/shop" className="btn btn--primary" style={{ marginTop: 'var(--space-lg)' }}>
                    Back to Shop
                </Link>
            </div>
        );
    }

    const currentPrice = product.variants
        ? product.variants.find((v) => v.id === selectedVariant)?.price || product.price
        : product.price;

    const currentVariantName = product.variants
        ? product.variants.find((v) => v.id === selectedVariant)?.name
        : undefined;

    const handleAddToCart = () => {
        addItem({
            productId: slug,
            priceId: `placeholder_${slug}_${selectedVariant || 'default'}`,
            name: product.name,
            variant: currentVariantName,
            price: currentPrice,
            quantity,
        });
    };

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
        }).format(cents / 100);
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)' }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: 'var(--space-xl)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                <Link href="/" style={{ color: 'var(--color-text-muted)' }}>Home</Link>
                {' / '}
                <Link href="/shop" style={{ color: 'var(--color-text-muted)' }}>Shop</Link>
                {' / '}
                <span style={{ color: 'var(--color-primary)' }}>{product.name}</span>
            </div>

            <div className="product-detail">
                {/* Image */}
                <div className="product-detail__gallery">
                    <div
                        className="product-detail__main-image"
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
                        <span style={{ fontSize: 'var(--text-4xl)' }}>{product.name}</span>
                        <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)' }}>cueism</span>
                    </div>
                </div>

                {/* Info */}
                <div className="product-detail__info">
                    <div className="product-detail__category">{product.category}</div>
                    <h1 className="product-detail__title">{product.name}</h1>
                    <div className="product-detail__price">
                        {formatPrice(currentPrice)} <span>inc. GST</span>
                    </div>

                    <p className="product-detail__description">{product.description}</p>

                    {/* Features */}
                    <div className="product-detail__description">
                        <ul>
                            {product.features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Variants */}
                    {product.variants && (
                        <div className="product-detail__variants">
                            <label>Select Option</label>
                            <div className="product-detail__variant-options">
                                {product.variants.map((variant) => (
                                    <button
                                        key={variant.id}
                                        className={`product-detail__variant-btn ${selectedVariant === variant.id ? 'active' : ''
                                            }`}
                                        onClick={() => setSelectedVariant(variant.id)}
                                    >
                                        {variant.name} — {formatPrice(variant.price)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add to cart */}
                    <div className="product-detail__add-to-cart">
                        <div className="quantity-selector">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                        <button className="btn btn--primary btn--lg" onClick={handleAddToCart}>
                            Add to Cart — {formatPrice(currentPrice * quantity)}
                        </button>
                    </div>

                    <div className="product-detail__stock">
                        In stock — made to order
                    </div>
                </div>
            </div>
        </div>
    );
}
