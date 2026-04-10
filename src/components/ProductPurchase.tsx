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

const NFC_ICONS = [
	{ id: 'person', name: 'Person' },
	{ id: 'home', name: 'Home' },
	{ id: 'email', name: 'Email' },
	{ id: 'phone', name: 'Phone' },
	{ id: 'link', name: 'Link' },
	{ id: 'Qr_code', name: 'QR Code' },
	{ id: 'wifi', name: 'WiFi' },
	{ id: 'share', name: 'Share' },
	{ id: 'vpn_key', name: 'Key' },
	{ id: 'badge', name: 'ID Badge' },
	{ id: 'contact_emergency', name: 'Medical' },
	{ id: 'pets', name: 'Pet' },
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

	const selectedVariant = useMemo(
		() => variants.find((variant) => variant.id === selectedVariantId),
		[variants, selectedVariantId],
	);

	const unitPrice = selectedVariant?.price ?? basePrice;
	const unitStock = selectedVariant?.stock ?? baseStock;
	const unitWeightGrams = selectedVariant?.weightGrams ?? baseWeightGrams;
	const variantLabel = selectedVariant?.label;
	const disabled = trackStock && unitStock <= 0;

	const hasPersonalization = hasTextOption || hasNfcOption;

	const handleAdd = () => {
		let personalization: string | undefined;
		
		if (personalizationType === 'text' && textOption.trim()) {
			personalization = `Text: ${textOption.trim()}`;
		} else if (personalizationType === 'nfc' && nfcName.trim()) {
			const iconName = NFC_ICONS.find(i => i.id === nfcIcon)?.name || nfcIcon;
			personalization = `NFC: ${iconName} - ${nfcName.trim()}`;
		}

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
					<span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Personalization</span>
					
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
									Select icon:
								</label>
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
									{NFC_ICONS.map((icon) => (
										<button
											key={icon.id}
											type="button"
											onClick={() => setNfcIcon(icon.id)}
											style={{
												width: '40px',
												height: '40px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												border: nfcIcon === icon.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
												borderRadius: 'var(--radius-sm)',
												background: nfcIcon === icon.id ? 'var(--color-bg-surface)' : 'var(--color-bg-base)',
												cursor: 'pointer',
												fontSize: '1.25rem',
											}}
											title={icon.name}
										>
											{getIconEmoji(icon.id)}
										</button>
									))}
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

function getIconEmoji(iconId: string): string {
	const icons: Record<string, string> = {
		person: '👤',
		home: '🏠',
		email: '✉️',
		phone: '📞',
		link: '🔗',
		Qr_code: '⬜',
		wifi: '📶',
		share: '📤',
		vpn_key: '🔑',
		badge: '📛',
		contact_emergency: '🏥',
		pets: '🐾',
	};
	return icons[iconId] || '●';
}