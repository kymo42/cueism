import { PRODUCT_DATA } from '@/lib/products';
import ProductDetail from '@/components/ProductDetail';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateStaticParams() {
    return Object.keys(PRODUCT_DATA).map((slug) => ({
        slug,
    }));
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    const product = PRODUCT_DATA[slug];

    if (!product) {
        return (
            <div className="container" style={{ padding: 'var(--space-4xl) var(--space-lg)', textAlign: 'center' }}>
                <h1>Product not found</h1>
                <p>The product you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/shop" className="btn btn--primary" style={{ marginTop: 'var(--space-lg)' }}>
                    Back to Shop
                </Link>
            </div>
        );
    }

    return <ProductDetail product={product} slug={slug} />;
}
