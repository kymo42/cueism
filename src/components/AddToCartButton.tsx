import React from 'react';
import { addCartItem, type CartItem } from '../store/cart';

interface AddToCartButtonProps {
	product: Omit<CartItem, 'quantity'>;
	disabled?: boolean;
}

export default function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
	return (
		<button 
			className="btn-primary" 
			style={{ 
				width: '100%', 
				padding: '1rem', 
				fontSize: '1rem',
				opacity: disabled ? 0.5 : 1,
				cursor: disabled ? 'not-allowed' : 'pointer'
			}}
			disabled={disabled}
			onClick={() => addCartItem(product)}
		>
			{disabled ? 'Out of Stock' : 'Add to Cart'}
		</button>
	);
}
