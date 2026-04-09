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
				color: 'var(--color-text-primary)',
				fontFamily: 'var(--font-primary)',
				textTransform: 'uppercase',
				letterSpacing: '0.05em',
				cursor: 'pointer',
				display: 'flex',
				alignItems: 'center',
				gap: '0.5rem',
				padding: '0.5rem'
			}}
		>
			<span style={{ fontSize: '1.2rem'}}>🛒</span>
			{totalItems > 0 && (
				<span style={{
					backgroundColor: 'var(--color-accent-gold)',
					color: 'var(--color-bg-base)',
					borderRadius: '50%',
					width: '20px',
					height: '20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '0.75rem',
					fontWeight: 'bold'
				}}>
					{totalItems}
				</span>
			)}
		</button>
	);
}
