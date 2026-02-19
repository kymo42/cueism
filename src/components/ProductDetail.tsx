'use client';

import { useCart } from '@/components/CartProvider';
import { useState } from 'react';
import Link from 'next/link';
import { ProductInfo } from '@/lib/products';

interface ProductDetailProps {
    product: ProductInfo;
    slug: string;
}

export default function ProductDetail({ product, slug }: ProductDetailProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedPack, setSelectedPack] = useState(product?.packVariants?.[0]?.id || '');
    const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.id || '');
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();

    if (!product) return null;

    // ——— Price calculation ———
    const basePrice = product.packVariants
        ? product.packVariants.find((v) => v.id === selectedPack)?.price || product.price
        : product.price;

    const addOnTotal = product.addOns
        ? product.addOns
            .filter((a) => selectedAddOns.includes(a.id))
            .reduce((sum, a) => sum + a.price, 0)
        : 0;

    const unitPrice = basePrice + addOnTotal;
    const totalPrice = unitPrice * quantity;

    // Savings for packs
    const packSavings = (() => {
        if (!product.packVariants) return null;
        const pack = product.packVariants.find((v) => v.id === selectedPack);
        if (!pack) return null;
        const singlePrice = product.packVariants[0].price;
        const packCount = pack.id === 'single' ? 1 : pack.id === '5pack' ? 5 : pack.id === '10pack' ? 10 : 20;
        if (packCount <= 1) return null;
        const fullPrice = singlePrice * packCount;
        const saved = fullPrice - pack.price;
        return saved > 0 ? saved : null;
    })();

    const selectedPackName = product.packVariants?.find((v) => v.id === selectedPack)?.name;
    const selectedColorName = product.colors?.find((c) => c.id === selectedColor)?.name;

    const toggleAddOn = (id: string) => {
        setSelectedAddOns((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
        );
    };

    const handleAddToCart = () => {
        const variantParts = [selectedPackName, selectedColorName].filter(Boolean);
        addItem({
            productId: slug,
            priceId: `placeholder_${slug}_${selectedPack || selectedColor || 'default'}`,
            name: product.name,
            variant: variantParts.length ? variantParts.join(' / ') : undefined,
            price: unitPrice,
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
                {/* Image Gallery */}
                <div className="product-detail__gallery">
                    <div
                        className="product-detail__main-image"
                        style={{ overflow: 'hidden', background: '#F5F5F4' }}
                    >
                        <img
                            src={product.images[selectedImage]}
                            alt={`${product.name} — image ${selectedImage + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)', flexWrap: 'wrap' }}>
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 'var(--radius-sm)',
                                        overflow: 'hidden',
                                        border: selectedImage === i
                                            ? '2px solid var(--color-primary)'
                                            : '2px solid transparent',
                                        cursor: 'pointer',
                                        padding: 0,
                                        background: '#F5F5F4',
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} thumbnail ${i + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="product-detail__info">
                    <div className="product-detail__category">{product.category}</div>
                    <h1 className="product-detail__title">{product.name}</h1>

                    {/* Dynamic price display */}
                    <div className="product-detail__price">
                        {formatPrice(unitPrice)} <span>inc. GST</span>
                    </div>
                    {packSavings && (
                        <div style={{
                            color: 'var(--color-success)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            marginTop: 'calc(var(--space-xs) * -1)',
                            marginBottom: 'var(--space-md)',
                        }}>
                            You save {formatPrice(packSavings)} with {selectedPackName}!
                        </div>
                    )}

                    <p className="product-detail__description">{product.description}</p>

                    {/* Features */}
                    <div className="product-detail__description">
                        <ul>
                            {product.features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>
                    </div>

                    {/* ——— Pack Variants (Chalkable) ——— */}
                    {product.packVariants && (
                        <div className="product-detail__variants" style={{ marginBottom: 'var(--space-lg)' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                                Select Quantity Pack
                            </label>
                            <div className="product-detail__variant-options">
                                {product.packVariants.map((variant) => (
                                    <button
                                        key={variant.id}
                                        className={`product-detail__variant-btn ${selectedPack === variant.id ? 'active' : ''}`}
                                        onClick={() => setSelectedPack(variant.id)}
                                    >
                                        {variant.name} — {formatPrice(variant.price)}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setSelectedPack(product.packVariants![0].id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-muted)',
                                    fontSize: 'var(--text-xs)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    marginTop: 'var(--space-xs)',
                                    textDecoration: 'underline',
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    {/* ——— Color Selector ——— */}
                    {product.colors && (
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                                Colour: {selectedColorName}
                            </label>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                {product.colors.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color.id)}
                                        title={color.name}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 'var(--radius-full)',
                                            background: color.hex,
                                            border: selectedColor === color.id
                                                ? '3px solid var(--color-accent)'
                                                : '2px solid var(--color-border)',
                                            cursor: 'pointer',
                                            padding: 0,
                                            outline: selectedColor === color.id
                                                ? '2px solid var(--color-accent)'
                                                : 'none',
                                            outlineOffset: '2px',
                                            transition: 'all 0.15s ease',
                                        }}
                                    />
                                ))}
                            </div>
                            {product.colorNote && (
                                <p style={{
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--color-text-muted)',
                                    marginTop: 'var(--space-sm)',
                                    fontStyle: 'italic',
                                }}>
                                    {product.colorNote}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ——— Add-Ons (Racksafe9) ——— */}
                    {product.addOns && (
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                                Add-Ons
                            </label>
                            <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
                                {product.addOns.map((addon) => (
                                    <label
                                        key={addon.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-sm)',
                                            padding: 'var(--space-sm) var(--space-md)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: selectedAddOns.includes(addon.id)
                                                ? '2px solid var(--color-accent)'
                                                : '1px solid var(--color-border)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            background: selectedAddOns.includes(addon.id)
                                                ? 'var(--color-accent-light)'
                                                : 'transparent',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAddOns.includes(addon.id)}
                                            onChange={() => toggleAddOn(addon.id)}
                                            style={{ accentColor: 'var(--color-accent)' }}
                                        />
                                        <span style={{ flex: 1 }}>{addon.name}</span>
                                        <span style={{ fontWeight: 600 }}>+{formatPrice(addon.price)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ——— Add to Cart ——— */}
                    <div className="product-detail__add-to-cart">
                        <div className="quantity-selector">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                        <button className="btn btn--primary btn--lg" onClick={handleAddToCart}>
                            Add to Cart — {formatPrice(totalPrice)}
                        </button>
                    </div>

                    <div className="product-detail__stock">
                        {product.stock || 'In stock — made to order'}
                    </div>
                </div>
            </div>
        </div>
    );
}
