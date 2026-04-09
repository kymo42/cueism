import { useStore } from '@nanostores/react';
import React from 'react';
import { cartItems, isCartOpen } from '../store/cart';

export default function CartToggle() {
	const $cartItems = useStore(cartItems);
	
	const totalItems = Object.values($cartItems).reduce((sum, item) => sum + item.quantity, 0);

	return (
		<button 
			onClick={() => isCartOpen.set(true)}
			style={{
				background: 'transparent',
				border: 'none',
				color: 'var(--color-text-secondary)',
				fontFamily: 'var(--font-primary)',
				cursor: 'pointer',
				display: 'flex',
				alignItems: 'center',
				gap: '0.5rem',
				padding: '0.5rem',
				borderRadius: 'var(--radius-sm)',
				transition: 'var(--transition-fast)',
			}}
			aria-label="Shopping cart"
		>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
				<line x1="3" y1="6" x2="21" y2="6"/>
				<path d="M16 10a4 4 0 0 1-8 0"/>
			</svg>
			{totalItems > 0 && (
				<span style={{
					backgroundColor: 'var(--color-accent)',
					color: '#ffffff',
					borderRadius: 'var(--radius-full)',
					minWidth: '20px',
					height: '20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '0.75rem',
					fontWeight: 600,
					padding: '0 6px',
				}}>
					{totalItems}
				</span>
			)}
		</button>
	);
}
