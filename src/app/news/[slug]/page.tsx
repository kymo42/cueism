import Link from 'next/link';
import { getNewsBySlug, getNewsSlugs } from '@/lib/content';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getNewsSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = await getNewsBySlug(slug);
    if (!article) return { title: 'Not Found' };

    return {
        title: article.title,
        description: article.excerpt,
    };
}

export default async function NewsArticlePage({ params }: Props) {
    const { slug } = await params;
    const article = await getNewsBySlug(slug);

    if (!article) {
        notFound();
    }

    return (
        <>
            <div className="page-header">
                <div className="container" style={{ paddingTop: 'var(--space-4xl)', paddingBottom: 'var(--space-3xl)', marginBottom: 'var(--space-md)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    <Link href="/" style={{ color: 'var(--color-text-muted)' }}>Home</Link>
                    {' / '}
                    <Link href="/news" style={{ color: 'var(--color-text-muted)' }}>News</Link>
                    {' / '}
                    <span style={{ color: 'var(--color-primary)' }}>{article.title}</span>
                </div>
                <h1>{article.title}</h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)' }}>
                    {new Date(article.date).toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>

            {article.image && (
                <div className="container container--narrow">
                    <img
                        src={article.image}
                        alt={article.title}
                        style={{
                            width: '100%',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: 'var(--space-xl)',
                        }}
                    />
                </div>
            )}

            <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: article.htmlContent || '' }}
            />
        </>
    );
}
