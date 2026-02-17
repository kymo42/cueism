import Link from 'next/link';
import { getAllNews } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';

export const dynamic = 'force-static';

// Real Stripe products for featured section
const FEATURED_PRODUCTS = [
  { slug: 'chalkable', name: 'Chalkable', price: 'From $5.00', image: '/images/chalkables/satar.JPG', badge: 'Popular' },
  { slug: 'cheatstick', name: 'cheatStick', price: '$14.00', image: '/images/cheatstick/cs.jpg', badge: undefined },
  { slug: 'racksafe9', name: 'Racksafe9', price: '$20.00', image: '/images/racksafe9/9.jpg', badge: undefined },
  { slug: 'racksafe8', name: 'RackSafe8', price: '$20.00', image: '/images/racksafe8/888.jpg', badge: undefined },
];

export default function HomePage() {
  const news = getAllNews().slice(0, 2);

  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.82), rgba(255,255,255,0.82)), url(/images/site/spokncapn.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="hero__eyebrow">3D Printed in Australia</div>
        <h1 className="hero__title">
          Billiard Gear for the Discerning Player
        </h1>
        <p className="hero__subtitle">
          Robust, innovative accessories crafted from recycled materials.
          Every piece individually 3D printed—no two are the same.
        </p>
        <div className="hero__actions">
          <Link href="/shop" className="btn btn--primary btn--lg">
            Shop Now
          </Link>
          <Link href="/about" className="btn btn--outline btn--lg">
            Our Story
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{ marginTop: 0 }}>Featured Products</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
              Handcrafted billiard accessories made from recycled and biodegradable materials.
            </p>
          </div>
          <div className="product-grid">
            {FEATURED_PRODUCTS.map((product) => (
              <Link
                key={product.slug}
                href={`/shop/${product.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card fade-in-up">
                  <div className="card__image-wrapper">
                    <div
                      className="card__image"
                      style={{
                        overflow: 'hidden',
                        background: '#F5F5F4',
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    {product.badge && <span className="card__badge">{product.badge}</span>}
                  </div>
                  <div className="card__body">
                    <h3 className="card__title">{product.name}</h3>
                    <div className="card__price">
                      {product.price} <span>gst</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
            <Link href="/shop" className="btn btn--outline">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* About Strip */}
      <section
        className="section"
        style={{
          background: 'var(--color-primary)',
          color: 'var(--color-white)',
          textAlign: 'center',
        }}
      >
        <div className="container container--narrow">
          <h2 style={{ color: 'var(--color-white)', marginTop: 0 }}>
            Crafted for the Game You Love
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 'var(--text-lg)',
              lineHeight: 1.8,
              maxWidth: '600px',
              margin: '0 auto var(--space-xl)',
            }}
          >
            All products are individually 3D printed to order using recycled hard plastics
            and organic-based biodegradable thermoplastics. Not mass-produced from a single mould—every
            piece is unique, just like your game.
          </p>
          <Link href="/about" className="btn btn--primary btn--lg">
            Learn More
          </Link>
        </div>
      </section>

      {/* Latest News */}
      {news.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
              <h2 style={{ marginTop: 0 }}>Latest News</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Monthly billiard news roundup from around the world.
              </p>
            </div>
            <div className="news-grid">
              {news.map((article) => (
                <Link
                  key={article.slug}
                  href={`/news/${article.slug}`}
                  className="news-card"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="news-card__image"
                    />
                  )}
                  <div className="news-card__body">
                    <div className="news-card__date">
                      {new Date(article.date).toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <h3 className="news-card__title">{article.title}</h3>
                    <p className="news-card__excerpt">{article.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
              <Link href="/news" className="btn btn--outline">
                All News →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterForm />
    </>
  );
}
