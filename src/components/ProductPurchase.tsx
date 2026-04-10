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

const PERSONALIZATION_SURCHARGE = 5;

const GOOGLE_MATERIAL_ICONS = [
	'person', 'home', 'email', 'phone', 'link', 'qr_code', 'wifi', 'share', 'vpn_key', 'badge', 'contact_emergency', 'pets',
	'car_repair', 'directions_bike', 'sports_esports', 'favorite', 'star', 'security', 'key', 'shield', 'lock', 'fingerprint',
	'medical_services', 'emergency', 'school', 'work', 'business', 'storefront', 'restaurant', 'local_cafe', 'music_note',
	'photo_camera', 'videocam', 'palette', 'draw', 'flight', 'train', 'directions_car', 'map', 'place', 'public', 'language',
	'smartphone', 'laptop', 'computer', 'headphones', 'watch', 'charging_station', 'bolt', 'eco', 'park', 'forest',
];

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

	const [personalizationType, setPersonalizationType] = useState<PersonalizationType>('none');
	const [textOption, setTextOption] = useState('');
	const [nfcIcon, setNfcIcon] = useState('person');
	const [nfcName, setNfcName] = useState('');
	const [iconSearch, setIconSearch] = useState('');

	const selectedVariant = useMemo(
		() => variants.find((variant) => variant.id === selectedVariantId),
		[variants, selectedVariantId],
	);

	const personalizationSelected = personalizationType === 'text' || personalizationType === 'nfc';
	const personalizationValid =
		personalizationType === 'none' ||
		(personalizationType === 'text' && textOption.trim().length > 0) ||
		(personalizationType === 'nfc' && nfcName.trim().length > 0);

	const baseUnitPrice = selectedVariant?.price ?? basePrice;
	const unitPrice = baseUnitPrice + (personalizationSelected ? PERSONALIZATION_SURCHARGE : 0);
	const unitStock = selectedVariant?.stock ?? baseStock;
	const unitWeightGrams = selectedVariant?.weightGrams ?? baseWeightGrams;
	const variantLabel = selectedVariant?.label;
	const disabled = (trackStock && unitStock <= 0) || !personalizationValid;

	const hasPersonalization = hasTextOption || hasNfcOption;

	const filteredIcons = GOOGLE_MATERIAL_ICONS.filter((icon) =>
		icon.replace(/_/g, ' ').toLowerCase().includes(iconSearch.toLowerCase().trim()),
	).slice(0, 60);

	const handleAdd = () => {
		let personalization: string | undefined;

		if (personalizationType === 'text' && textOption.trim()) {
			personalization = `Text (+$${PERSONALIZATION_SURCHARGE.toFixed(2)}): ${textOption.trim()}`;
		} else if (personalizationType === 'nfc' && nfcName.trim()) {
			personalization = `NFC (+$${PERSONALIZATION_SURCHARGE.toFixed(2)}): ${nfcIcon} - ${nfcName.trim()}`;
		}

		const lineId = `${productId}::${selectedVariant?.id || 'base'}::${personalizationType}::${textOption.trim()}::${nfcIcon}::${nfcName.trim()}`;
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
			personalization,
		});
	};

	const baseId = `${productId}::${selectedVariant?.id || 'base'}`;

	return (
		<div style={{ display: 'grid', gap: '1rem' }}>
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
								{variant.label} - ${variant.price.toFixed(2)}
							</option>
						))}
					</select>
				</label>
			)}

			{hasPersonalization && (
				<div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
					<span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Personalization (+$5.00)</span>

					<div style={{ display: 'flex', gap: '0.5rem' }}>
						<label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
							<input
								type="radio"
								name={`pers-${baseId}`}
								checked={personalizationType === 'none'}
								onChange={() => setPersonalizationType('none')}
							/>
							<span style={{ fontSize: '0.875rem' }}>None</span>
						</label>

						{hasTextOption && (
							<label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
								<input
									type="radio"
									name={`pers-${baseId}`}
									checked={personalizationType === 'text'}
									onChange={() => setPersonalizationType('text')}
								/>
								<span style={{ fontSize: '0.875rem' }}>Text</span>
							</label>
						)}

						{hasNfcOption && (
							<label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
								<input
									type="radio"
									name={`pers-${baseId}`}
									checked={personalizationType === 'nfc'}
									onChange={() => setPersonalizationType('nfc')}
								/>
								<span style={{ fontSize: '0.875rem' }}>NFC</span>
							</label>
						)}
					</div>

					{personalizationType === 'text' && (
						<div style={{ display: 'grid', gap: '0.5rem' }}>
							<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
								Enter text for top of product:
							</label>
							<input
								type="text"
								value={textOption}
								onChange={(e) => setTextOption(e.target.value)}
								placeholder="Your name or text (max 30 chars)"
								maxLength={30}
								style={{
									width: '100%',
									padding: '0.625rem 0.875rem',
									border: '1px solid var(--color-border)',
									borderRadius: 'var(--radius-sm)',
									fontFamily: 'var(--font-primary)',
									fontSize: '0.875rem',
								}}
							/>
						</div>
					)}

					{personalizationType === 'nfc' && (
						<div style={{ display: 'grid', gap: '0.75rem' }}>
							<div>
								<label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>
									Search Google Material icons:
								</label>
								<input
									type="text"
									value={iconSearch}
									onChange={(e) => setIconSearch(e.target.value)}
									placeholder="Search icons (e.g. person, lock, car, medical)"
									style={{
										width: '100%',
										padding: '0.625rem 0.875rem',
										border: '1px solid var(--color-border)',
										borderRadius: 'var(--radius-sm)',
										fontFamily: 'var(--font-primary)',
										fontSize: '0.875rem',
									}}
								/>
							</div>

							<div>
								<label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>
									Select icon:
								</label>
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', gap: '0.375rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
									{filteredIcons.map((icon) => (
										<button
											key={icon}
											type="button"
											onClick={() => setNfcIcon(icon)}
											style={{
												width: '44px',
												height: '44px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												border: nfcIcon === icon ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
												borderRadius: 'var(--radius-sm)',
												background: nfcIcon === icon ? 'var(--color-bg-surface)' : 'var(--color-bg-base)',
												cursor: 'pointer',
											}}
											title={icon.replace(/_/g, ' ')}
										>
											<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
										</button>
									))}
								</div>
								<div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
									Selected: <code>{nfcIcon}</code> - More icons at{' '}
									<a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer">Google Icons</a>
								</div>
							</div>

							<div>
								<label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>
									Enter name/details for NFC:
								</label>
								<input
									type="text"
									value={nfcName}
									onChange={(e) => setNfcName(e.target.value)}
									placeholder="e.g. John Smith, or 'Call 0412 345 678'"
									style={{
										width: '100%',
										padding: '0.625rem 0.875rem',
										border: '1px solid var(--color-border)',
										borderRadius: 'var(--radius-sm)',
										fontFamily: 'var(--font-primary)',
										fontSize: '0.875rem',
									}}
								/>
							</div>
						</div>
					)}
				</div>
			)}

			<div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
				Total: <strong style={{ color: 'var(--color-text-primary)' }}>${unitPrice.toFixed(2)}</strong>
				{personalizationSelected && <span> (includes +$5.00 personalization)</span>}
			</div>

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
