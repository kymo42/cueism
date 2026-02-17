import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllNews } from '@/lib/content';

export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'News',
    description:
        'Stay Informed with the latest cueism updates. Discover in-depth articles and timely news about billiards technology and industry insights.',
};

export default function NewsPage() {
    const news = getAllNews();

    return (
        <>
            <div className="page-header">
                <h1>News</h1>
                <p>
                    Stay informed with the latest billiard news roundups,
                    industry insights, and cueism updates.
                </p>
            </div>

            <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
                {news.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--color-text-muted)' }}>
                        No news articles yet. Check back soon!
                    </div>
                ) : (
                    <>
                        {/* Featured / latest article — full-width hero card */}
                        {news[0] && (
                            <Link
                                href={`/news/${news[0].slug}`}
                                style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--space-2xl)' }}
                            >
                                <div
                                    style={{
                                        position: 'relative',
                                        borderRadius: 'var(--radius-lg)',
                                        overflow: 'hidden',
                                        background: '#F5F5F4',
                                        minHeight: 360,
                                    }}
                                >
                                    {news[0].image && (
                                        <img
                                            src={news[0].image}
                                            alt={news[0].title}
                                            style={{
                                                width: '100%',
                                                height: 360,
                                                objectFit: 'cover',
                                                display: 'block',
                                            }}
                                        />
                                    )}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent 60%)',
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            padding: 'var(--space-xl)',
                                            color: '#fff',
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                background: 'var(--color-accent)',
                                                color: '#fff',
                                                fontSize: 'var(--text-xs)',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                padding: '4px 10px',
                                                borderRadius: 'var(--radius-sm)',
                                                marginBottom: 'var(--space-sm)',
                                            }}
                                        >
                                            Latest
                                        </span>
                                        <h2 style={{ color: '#fff', marginTop: 0, marginBottom: 'var(--space-xs)' }}>
                                            {news[0].title}
                                        </h2>
                                        <p
                                            style={{
                                                color: 'rgba(255,255,255,0.8)',
                                                fontSize: 'var(--text-sm)',
                                                margin: 0,
                                                maxWidth: 700,
                                            }}
                                        >
                                            {news[0].excerpt}
                                        </p>
                                        <div
                                            style={{
                                                marginTop: 'var(--space-sm)',
                                                fontSize: 'var(--text-xs)',
                                                color: 'rgba(255,255,255,0.6)',
                                            }}
                                        >
                                            {new Date(news[0].date).toLocaleDateString('en-AU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Older articles — card grid */}
                        {news.length > 1 && (
                            <>
                                <h3
                                    style={{
                                        textTransform: 'uppercase',
                                        fontSize: 'var(--text-xs)',
                                        letterSpacing: '0.12em',
                                        color: 'var(--color-text-muted)',
                                        marginBottom: 'var(--space-lg)',
                                    }}
                                >
                                    Previous Articles
                                </h3>
                                <div className="news-grid">
                                    {news.slice(1).map((article) => (
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
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
