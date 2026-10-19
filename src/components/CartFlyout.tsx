import { useStore } from '@nanostores/react';
import React, { useRef, useState } from 'react';
import { cartItems, isCartOpen, removeCartItem, updateQuantity } from '../store/cart';

export default function CartFlyout() {
	const $isCartOpen = useStore(isCartOpen);
	const $cartItems = useStore(cartItems);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [chalkType, setChalkType] = useState('');
	const [cueMaker, setCueMaker] = useState('');
	const [shippingDestination, setShippingDestination] = useState<'domestic' | 'international'>('domestic');
	const [validationError, setValidationError] = useState('');
	const chalkSelectRef = useRef<HTMLSelectElement>(null);
	const cueMakerSelectRef = useRef<HTMLSelectElement>(null);

	const items = Object.values($cartItems);
	const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

	const handleCheckout = async () => {
		if (items.length === 0) return;

		if (!chalkType || !cueMaker) {
			if (!chalkType && !cueMaker) {
				setValidationError('Please select both your chalk and cue maker above.');
				chalkSelectRef.current?.focus();
			} else if (!chalkType) {
				setValidationError('Please select the type of chalk you use above.');
				chalkSelectRef.current?.focus();
			} else {
				setValidationError('Please select your cue maker above.');
				cueMakerSelectRef.current?.focus();
			}
			return;
		}

		setValidationError('');
		setIsCheckingOut(true);
		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items,
					checkoutMeta: {
						chalkType,
						cueMaker,
						giftOptIn: true,
						shippingDestination,
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
										{item.color && (
											<p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
												Color: {item.color}
											</p>
										)}
										{item.nogennColor && (
											<p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
												Nogenn colour: {item.nogennColor}
											</p>
										)}
										{item.logoUrl && (
											<p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
												Logo: <a href={item.logoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>attached</a>
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

					{items.length > 0 && (
						<div
							style={{
								marginBottom: 'var(--spacing-md)',
								padding: '0.875rem',
								backgroundColor: 'var(--color-bg-surface)',
								border: validationError ? '1.5px solid #d93025' : '1px solid var(--color-border)',
								borderRadius: 'var(--radius-md)',
								display: 'grid',
								gap: '0.75rem',
								transition: 'border-color 0.2s ease',
							}}
						>
							<div>
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
									<span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
										<span aria-hidden="true">🎁</span> Free Gift Choices
									</span>
									<span
										style={{
											fontSize: '0.6875rem',
											fontWeight: 600,
											color: chalkType && cueMaker ? '#137333' : '#b3261e',
											backgroundColor: chalkType && cueMaker ? '#e6f4ea' : '#fce8e6',
											padding: '0.125rem 0.5rem',
											borderRadius: 'var(--radius-full)',
											textTransform: 'uppercase',
											letterSpacing: '0.04em',
										}}
									>
										{chalkType && cueMaker ? '✓ Ready' : 'Required'}
									</span>
								</div>
								<p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
									We have free gifts to include with your order! Please select your choices below so we pack the right items for you:
								</p>
							</div>

							<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', fontWeight: 500, display: 'grid', gap: '0.375rem' }}>
								<span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<span>1. What kinda chalk do you use?</span>
									{!chalkType && <span style={{ color: '#d93025', fontSize: '0.75rem' }}>* Required</span>}
								</span>
								<select
									ref={chalkSelectRef}
									value={chalkType}
									onChange={(event) => {
										setChalkType(event.target.value);
										if (validationError) setValidationError('');
									}}
									style={{
										width: '100%',
										padding: '0.625rem 0.75rem',
										border: validationError && !chalkType ? '1.5px solid #d93025' : '1px solid var(--color-border)',
										borderRadius: 'var(--radius-sm)',
										fontFamily: 'var(--font-primary)',
										fontSize: '0.875rem',
										backgroundColor: 'var(--color-bg-base)',
										color: chalkType ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
									}}
								>
									<option value="">Select chalk</option>
									<option value="Master/tweet">Master/tweet</option>
									<option value="Roku Hex">Roku Hex</option>
									<option value="Predator Hex">Predator Hex</option>
									<option value="Taom round">Taom round</option>
									<option value="Other">Other</option>
								</select>
							</label>

							<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', fontWeight: 500, display: 'grid', gap: '0.375rem' }}>
								<span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<span>2. Which cue maker do you use?</span>
									{!cueMaker && <span style={{ color: '#d93025', fontSize: '0.75rem' }}>* Required</span>}
								</span>
								<select
									ref={cueMakerSelectRef}
									value={cueMaker}
									onChange={(event) => {
										setCueMaker(event.target.value);
										if (validationError) setValidationError('');
									}}
									style={{
										width: '100%',
										padding: '0.625rem 0.75rem',
										border: validationError && !cueMaker ? '1.5px solid #d93025' : '1px solid var(--color-border)',
										borderRadius: 'var(--radius-sm)',
										fontFamily: 'var(--font-primary)',
										fontSize: '0.875rem',
										backgroundColor: 'var(--color-bg-base)',
										color: cueMaker ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
									}}
								>
									<option value="">Select cue maker</option>
									<option value="Mezz">Mezz</option>
									<option value="Predator">Predator</option>
									<option value="Other / Neither">Other / Neither</option>
								</select>
							</label>
						</div>
					)}

					{validationError && (
						<div
							style={{
								backgroundColor: '#fce8e6',
								border: '1px solid #fad2cf',
								color: '#c5221f',
								padding: '0.625rem 0.75rem',
								borderRadius: 'var(--radius-sm)',
								fontSize: '0.8125rem',
								marginBottom: 'var(--spacing-sm)',
								display: 'flex',
								alignItems: 'center',
								gap: '0.5rem',
								fontWeight: 500,
							}}
						>
							<span aria-hidden="true">⚠️</span>
							<span>{validationError}</span>
						</div>
					)}

					{items.length > 0 && (
						<div style={{ marginBottom: 'var(--spacing-md)' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
								<span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
									Shipping Destination:
								</span>
								<span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
									{shippingDestination === 'domestic' ? '+$10.00 AUD' : '+$26.00 AUD'}
								</span>
							</div>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
								<button
									type="button"
									onClick={() => setShippingDestination('domestic')}
									style={{
										padding: '0.5rem',
										borderRadius: 'var(--radius-sm)',
										border: shippingDestination === 'domestic' ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
										backgroundColor: shippingDestination === 'domestic' ? 'rgba(26, 115, 232, 0.08)' : 'var(--color-bg-base)',
										color: shippingDestination === 'domestic' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
										fontSize: '0.8125rem',
										fontWeight: shippingDestination === 'domestic' ? 600 : 400,
										cursor: 'pointer',
										textAlign: 'center',
									}}
								>
									🇦🇺 Australia ($10)
								</button>
								<button
									type="button"
									onClick={() => setShippingDestination('international')}
									style={{
										padding: '0.5rem',
										borderRadius: 'var(--radius-sm)',
										border: shippingDestination === 'international' ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
										backgroundColor: shippingDestination === 'international' ? 'rgba(26, 115, 232, 0.08)' : 'var(--color-bg-base)',
										color: shippingDestination === 'international' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
										fontSize: '0.8125rem',
										fontWeight: shippingDestination === 'international' ? 600 : 400,
										cursor: 'pointer',
										textAlign: 'center',
									}}
								>
									🌍 International ($26)
								</button>
							</div>
						</div>
					)}

					<p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
						AusPost Standard Delivery calculated at checkout
					</p>
					<button 
						className="btn btn-primary" 
						style={{ 
							width: '100%', 
							padding: '0.875rem',
							cursor: items.length === 0 || isCheckingOut ? 'not-allowed' : 'pointer',
						}}
						disabled={items.length === 0 || isCheckingOut}
						onClick={handleCheckout}
					>
						{isCheckingOut ? 'Processing...' : 'Checkout'}
					</button>

					{items.length > 0 && (!chalkType || !cueMaker) && !validationError && (
						<p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
							Please select your chalk &amp; cue maker above to checkout
						</p>
					)}
				</footer>
			</div>
		</>
	);
}
