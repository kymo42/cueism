import { useStore } from '@nanostores/react';
import React, { useState } from 'react';
import { cartItems, isCartOpen, removeCartItem, updateQuantity } from '../store/cart';

export default function CartFlyout() {
	const $isCartOpen = useStore(isCartOpen);
	const $cartItems = useStore(cartItems);
	const [isCheckingOut, setIsCheckingOut] = useState(false);

	const items = Object.values($cartItems);
	const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

	const handleCheckout = async () => {
		setIsCheckingOut(true);
		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items }),
			});
			const data = await res.json();
			if (data.url) {
				window.location.href = data.url;
			} else {
				throw new Error(data.error || 'Failed to checkout');
			}
		} catch (err) {
			console.error("Checkout error:", err);
			alert("Checkout failed. Please try again.");
			setIsCheckingOut(false);
		}
	};

	if (!$isCartOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div 
				style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999 }}
				onClick={() => isCartOpen.set(false)}
			/>
			
			{/* Flyout */}
			<div style={{
				position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px',
				backgroundColor: 'var(--color-bg-base)', borderLeft: '1px solid var(--color-border)',
				zIndex: 1000, display: 'flex', flexDirection: 'column', padding: 'var(--spacing-md)'
			}}>
				<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-sm)' }}>
					<h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent-gold)', marginBottom: 0 }}>Your Cart</h2>
					<button onClick={() => isCartOpen.set(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>
						&times;
					</button>
				</header>

				<div style={{ flex: 1, overflowY: 'auto' }}>
					{items.length === 0 ? (
						<p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-lg)' }}>Your cart is empty.</p>
					) : (
						<ul style={{ listStyle: 'none', padding: 0 }}>
							{items.map(item => (
								<li key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-bg-surface)' }}>
									{item.image ? (
										<img src={item.image} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
									) : (
										<div style={{ width: '60px', height: '60px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '4px' }} />
									)}
									<div style={{ flex: 1 }}>
										<h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{item.title}</h4>
										<p style={{ margin: 0, color: 'var(--color-accent-gold)' }}>${(item.price / 100).toFixed(2)}</p>
										
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
											<button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', width: '24px', height: '24px', cursor: 'pointer' }}>-</button>
											<span style={{ fontSize: '0.9rem' }}>{item.quantity}</span>
											<button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', width: '24px', height: '24px', cursor: 'pointer' }}>+</button>
											
											<button onClick={() => removeCartItem(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginLeft: 'auto', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
										</div>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				<footer style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-md)' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)', fontSize: '1.2rem', fontFamily: 'var(--font-primary)' }}>
						<span>Subtotal</span>
						<span>${(subtotal / 100).toFixed(2)}</span>
					</div>
					<p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
						Flat-rate shipping calculated at checkout.
					</p>
					<button 
						className="btn-primary" 
						style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}
						disabled={items.length === 0 || isCheckingOut}
						onClick={handleCheckout}
					>
						{isCheckingOut ? 'Processing...' : 'Checkout'}
					</button>
				</footer>
			</div>
		</>
	);
}
