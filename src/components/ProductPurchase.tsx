import React, { useMemo, useState } from 'react';
import { addCartItem } from '../store/cart';
import { type ProductVariant } from '../utils/products';

type ProductPurchaseProps = {
	productId: string;
	slug: string;
	title: string;
	image?: string;
	basePrice: number;
	baseStock: number;
	baseWeightGrams: number;
	trackStock: boolean;
	variants: ProductVariant[];
};

export default function ProductPurchase({
	productId,
	slug,
	title,
	image,
	basePrice,
	baseStock,
	baseWeightGrams,
	trackStock,
	variants,
}: ProductPurchaseProps) {
	const hasVariants = variants.length > 0;
	const [selectedVariantId, setSelectedVariantId] = useState(hasVariants ? variants[0]?.id || '' : '');

	const selectedVariant = useMemo(
		() => variants.find((variant) => variant.id === selectedVariantId),
		[variants, selectedVariantId],
	);

	const unitPrice = selectedVariant?.price ?? basePrice;
	const unitStock = selectedVariant?.stock ?? baseStock;
	const unitWeightGrams = selectedVariant?.weightGrams ?? baseWeightGrams;
	const variantLabel = selectedVariant?.label;
	const disabled = trackStock && unitStock <= 0;

	const handleAdd = () => {
		const lineId = `${productId}::${selectedVariant?.id || 'base'}`;
		addCartItem({
			id: lineId,
			productId,
			slug,
			title,
			price: unitPrice,
			image,
			variantId: selectedVariant?.id,
			variantLabel,
			sku: selectedVariant?.sku,
			weightGrams: unitWeightGrams,
		});
	};

	return (
		<div style={{ display: 'grid', gap: '0.75rem' }}>
			{hasVariants && (
				<label style={{ display: 'grid', gap: '0.375rem' }}>
					<span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Options</span>
					<select
						value={selectedVariantId}
						onChange={(event) => setSelectedVariantId(event.target.value)}
						style={{
							width: '100%',
							padding: '0.75rem 1rem',
							border: '1px solid var(--color-border)',
							borderRadius: 'var(--radius-sm)',
							fontFamily: 'var(--font-primary)',
						}}
					>
						{variants.map((variant) => (
							<option key={variant.id} value={variant.id}>
								{variant.label} - ${(variant.price / 100).toFixed(2)}
							</option>
						))}
					</select>
				</label>
			)}

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
				onClick={handleAdd}
			>
				{disabled ? 'Out of Stock' : 'Add to Cart'}
			</button>
		</div>
	);
}
