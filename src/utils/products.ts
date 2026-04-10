export type ProductVariant = {
	id: string;
	label: string;
	optionGroup?: string;
	optionValue?: string;
	price: number;
	stock: number;
	weightGrams: number;
	sku?: string;
	enabled: boolean;
};

export function getProductVariants(data: any): ProductVariant[] {
	if (!Array.isArray(data?.variants)) return [];

	return data.variants
		.map((variant: any, index: number) => {
			const optionGroup = typeof variant?.option_group === "string" ? variant.option_group : undefined;
			const optionValue = typeof variant?.option_value === "string" ? variant.option_value : undefined;
			const label =
				typeof variant?.label === "string" && variant.label.trim().length > 0
					? variant.label
					: optionValue || `Option ${index + 1}`;
			const id =
				typeof variant?.id === "string" && variant.id.trim().length > 0
					? variant.id
					: `${optionGroup || "variant"}:${optionValue || index}`;

			return {
				id,
				label,
				optionGroup,
				optionValue,
				price: Number.isFinite(variant?.price) ? Number(variant.price) : 0,
				stock: Number.isFinite(variant?.stock) ? Number(variant.stock) : 0,
				weightGrams: Number.isFinite(variant?.weight_grams) ? Number(variant.weight_grams) : 0,
				sku: typeof variant?.sku === "string" ? variant.sku : undefined,
				enabled: variant?.enabled !== false,
			} satisfies ProductVariant;
		})
		.filter((variant: ProductVariant) => variant.enabled);
}

export function getBasePrice(data: any): number {
	return Number.isFinite(data?.price) ? Number(data.price) : 0;
}

export function getBaseStock(data: any): number {
	if (Number.isFinite(data?.stock)) return Number(data.stock);
	if (Number.isFinite(data?.inventory_count)) return Number(data.inventory_count);
	return 0;
}

export function getBaseWeightGrams(data: any): number {
	return Number.isFinite(data?.weight_grams) ? Number(data.weight_grams) : 0;
}

export function getTrackStock(data: any): boolean {
	return data?.track_stock === true;
}

export function getPriceRange(data: any): { min: number; max: number } {
	const variants = getProductVariants(data);
	if (variants.length === 0) {
		const basePrice = getBasePrice(data);
		return { min: basePrice, max: basePrice };
	}

	const prices = variants.map((variant) => variant.price).filter((price) => Number.isFinite(price));
	if (prices.length === 0) {
		const basePrice = getBasePrice(data);
		return { min: basePrice, max: basePrice };
	}

	return {
		min: Math.min(...prices),
		max: Math.max(...prices),
	};
}

export function getVariantById(data: any, variantId?: string): ProductVariant | undefined {
	if (!variantId) return undefined;
	return getProductVariants(data).find((variant) => variant.id === variantId);
}
