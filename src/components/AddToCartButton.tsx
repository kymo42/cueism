import React from 'react';
import { addCartItem, type CartItem } from '../store/cart';

interface AddToCartButtonProps {
	product: Omit<CartItem, 'quantity'>;
	disabled?: boolean;
}

export default function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
	return (
		<button 
			className="btn btn-primary"
			style={{ 
				width: '100%', 
				padding: '0.875rem 1.5rem',
				fontSize: '0.9375rem',
				fontWeight: 500,
				opacity: disabled ? 0.5 : 1,
				cursor: disabled ? 'not-allowed' : 'pointer',
				borderRadius: 'var(--radius-sm)',
			}}
			disabled={disabled}
			onClick={() => addCartItem(product)}
		>
			{disabled ? 'Out of Stock' : 'Add to Cart'}
		</button>
	);
}
