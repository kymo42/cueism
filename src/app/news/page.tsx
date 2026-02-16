import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllNews } from '@/lib/content';

export const metadata: Metadata = {
    title: 'News',
    description: 'Stay informed with the latest billiard news, industry insights, and cueism updates.',
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
                        <p>No news articles yet. Check back soon!</p>
                    </div>
                ) : (
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
                )}
            </div>
        </>
    );
}
