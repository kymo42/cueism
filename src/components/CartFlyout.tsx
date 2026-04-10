import { useStore } from '@nanostores/react';
import React, { useState } from 'react';
import { cartItems, isCartOpen, removeCartItem, updateQuantity } from '../store/cart';

export default function CartFlyout() {
	const $isCartOpen = useStore(isCartOpen);
	const $cartItems = useStore(cartItems);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [chalkType, setChalkType] = useState('');
	const [giftOptIn, setGiftOptIn] = useState(false);

	const items = Object.values($cartItems);
	const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

	const handleCheckout = async () => {
		setIsCheckingOut(true);
		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items,
					checkoutMeta: {
						chalkType,
						giftOptIn,
					},
				}),
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
			<div 
				style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
				onClick={() => isCartOpen.set(false)}
			/>
			
			<div style={{
				position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '420px',
				backgroundColor: 'var(--color-bg-base)', borderLeft: '1px solid var(--color-border)',
				zIndex: 1000, display: 'flex', flexDirection: 'column'
			}}>
				<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border-light)' }}>
					<h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>Your Cart</h2>
					<button 
						onClick={() => isCartOpen.set(false)} 
						style={{ 
							background: 'transparent', 
							border: 'none', 
							color: 'var(--color-text-secondary)', 
							fontSize: '1.5rem', 
							cursor: 'pointer',
							padding: '0.25rem',
							lineHeight: 1,
						}}
						aria-label="Close cart"
					>
						&times;
					</button>
				</header>

				<div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-md)' }}>
					{items.length === 0 ? (
						<p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', paddingTop: 'var(--spacing-lg)' }}>
							Your cart is empty
						</p>
					) : (
						<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
							{items.map(item => (
								<li key={item.id} style={{ display: 'flex', gap: 'var(--spacing-sm)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border-light)' }}>
									{item.image ? (
										<img 
											src={item.image} 
											alt={item.title} 
											style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-surface)' }} 
										/>
									) : (
										<div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-sm)' }} />
									)}
									<div style={{ flex: 1, minWidth: 0 }}>
										<h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
											{item.title}
										</h4>
										{item.variantLabel && (
											<p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
												{item.variantLabel}
											</p>
										)}
										{item.personalization && (
											<p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', color: 'var(--color-accent)', fontStyle: 'italic' }}>
												{item.personalization}
											</p>
										)}
										<p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
											${item.price.toFixed(2)}
										</p>
										
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
											<button 
												onClick={() => updateQuantity(item.id, item.quantity - 1)} 
												style={{ 
													background: 'var(--color-bg-surface)', 
													border: '1px solid var(--color-border)', 
													color: 'var(--color-text-primary)', 
													width: '28px', 
													height: '28px', 
													cursor: 'pointer',
													borderRadius: 'var(--radius-sm)',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: '1rem',
													lineHeight: 1,
												}}
											>
												-
											</button>
											<span style={{ fontSize: '0.875rem', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
											<button 
												onClick={() => updateQuantity(item.id, item.quantity + 1)} 
												style={{ 
													background: 'var(--color-bg-surface)', 
													border: '1px solid var(--color-border)', 
													color: 'var(--color-text-primary)', 
													width: '28px', 
													height: '28px', 
													cursor: 'pointer',
													borderRadius: 'var(--radius-sm)',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: '1rem',
													lineHeight: 1,
												}}
											>
												+
											</button>
											
											<button 
												onClick={() => removeCartItem(item.id)} 
												style={{ 
													background: 'transparent', 
													border: 'none', 
													color: 'var(--color-text-tertiary)', 
													fontSize: '0.8125rem', 
													marginLeft: 'auto', 
													cursor: 'pointer',
													padding: '0.25rem',
												}}
											>
												Remove
											</button>
										</div>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				<footer style={{ borderTop: '1px solid var(--color-border-light)', padding: 'var(--spacing-md)' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)', fontSize: '1.125rem' }}>
						<span style={{ fontWeight: 500 }}>Subtotal</span>
						<span style={{ fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
					</div>
					<div style={{ marginBottom: 'var(--spacing-md)', display: 'grid', gap: '0.625rem' }}>
						<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'grid', gap: '0.25rem' }}>
							<span>What kinda chalk do you use?</span>
							<select
								value={chalkType}
								onChange={(event) => setChalkType(event.target.value)}
								style={{
									width: '100%',
									padding: '0.625rem 0.75rem',
									border: '1px solid var(--color-border)',
									borderRadius: 'var(--radius-sm)',
									fontFamily: 'var(--font-primary)',
									fontSize: '0.875rem',
								}}
							>
								<option value="">Select chalk</option>
								<option value="Master/tweet">Master/tweet</option>
								<option value="Roku Hex">Roku Hex</option>
								<option value="Predator Hex">Predator Hex</option>
								<option value="Taom round">Taom round</option>
							</select>
						</label>

						<label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
							<input
								type="checkbox"
								checked={giftOptIn}
								onChange={(event) => setGiftOptIn(event.target.checked)}
							/>
							<span>We may need to send you a gift</span>
						</label>
					</div>

					<p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
						Shipping calculated at checkout
					</p>
					<button 
						className="btn btn-primary" 
						style={{ width: '100%', padding: '0.875rem' }}
						disabled={items.length === 0 || isCheckingOut || !chalkType}
						onClick={handleCheckout}
					>
						{isCheckingOut ? 'Processing...' : 'Checkout'}
					</button>
				</footer>
			</div>
		</>
	);
}
