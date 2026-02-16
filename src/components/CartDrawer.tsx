'use client';

import { useCart, CartItem as CartItemType } from './CartProvider';

export default function CartDrawer() {
    const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setCartOpen } = useCart();

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
        }).format(cents / 100);
    };

    const handleCheckout = async () => {
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((item) => ({
                        priceId: item.priceId,
                        quantity: item.quantity,
                    })),
                }),
            });

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <>
            <div
                className={`cart-drawer__overlay ${isCartOpen ? 'open' : ''}`}
                onClick={() => setCartOpen(false)}
            />
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-drawer__header">
                    <h3>Your Cart ({items.length})</h3>
                    <button className="cart-drawer__close" onClick={() => setCartOpen(false)}>
                        ✕
                    </button>
                </div>

                <div className="cart-drawer__items">
                    {items.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-2xl) 0' }}>
                            Your cart is empty
                        </p>
                    ) : (
                        items.map((item) => (
                            <CartItemRow
                                key={item.priceId}
                                item={item}
                                onRemove={() => removeItem(item.priceId)}
                                onUpdateQty={(qty) => updateQuantity(item.priceId, qty)}
                                formatPrice={formatPrice}
                            />
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-drawer__footer">
                        <div className="cart-drawer__total">
                            <span>Subtotal</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                            Shipping calculated at checkout. Prices include GST.
                        </p>
                        <button className="btn btn--primary btn--full" onClick={handleCheckout}>
                            Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

function CartItemRow({
    item,
    onRemove,
    onUpdateQty,
    formatPrice,
}: {
    item: CartItemType;
    onRemove: () => void;
    onUpdateQty: (qty: number) => void;
    formatPrice: (cents: number) => string;
}) {
    return (
        <div className="cart-item">
            {item.image && (
                <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item__image"
                />
            )}
            <div className="cart-item__info">
                <div className="cart-item__name">{item.name}</div>
                {item.variant && (
                    <div className="cart-item__variant">{item.variant}</div>
                )}
                <div className="cart-item__price">
                    {formatPrice(item.price * item.quantity)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                    <div className="quantity-selector" style={{ transform: 'scale(0.8)', transformOrigin: 'left' }}>
                        <button onClick={() => onUpdateQty(item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.quantity + 1)}>+</button>
                    </div>
                    <button className="cart-item__remove" onClick={onRemove}>
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
