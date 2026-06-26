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
	nogennColours?: string[];
	showColor?: boolean;
	allowColourRequest?: boolean;
	allowLogoUpload?: boolean;
	embeddedNfcOnly?: boolean;
	useRadioVariants?: boolean;
	logoSurcharge?: number;
	initialsOrIconOnly?: boolean;
};

type PersonalizationType = 'none' | 'text' | 'nfc' | 'initials';

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
	nogennColours = [],
	showColor = true,
	allowColourRequest = false,
	allowLogoUpload = false,
	embeddedNfcOnly = false,
	useRadioVariants = false,
	logoSurcharge = 0,
	initialsOrIconOnly = false,
}: ProductPurchaseProps) {
	const hasVariants = variants.length > 0;
	const hasNogenn = nogennColours.length > 0;
	const colourOptions = allowColourRequest ? ['white', 'black', 'orange', 'request'] : ['white', 'black', 'orange'];
	const [selectedVariantId, setSelectedVariantId] = useState(hasVariants ? variants[0]?.id || '' : '');
	const [textOption, setTextOption] = useState('');
	const [nfcIcon, setNfcIcon] = useState('person');
	const [nfcName, setNfcName] = useState('');
	const [iconSearch, setIconSearch] = useState('');
	const [selectedColor, setSelectedColor] = useState<string>('white');
	const [requestedColour, setRequestedColour] = useState('');
	const [selectedNogenn, setSelectedNogenn] = useState(nogennColours[0] || '');
	const [logoUrl, setLogoUrl] = useState('');
	const [logoName, setLogoName] = useState('');
	const [logoUploading, setLogoUploading] = useState(false);
	const [initials, setInitials] = useState('');
	// Auto-select NFC for embedded-NFC-only products
	const [personalizationType, setPersonalizationType] = useState<PersonalizationType>(embeddedNfcOnly ? 'nfc' : 'none');
	const [logoError, setLogoError] = useState('');
	const [nfcDigitalInfo, setNfcDigitalInfo] = useState('');

	const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setLogoError('');
		setLogoUrl('');
		setLogoName('');
		setLogoUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const res = await fetch('/api/upload-logo', { method: 'POST', body: formData });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Upload failed');
			setLogoUrl(data.url);
			setLogoName(data.filename || file.name);
		} catch (err) {
			setLogoError(err instanceof Error ? err.message : 'Upload failed');
		} finally {
			setLogoUploading(false);
		}
	};

	const selectedVariant = useMemo(() => variants.find((variant) => variant.id === selectedVariantId), [variants, selectedVariantId]);
const personalizationSurcharge = embeddedNfcOnly ? 0 : initialsOrIconOnly ? (personalizationType === 'text' ? TEXT_SURCHARGE : personalizationType === 'nfc' ? NFC_SURCHARGE : 0) : personalizationType === 'nfc' ? NFC_SURCHARGE : personalizationType === 'text' ? TEXT_SURCHARGE : 0;
const logoProcessingSurcharge = logoUrl && logoSurcharge > 0 ? logoSurcharge : 0;
const personalizationSelected = personalizationSurcharge > 0;
const personalizationValid =
	personalizationType === 'none' ||
	(personalizationType === 'text' && textOption.trim().length > 0) ||
	(personalizationType === 'nfc' && !embeddedNfcOnly && !initialsOrIconOnly && nfcName.trim().length > 0) ||
	(personalizationType === 'nfc' && initialsOrIconOnly) ||
	(embeddedNfcOnly && nfcDigitalInfo.trim().length > 0) ||
	(initialsOrIconOnly && personalizationType === 'initials' && initials.trim().length > 0);
