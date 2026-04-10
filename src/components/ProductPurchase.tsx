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
	hasTextOption?: boolean;
	hasNfcOption?: boolean;
};

type PersonalizationType = 'none' | 'text' | 'nfc';

const TEXT_SURCHARGE = 5;
const NFC_SURCHARGE = 7;

const GOOGLE_MATERIAL_ICONS = [
	'person', 'person_2', 'groups', 'group', 'badge', 'contact_emergency', 'home', 'apartment', 'cottage', 'domain', 'email',
	'phone', 'call', 'chat', 'sms', 'link', 'language', 'public', 'share', 'send', 'near_me', 'location_on', 'pin_drop', 'map',
	'navigation', 'explore', 'travel', 'flight', 'train', 'directions_car', 'directions_bus', 'directions_bike', 'local_shipping',
	'local_taxi', 'pets', 'paw_print', 'favorite', 'star', 'thumb_up', 'bolt', 'eco', 'forest', 'park', 'water_drop', 'sunny',
	'nightlight', 'cloud', 'security', 'shield', 'verified_user', 'lock', 'lock_open', 'key', 'vpn_key', 'fingerprint',
	'qr_code', 'qr_code_scanner', 'nfc', 'contactless', 'wifi', 'bluetooth', 'signal_cellular_alt', 'router', 'storage',
	'smartphone', 'phone_iphone', 'laptop', 'tablet', 'watch', 'headphones', 'speaker', 'tv', 'photo_camera', 'videocam',
	'image', 'movie', 'music_note', 'radio', 'podcasts', 'mic', 'volume_up', 'palette', 'draw', 'edit', 'brush', 'format_paint',
	'work', 'business', 'storefront', 'shopping_bag', 'shopping_cart', 'sell', 'payments', 'credit_card', 'receipt_long',
	'restaurant', 'local_cafe', 'local_bar', 'bakery_dining', 'icecream', 'sports_esports', 'sports_soccer', 'sports_tennis',
	'fitness_center', 'self_improvement', 'school', 'menu_book', 'science', 'calculate', 'medical_services', 'healing', 'vaccines',
	'emergency', 'local_hospital', 'medication', 'car_repair', 'build', 'handyman', 'construction', 'engineering', 'inventory_2',
	'workspace_premium', 'rocket_launch', 'workspace', 'event', 'calendar_month', 'today', 'schedule', 'alarm', 'timer', 'update',
	'campaign', 'insights', 'analytics', 'assessment', 'tune', 'settings', 'help', 'info', 'check_circle', 'error', 'warning',
	'visibility', 'search', 'filter_alt', 'sort', 'menu', 'more_horiz', 'done', 'close', 'add', 'remove',
];

const RELATED_TERMS: Record<string, string[]> = {
	person: ['profile', 'contact', 'identity', 'id'],
	security: ['lock', 'key', 'shield', 'safe', 'secure'],
	pet: ['dog', 'cat', 'animal', 'paw'],
	home: ['house', 'address', 'location', 'place'],
	phone: ['call', 'mobile', 'contact', 'number'],
	medical: ['health', 'hospital', 'emergency', 'first aid'],
	car: ['vehicle', 'transport', 'drive', 'auto'],
	work: ['business', 'office', 'job', 'company'],
	shop: ['store', 'bag', 'cart', 'buy'],
	wifi: ['internet', 'network', 'signal', 'nfc'],
};

const normalize = (value: string) => value.toLowerCase().replace(/[_\s-]/g, '');

