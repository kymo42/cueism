// Single source of truth for personalization / logo surcharges.
//
// Imported by:
//   - src/components/ProductPurchase.tsx (cart line price shown to the customer)
//   - src/pages/products/[slug].astro   (per-product personalization config)
//   - src/pages/api/checkout.ts          (Stripe unit_amount, recomputed server-side)
//
// The checkout endpoint must NEVER trust the client-sent price. It re-derives the
// surcharge from the item's slug + personalization type + variant using the helpers
// below, so the +$5 / +$7 / logo fees displayed in the cart are actually charged.

export type PersonalizationType = 'none' | 'text' | 'nfc' | 'initials' | 'face';

export const TEXT_SURCHARGE = 5;
export const NFC_SURCHARGE = 7;
export const ICON_SURCHARGE = 5;
export const FACE_SURCHARGE = 9;

// Products with embedded NFC (always enabled, no surcharge).
export const EMBEDDED_NFC_ONLY = new Set<string>(['safe9']);

// Products that only offer initials or icon personalization (no cueism, no NFC, no text).
export const INITIALS_OR_ICON_ONLY = new Set<string>(['cheatstick']);

// Flat logo-upload processing surcharge per product (dollars).
export const LOGO_SURCHARGE: Record<string, number> = {};

// Per-variant logo-upload processing surcharge (overrides the flat rate above).
// Chalkable: cheaper the larger the pack — 20-pack is free.
export const LOGO_SURCHARGE_BY_VARIANT: Record<string, Record<string, number>> = {
	chalkable: { single: 20, '5pack': 10, '10pack': 5, '20pack': 0 },
};

/**
 * Logo processing surcharge (dollars) for a product/variant. Returns 0 when the
 * product has no logo surcharge. Callers should only apply this when a logo is
 * actually attached.
 */
export function getLogoSurcharge(slug: string, variantId?: string): number {
	const byVariant = LOGO_SURCHARGE_BY_VARIANT[slug];
	if (byVariant && variantId && variantId in byVariant) return byVariant[variantId];
	return LOGO_SURCHARGE[slug] || 0;
}

/**
 * Personalization surcharge (dollars) for a product, derived from the chosen
 * personalization type and the product's slug-based config. This mirrors exactly
 * what ProductPurchase shows in the cart so the server charges the same amount.
 */
export function getPersonalizationSurcharge(personalizationType: PersonalizationType, slug: string): number {
	if (personalizationType === 'face') return FACE_SURCHARGE;
	if (EMBEDDED_NFC_ONLY.has(slug)) return 0;
	if (INITIALS_OR_ICON_ONLY.has(slug)) {
		// "Initials" → `initials` type, "Icon" → `nfc` type; both cost ICON_SURCHARGE ($5).
		return personalizationType === 'initials' || personalizationType === 'nfc'
			? ICON_SURCHARGE
			: 0;
	}
	if (personalizationType === 'nfc') return NFC_SURCHARGE;
	if (personalizationType === 'text') return TEXT_SURCHARGE;
	return 0;
}