const baseUnitPrice = selectedVariant?.price ?? basePrice;
const unitPrice = baseUnitPrice + personalizationSurcharge + logoProcessingSurcharge;
	const unitStock = selectedVariant?.stock ?? baseStock;
	const unitWeightGrams = selectedVariant?.weightGrams ?? baseWeightGrams;
	const variantLabel = selectedVariant?.label;
	const outOfStock = trackStock && unitStock <= 0;
	const disabled = outOfStock || !personalizationValid;
	const buttonLabel = outOfStock
			? 'Out of Stock'
			: !personalizationValid
				? embeddedNfcOnly
					? 'Enter your digital details'
					: personalizationType === 'nfc'
						? 'Enter NFC details'
						: 'Enter your text'
				: 'Add to Cart';
	const hasPersonalization = hasTextOption || hasNfcOption;

	const sortedIcons = useMemo(() => {
		const scored = GOOGLE_MATERIAL_ICONS.map((icon) => ({ icon, score: scoreIcon(icon, iconSearch) })).sort((a, b) => b.score - a.score || a.icon.localeCompare(b.icon));
		return scored.map((entry) => entry.icon);
	}, [iconSearch]);

	const handleAdd = () => {
		let personalization: string | undefined;
		if (personalizationType === 'text' && textOption.trim()) personalization = `Text (+$${TEXT_SURCHARGE.toFixed(2)}): ${textOption.trim()}`;
		else if (personalizationType === 'nfc' && nfcName.trim()) personalization = `NFC (+$${NFC_SURCHARGE.toFixed(2)}): ${nfcIcon} - ${nfcName.trim()}`;
		else if (embeddedNfcOnly && nfcDigitalInfo.trim()) {
			personalization = `NFC: ${nfcDigitalInfo.trim()}`;
		}

		const lineId = `${productId}::${selectedVariant?.id || 'base'}::${personalizationType}::${textOption.trim()}::${nfcIcon}::${nfcName.trim()}::${nfcDigitalInfo}::${initials.trim()}`;
		addCartItem({
			id: `${lineId}::${selectedColor}::${requestedColour.trim()}::${selectedNogenn}::${logoUrl}`,
			productId,
			slug,
			title,
			price: unitPrice,
			image,
			variantId: selectedVariant?.id,
			variantLabel,
			color: showColor
				? selectedColor === 'request'
					? `Requested: ${requestedColour.trim() || '(unspecified)'}`
					: selectedColor
				: undefined,
			nogennColor: hasNogenn ? selectedNogenn : undefined,
			logoUrl: allowLogoUpload && logoUrl ? logoUrl : undefined,
			sku: selectedVariant?.sku,
			weightGrams: unitWeightGrams,
			personalization,
		});
	};

	const baseId = `${productId}::${selectedVariant?.id || 'base'}`;

	return (
	<div style={{ display: 'grid', gap: '1rem' }}>
		{hasVariants && (
			useRadioVariants ? (
				<div style={{ display: 'grid', gap: '0.375rem' }}>
					<span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{variants[0]?.optionGroup || 'Options'}</span>
					<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
						{variants.map((variant) => (
							<label key={variant.id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', padding: '0.5rem 0.75rem', border: selectedVariantId === variant.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: selectedVariantId === variant.id ? 'var(--color-bg-surface)' : 'var(--color-bg-base)' }}>
								<input type="radio" name={`variant-${baseId}`} value={variant.id} checked={selectedVariantId === variant.id} onChange={() => setSelectedVariantId(variant.id)} style={{ accentColor: 'var(--color-accent)' }} />
								<span style={{ fontSize: '0.875rem', textTransform: 'capitalize', color: selectedVariantId === variant.id ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: selectedVariantId === variant.id ? 600 : 400 }}>
									{variant.label} ({variant.stock} left)
								</span>
							</label>
						))}
					</div>
				</div>
			) : (
				<label style={{ display: 'grid', gap: '0.375rem' }}>
					<span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Options</span>
					<select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)' }}>
						{variants.map((variant) => (
							<option key={variant.id} value={variant.id}>{variant.label} - ${variant.price.toFixed(2)}</option>
						))}
					</select>
				</label>
			)
		)}

			{showColor && (
			<div style={{ display: 'grid', gap: '0.375rem' }}>
				<span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Color</span>
				<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
					{colourOptions.map((color) => (
						<button
							key={color}
							type="button"
							onClick={() => setSelectedColor(color)}
							style={{
								padding: '0.5rem 0.75rem',
								borderRadius: 'var(--radius-sm)',
								border: selectedColor === color ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
								background: selectedColor === color ? 'var(--color-bg-surface)' : 'var(--color-bg-base)',
								color: selectedColor === color ? 'var(--color-accent)' : 'var(--color-text-secondary)',
								fontWeight: selectedColor === color ? 600 : 500,
								textTransform: 'capitalize',
								cursor: 'pointer',
							}}
						>
							{color === 'request' ? 'Request a colour' : color}
						</button>
					))}
				</div>
				{selectedColor === 'request' && (
					<input
						type="text"
						value={requestedColour}
						onChange={(e) => setRequestedColour(e.target.value)}
						placeholder="Which colour would you like?"
						style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', marginTop: '0.25rem' }}
					/>
				)}
			</div>
			)}

			{hasNogenn && (
				<div style={{ display: 'grid', gap: '0.375rem' }}>
					<span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Nogenn colour</span>
					<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
						{nogennColours.map((colour) => (
							<button
								key={colour}
								type="button"
								onClick={() => setSelectedNogenn(colour)}
								style={{
									padding: '0.5rem 0.75rem',
									borderRadius: 'var(--radius-sm)',
									border: selectedNogenn === colour ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
									background: selectedNogenn === colour ? 'var(--color-bg-surface)' : 'var(--color-bg-base)',
									color: selectedNogenn === colour ? 'var(--color-accent)' : 'var(--color-text-secondary)',
									fontWeight: selectedNogenn === colour ? 600 : 500,
									textTransform: 'capitalize',
									cursor: 'pointer',
								}}
							>
								{colour}
							</button>
						))}
					</div>
				</div>
			)}

			{allowLogoUpload && (
				<div style={{ display: 'grid', gap: '0.375rem' }}>
					<span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Upload logo (+${logoSurcharge.toFixed(2)} processing)</span>
					<input type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: '0.8125rem' }} />
					{logoUploading && <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Uploading…</span>}
					{logoUrl && !logoUploading && (
						<span style={{ fontSize: '0.8125rem', color: 'var(--color-accent)' }}>✓ {logoName} attached</span>
					)}
					{logoError && <span style={{ fontSize: '0.8125rem', color: 'crimson' }}>{logoError}</span>}
				</div>
			)}

			{hasPersonalization && (
				<div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
					{!embeddedNfcOnly && !initialsOrIconOnly && (
						<>
							<span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Personalization (cueism text +$5, NFC +$7)</span>
							<div style={{ display: 'flex', gap: '0.5rem' }}>
								<label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name={`pers-${baseId}`} checked={personalizationType === 'none'} onChange={() => setPersonalizationType('none')} /><span style={{ fontSize: '0.875rem', color: personalizationType === 'none' ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: personalizationType === 'none' ? 600 : 400 }}>cueism</span></label>
								{hasTextOption && <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name={`pers-${baseId}`} checked={personalizationType === 'text'} onChange={() => setPersonalizationType('text')} /><span style={{ fontSize: '0.875rem', color: personalizationType === 'text' ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: personalizationType === 'text' ? 600 : 400 }}>Text (+$5)</span></label>}
								{hasNfcOption && <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name={`pers-${baseId}`} checked={personalizationType === 'nfc'} onChange={() => setPersonalizationType('nfc')} /><span style={{ fontSize: '0.875rem', color: personalizationType === 'nfc' ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: personalizationType === 'nfc' ? 600 : 400 }}>NFC (+$7)</span></label>}
							</div>
						</>
					)}

					{initialsOrIconOnly && (
						<>
							<span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Personalization (initials +$5, icon +$7)</span>
							<div style={{ display: 'flex', gap: '0.5rem' }}>
								<label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name={`pers-${baseId}`} checked={personalizationType === 'none'} onChange={() => setPersonalizationType('none')} /><span style={{ fontSize: '0.875rem', color: personalizationType === 'none' ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: personalizationType === 'none' ? 600 : 400 }}>None</span></label>
								<label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name={`pers-${baseId}`} checked={personalizationType === 'initials'} onChange={() => setPersonalizationType('initials')} /><span style={{ fontSize: '0.875rem', color: personalizationType === 'initials' ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: personalizationType === 'initials' ? 600 : 400 }}>Initials (+$5)</span></label>
								<label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="radio" name={`pers-${baseId}`} checked={personalizationType === 'nfc'} onChange={() => setPersonalizationType('nfc')} /><span style={{ fontSize: '0.875rem', color: personalizationType === 'nfc' ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: personalizationType === 'nfc' ? 600 : 400 }}>Icon (+$7)</span></label>
							</div>
						</>
					)}

					{personalizationType === 'text' && !embeddedNfcOnly && !initialsOrIconOnly && (
						<div style={{ display: 'grid', gap: '0.5rem' }}>
							<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Enter text for top of product:</label>
							<input type="text" value={textOption} onChange={(e) => setTextOption(e.target.value)} placeholder="Your text (max 6 chars)" maxLength={6} style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)', fontSize: '0.875rem' }} />
						</div>
					)}

					{initialsOrIconOnly && personalizationType === 'initials' && (
						<div style={{ display: 'grid', gap: '0.5rem' }}>
							<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Enter your initials (max 4 characters):</label>
							<input type="text" value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase())} placeholder="e.g. JS or ABC" maxLength={4} style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)', fontSize: '0.875rem' }} />
						</div>
					)}

					{personalizationType === 'nfc' && !embeddedNfcOnly && (
						<div style={{ display: 'grid', gap: '0.75rem' }}>
							<div>
								<label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>Search Google Material icons:</label>
								<input type="text" value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} placeholder="Search icons (person, security, car, medical, business...)" style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)', fontSize: '0.875rem' }} />
							</div>

							<div style={{ padding: '0.625rem 0.75rem', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
								<span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-accent)' }}>{nfcIcon}</span>
								<span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.95rem' }}>Selected icon: {nfcIcon.replace(/_/g, ' ') || initialsOrIconOnly ? nfcIcon.replace(/_/g, ' ') : nfcName.trim() || 'Enter details'}</span>
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

							{!initialsOrIconOnly && (
								<div>
									<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Enter name/details for NFC:</label>
									<input type="text" value={nfcName} onChange={(e) => setNfcName(e.target.value)} placeholder="e.g. John Smith, or 'Call 0412 345 678'" style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)', fontSize: '0.875rem' }} />
								</div>
							)}
						</div>
					)}

					{embeddedNfcOnly && (
						<div style={{ display: 'grid', gap: '0.75rem' }}>
							<span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>NFC Digital Info</span>
							<span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Enter the one thing you'd like on the NFC chip — a URL, phone number, email, or social handle (one item only, the chip is tiny).</span>
							<input type="text" value={nfcDigitalInfo} onChange={(e) => setNfcDigitalInfo(e.target.value)} placeholder="e.g. 0412345678 or @yourhandle" style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-primary)', fontSize: '0.875rem' }} />
						</div>
					)}
				</div>
			)}

			<div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
				Total: <strong style={{ color: 'var(--color-text-primary)' }}>${unitPrice.toFixed(2)}</strong>
				{personalizationSelected && <span> (includes +${personalizationSurcharge.toFixed(2)} personalization)</span>}
				{logoProcessingSurcharge > 0 && <span> (includes +${logoProcessingSurcharge.toFixed(2)} logo processing)</span>}
			</div>

			<button className="btn btn-primary" style={{ width: '100%', padding: '0.875rem 1.5rem', fontSize: '0.9375rem', fontWeight: 500, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 'var(--radius-sm)' }} disabled={disabled} onClick={handleAdd}>
				{buttonLabel}
			</button>
		</div>
	);
}
