import Link from 'next/link';

interface ProductCardProps {
    slug: string;
    name: string;
    image?: string;
    price: string;
    badge?: string;
}

export default function ProductCard({ slug, name, image, price, badge }: ProductCardProps) {
    return (
        <Link href={`/shop/${slug}`} style={{ textDecoration: 'none' }}>
            <div className="card">
                <div className="card__image-wrapper">
                    {image ? (
                        <img src={image} alt={name} className="card__image" />
                    ) : (
                        <div className="card__image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                            No image
                        </div>
                    )}
                    {badge && <span className="card__badge">{badge}</span>}
                </div>
                <div className="card__body">
                    <h3 className="card__title">{name}</h3>
                    <div className="card__price">
                        {price} <span>gst</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
