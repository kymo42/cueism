import { resolveMediaUrl } from "./post-format";

export type ProductVariant = {
	id: string;
	label: string;
	optionGroup?: string;
	optionValue?: string;
	price: number; // dollars
	stock: number;
	weightGrams: number;
	sku?: string;
	enabled: boolean;
};

export type NormalizedProductImage = {
	src: string;
	alt: string;
	width: number;
	height: number;
	color?: string;
	personalization?: string;
};

export const PRODUCT_IMAGE_META_BY_SRC: Record<
	string,
	{ alt: string; color?: string; personalization?: string; width?: number; height?: number }
> = {
	// Rac9safe
	"/products/racksafe9_0_featured.jpg": {
		alt: "Rac9safe magnetic 9-ball rack case in Black on blue pool cloth",
		color: "black",
	},
	"/products/racksafe9_4.jpg": {
		alt: "Open White Rac9safe showing Turtle Rack template and magnetic lock alongside Black Rac9safe",
		color: "white",
	},
	"/products/racksafe9_colors.jpg": {
		alt: "Rac9safe in Orange, Black, and White colour options",
	},
	"/products/racksafe9_3.jpg": {
		alt: "Rac9safe in Orange and Black with custom Cueism text personalization",
		color: "orange",
		personalization: "text",
	},
	"/products/racksafe9_5.jpg": {
		alt: "Rac9safe in White with custom Face Print personalization",
		color: "white",
		personalization: "face",
	},
	"/products/racksafe9_2.jpg": {
		alt: "Rac9safe with interchangeable NFC and RFID icon tiles",
		color: "black",
		personalization: "nfc",
	},
	"/products/racksafe9_1.jpg": {
		alt: "Close-up of Rac9safe magnetic wall profile and embedded NFC icon tile",
		color: "black",
		personalization: "nfc",
	},
	// Chalkable
	"/products/chalkable_0_featured.jpg": {
		alt: "Chalkable magnetic chalk holder in Black and White showing circular and octagonal chalk slots",
		color: "black,white",
	},
	"/products/chalkable_1.jpg": {
		alt: "Chalkable tethered under pool table rail next to ball return pocket",
		color: "black",
	},
	"/products/chalkable_3.jpg": {
		alt: "Close-up of Chalkable loaded with pool chalk on steel wire tether",
		color: "black",
	},
	"/products/chalkable_2.jpg": {
		alt: "Underside view of Chalkable screw-eye anchor and wire tether mounted under pool table",
		color: "black",
	},
	// Safe9
	"/products/safe9_0_featured.jpg": {
		alt: "Open White and Black Safe9 magnetic rack holders showing internal Turtle Rack template and neodymium magnets",
	},
	"/products/safe9_6_blackwhite.jpg": {
		alt: "Safe9 in Black and White clipped to cue case with ball-clasp tether",
		color: "black,white",
	},
	"/products/safe9_1_pink.jpg": {
		alt: "Safe9 in Pink clipped to Mezz Cues case",
		color: "pink",
	},
	"/products/safe9_2_blue.jpg": {
		alt: "Safe9 in Blue clipped to cue case",
		color: "blue",
	},
	"/products/safe9_3_grey.jpg": {
		alt: "Safe9 in Grey clipped to cue case",
		color: "grey",
	},
	"/products/safe9_4_yellow.jpg": {
		alt: "Safe9 in Yellow clipped to cue case",
		color: "yellow",
	},
	"/products/safe9_5_green.jpg": {
		alt: "Safe9 in Green clipped to cue case",
		color: "green",
	},
	// Amoeba
	"/products/k2.jpg": {
		alt: "Amoeba organic multi-angle bridge head in White with Black Nogenn insert",
		color: "white",
	},
	"/products/k3.jpg": {
		alt: "Black and White Amoeba bridge heads mounted on pool cues with Yellow and Black Nogenn inserts",
		color: "black,white",
	},
	"/products/k4.jpg": {
		alt: "Cue bridging over pool balls using White Amoeba bridge head",
		color: "white",
	},
	"/products/k7.jpg": {
		alt: "Black Amoeba bridge head with Yellow Nogenn insert bridging over cue ball toward 9-ball",
		color: "black,yellow",
	},
};

const CURATED_GALLERY_BY_SLUG: Record<string, string[]> = {
	racksafe9: [
		"/products/racksafe9_0_featured.jpg",
		"/products/racksafe9_4.jpg",
		"/products/racksafe9_colors.jpg",
		"/products/racksafe9_3.jpg",
		"/products/racksafe9_5.jpg",
		"/products/racksafe9_2.jpg",
		"/products/racksafe9_1.jpg",
	],
	chalkable: [
		"/products/chalkable_0_featured.jpg",
		"/products/chalkable_1.jpg",
		"/products/chalkable_3.jpg",
		"/products/chalkable_2.jpg",
	],
	safe9: [
		"/products/safe9_0_featured.jpg",
		"/products/safe9_6_blackwhite.jpg",
		"/products/safe9_1_pink.jpg",
		"/products/safe9_2_blue.jpg",
		"/products/safe9_3_grey.jpg",
		"/products/safe9_4_yellow.jpg",
		"/products/safe9_5_green.jpg",
	],
	amoeba: [
		"/products/k2.jpg",
		"/products/k3.jpg",
		"/products/k4.jpg",
		"/products/k7.jpg",
	],
};

export function normalizeProductImage(
	image: any,
	fallbackAlt = "Cueism product image",
): NormalizedProductImage | undefined {
	const src = resolveMediaUrl(image);
	if (!src) return undefined;
	const meta = PRODUCT_IMAGE_META_BY_SRC[src];
	const explicitAlt = typeof image?.alt === "string" && image.alt.trim().length > 0 ? image.alt.trim() : undefined;
	return {
		src,
		alt: meta?.alt || explicitAlt || fallbackAlt,
		width: meta?.width || 1000,
		height: meta?.height || 1000,
		color: image?.color || meta?.color,
		personalization: image?.personalization || meta?.personalization,
	};
}

export function getCuratedProductGallery(
	slug: string,
	data: Record<string, any>,
): NormalizedProductImage[] {
	const title = typeof data?.title === "string" && data.title.trim() ? data.title.trim() : "Cueism product";
	const rawFeatured = data?.featured_image;
	const rawGallery = Array.isArray(data?.gallery_images)
		? data.gallery_images.map((item: any) => item?.image || item).filter(Boolean)
		: [];
	const allRaw = [rawFeatured, ...rawGallery].filter(Boolean);

	const bySrc = new Map<string, NormalizedProductImage>();
	allRaw.forEach((raw, idx) => {
		const norm = normalizeProductImage(raw, `${title} — image ${idx + 1}`);
		if (norm && !bySrc.has(norm.src)) {
			bySrc.set(norm.src, norm);
		}
	});

	const curatedOrder = CURATED_GALLERY_BY_SLUG[slug];
	if (curatedOrder) {
		const ordered: NormalizedProductImage[] = [];
		const used = new Set<string>();
		for (const src of curatedOrder) {
			const existing = bySrc.get(src) || normalizeProductImage(src, title);
			if (existing) {
				ordered.push(existing);
				used.add(src);
			}
		}
		for (const [src, item] of bySrc.entries()) {
			if (!used.has(src)) {
				ordered.push(item);
			}
		}
		return ordered;
	}

	return Array.from(bySrc.values());
}

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
