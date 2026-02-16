import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
    if (!_stripe) {
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2026-01-28.clover',
            typescript: true,
        });
    }
    return _stripe;
}

export interface ProductWithPrices {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    images: string[];
    metadata: Stripe.Metadata;
    prices: {
        id: string;
        unit_amount: number | null;
        currency: string;
        nickname: string | null;
        metadata: Stripe.Metadata;
    }[];
    defaultPrice: {
        id: string;
        unit_amount: number | null;
        currency: string;
    } | null;
}

export async function getProducts(): Promise<ProductWithPrices[]> {
    const stripe = getStripeClient();
    const products = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
    });

    const productsWithPrices: ProductWithPrices[] = [];

    for (const product of products.data) {
        const prices = await stripe.prices.list({
            product: product.id,
            active: true,
        });

        const defaultPrice = product.default_price as Stripe.Price | null;

        productsWithPrices.push({
            id: product.id,
            name: product.name,
            slug: product.metadata.slug || product.id,
            description: product.description,
            images: product.images,
            metadata: product.metadata,
            prices: prices.data.map((p) => ({
                id: p.id,
                unit_amount: p.unit_amount,
                currency: p.currency,
                nickname: p.nickname,
                metadata: p.metadata,
            })),
            defaultPrice: defaultPrice
                ? {
                    id: defaultPrice.id,
                    unit_amount: defaultPrice.unit_amount,
                    currency: defaultPrice.currency,
                }
                : null,
        });
    }

    return productsWithPrices;
}

export async function getProductBySlug(
    slug: string
): Promise<ProductWithPrices | null> {
    const products = await getProducts();
    return products.find((p) => p.slug === slug) || null;
}

export function formatPrice(amount: number | null, currency = 'aud'): string {
    if (amount === null) return 'Contact for price';
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount / 100);
}