function scoreIcon(icon: string, rawQuery: string): number {
	if (!rawQuery) return 1;
	const query = normalize(rawQuery);
	const iconKey = normalize(icon);
	const iconWords = icon.toLowerCase().split('_');

	if (iconKey === query) return 120;
	if (iconKey.startsWith(query)) return 90;
	if (iconWords.some((word) => normalize(word).startsWith(query))) return 70;
	if (iconKey.includes(query)) return 55;

	const synonymMatches = Object.entries(RELATED_TERMS).some(([topic, related]) => {
		const queryMatch = normalize(topic).includes(query) || related.some((term) => normalize(term).includes(query));
		const iconMatch = normalize(icon).includes(normalize(topic)) || related.some((term) => normalize(icon).includes(normalize(term)));
		return queryMatch && iconMatch;
	});
	if (synonymMatches) return 45;

	let qIndex = 0;
	for (let i = 0; i < iconKey.length && qIndex < query.length; i++) {
		if (iconKey[i] === query[qIndex]) qIndex += 1;
	}
	if (qIndex === query.length) return 30;
	return 0;
}

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
	hasTextOption = false,
	hasNfcOption = false,
}: ProductPurchaseProps) {
	const hasVariants = variants.length > 0;
	const [selectedVariantId, setSelectedVariantId] = useState(hasVariants ? variants[0]?.id || '' : '');
	const [personalizationType, setPersonalizationType] = useState<PersonalizationType>('text');
	const [textOption, setTextOption] = useState('');
	const [nfcIcon, setNfcIcon] = useState('person');
	const [nfcName, setNfcName] = useState('');
	const [iconSearch, setIconSearch] = useState('');

	const selectedVariant = useMemo(() => variants.find((variant) => variant.id === selectedVariantId), [variants, selectedVariantId]);
const personalizationSurcharge = personalizationType === 'nfc' ? NFC_SURCHARGE : personalizationType === 'text' ? TEXT_SURCHARGE : 0;
const personalizationSelected = personalizationSurcharge > 0;
const personalizationValid =
	personalizationType === 'none' ||
	(personalizationType === 'text' && textOption.trim().length > 0) ||
	(personalizationType === 'nfc' && nfcName.trim().length > 0);
const baseUnitPrice = selectedVariant?.price ?? basePrice;
const unitPrice = baseUnitPrice + personalizationSurcharge;
	const unitStock = selectedVariant?.stock ?? baseStock;
	const unitWeightGrams = selectedVariant?.weightGrams ?? baseWeightGrams;
	const variantLabel = selectedVariant?.label;
	const disabled = (trackStock && unitStock <= 0) || !personalizationValid;
	const hasPersonalization = hasTextOption || hasNfcOption;

	const sortedIcons = useMemo(() => {
		const scored = GOOGLE_MATERIAL_ICONS.map((icon) => ({ icon, score: scoreIcon(icon, iconSearch) })).sort((a, b) => b.score - a.score || a.icon.localeCompare(b.icon));
		return scored.map((entry) => entry.icon);
	}, [iconSearch]);

	const handleAdd = () => {
		let personalization: string | undefined;
		if (personalizationType === 'text' && textOption.trim()) personalization = `Text (+$${TEXT_SURCHARGE.toFixed(2)}): ${textOption.trim()}`;
		else if (personalizationType === 'nfc' && nfcName.trim()) personalization = `NFC (+$${NFC_SURCHARGE.toFixed(2)}): ${nfcIcon} - ${nfcName.trim()}`;

		const lineId = `${productId}::${selectedVariant?.id || 'base'}::${personalizationType}::${textOption.trim()}::${nfcIcon}::${nfcName.trim()}`;
		addCartItem({ id: lineId, productId, slug, title, price: unitPrice, image, variantId: selectedVariant?.id, variantLabel, sku: selectedVariant?.sku, weightGrams: unitWeightGrams, personalization });
	};

	const baseId = `${productId}::${selectedVariant?.id || 'base'}`;

	return (
		<div style={{ display: 'grid', gap: '1rem' }}>
			{hasVariants && (
				<label style={{ display: 'grid', gap: '0.375rem' }}>
					<span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Options</span>
					<select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)' }}>
						{variants.map((variant) => (
							<option key={variant.id} value={variant.id}>{variant.label} - ${variant.price.toFixed(2)}</option>
						))}
					</select>
				</label>
			)}

			{hasPersonalization && (
				<div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
					<span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Personalization (cueism text +$5, NFC +$7)</span>
					<div style={{ display: 'flex', gap: '0.5rem' }}>
						<label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name={`pers-${baseId}`} checked={personalizationType === 'none'} onChange={() => setPersonalizationType('none')} /><span style={{ fontSize: '0.875rem', color: personalizationType === 'none' ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: personalizationType === 'none' ? 600 : 400 }}>cueism</span></label>
						{hasTextOption && <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name={`pers-${baseId}`} checked={personalizationType === 'text'} onChange={() => setPersonalizationType('text')} /><span style={{ fontSize: '0.875rem', color: personalizationType === 'text' ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: personalizationType === 'text' ? 600 : 400 }}>Text (+$5)</span></label>}
						{hasNfcOption && <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name={`pers-${baseId}`} checked={personalizationType === 'nfc'} onChange={() => setPersonalizationType('nfc')} /><span style={{ fontSize: '0.875rem', color: personalizationType === 'nfc' ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: personalizationType === 'nfc' ? 600 : 400 }}>NFC (+$7)</span></label>}
					</div>

					{personalizationType === 'text' && (
						<div style={{ display: 'grid', gap: '0.5rem' }}>
							<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Enter text for top of product:</label>
							<input type="text" value={textOption} onChange={(e) => setTextOption(e.target.value)} placeholder="Your text (max 6 chars)" maxLength={6} style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)', fontSize: '0.875rem' }} />
						</div>
					)}

					{personalizationType === 'nfc' && (
						<div style={{ display: 'grid', gap: '0.75rem' }}>
							<div>
								<label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>Search Google Material icons:</label>
								<input type="text" value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} placeholder="Search icons (person, security, car, medical, business...)" style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)', fontSize: '0.875rem' }} />
							</div>

							<div style={{ padding: '0.625rem 0.75rem', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
								<span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-accent)' }}>{nfcIcon}</span>
								<span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.95rem' }}>Selected icon: {nfcIcon.replace(/_/g, ' ')}</span>
							</div>

							<div>
								<label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>Choose icon ({sortedIcons.length} shown):</label>
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', gap: '0.375rem', height: '220px', overflowY: 'auto', paddingRight: '0.25rem', alignContent: 'start' }}>
									{sortedIcons.map((icon) => (
										<button key={icon} type="button" onClick={() => setNfcIcon(icon)} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: nfcIcon === icon ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: nfcIcon === icon ? 'var(--color-bg-surface)' : 'var(--color-bg-base)', cursor: 'pointer' }} title={icon.replace(/_/g, ' ')}>
											<span className="material-symbols-outlined" style={{ fontSize: '20px', color: nfcIcon === icon ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>{icon}</span>
										</button>
									))}
								</div>
								<div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Results are ranked but the full icon list remains available.</div>
							</div>

							<div>
								<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Enter name/details for NFC:</label>
								<input type="text" value={nfcName} onChange={(e) => setNfcName(e.target.value)} placeholder="e.g. John Smith, or 'Call 0412 345 678'" style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)', fontSize: '0.875rem' }} />
							</div>
						</div>
					)}
				</div>
			)}

			<div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
				Total: <strong style={{ color: 'var(--color-text-primary)' }}>${unitPrice.toFixed(2)}</strong>
				{personalizationSelected && <span> (includes +${personalizationSurcharge.toFixed(2)} personalization)</span>}
			</div>

			<button className="btn btn-primary" style={{ width: '100%', padding: '0.875rem 1.5rem', fontSize: '0.9375rem', fontWeight: 500, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 'var(--radius-sm)' }} disabled={disabled} onClick={handleAdd}>
				{disabled ? 'Out of Stock' : 'Add to Cart'}
			</button>
		</div>
	);
}
