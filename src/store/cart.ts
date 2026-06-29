import { atom, map } from 'nanostores';
import type { PersonalizationType } from '../utils/surcharges';

export type CartItem = {
	id: string;
	productId: string;
	slug: string;
	title: string;
	price: number;
	image?: string;
	quantity: number;
	variantId?: string;
	variantLabel?: string;
	color?: string;
	nogennColor?: string;
	logoUrl?: string;
	faceUrl?: string;
	sku?: string;
	weightGrams?: number;
	personalization?: string;
	// Personalization choice, used server-side by /api/checkout to recompute the
	// surcharge. Never trust the client-sent `price`.
	personalizationType?: PersonalizationType;
};

export const cartItems = map<Record<string, CartItem>>({});
export const isCartOpen = atom(false);

export function addCartItem(item: Omit<CartItem, 'quantity'>) {
	const existing = cartItems.get()[item.id];
	if (existing) {
		cartItems.setKey(item.id, {
			...existing,
			quantity: existing.quantity + 1,
		});
	} else {
		cartItems.setKey(item.id, {
			...item,
			quantity: 1,
		});
	}
	isCartOpen.set(true);
}

export function removeCartItem(id: string) {
	const items = { ...cartItems.get() };
	delete items[id];
	cartItems.set(items);
}

export function updateQuantity(id: string, quantity: number) {
	if (quantity <= 0) {
		removeCartItem(id);
		return;
	}
	const existing = cartItems.get()[id];
	if (existing) {
		cartItems.setKey(id, {
			...existing,
			quantity,
		});
	}
}
