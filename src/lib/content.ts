import newsData from '@/generated/news.json';

export interface NewsArticle {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    image?: string;
    content: string;
    htmlContent?: string;
}

export interface PageContent {
    slug: string;
    title: string;
    content: string;
    htmlContent?: string;
}

/**
 * Get all news articles sorted by date (newest first)
 */
export function getAllNews(): NewsArticle[] {
    // The JSON is already sorted by date in prebuild.mjs, but we can ensure it here too if needed.
    // Casting newsData to NewsArticle[] because JSON import might be inferred loosely
    return newsData as NewsArticle[];
}

/**
 * Get a single news article by slug with rendered HTML
 */
export async function getNewsBySlug(
    slug: string
): Promise<NewsArticle | null> {
    const article = newsData.find((a) => a.slug === slug);
    return (article as NewsArticle) || null;
}

/**
 * Get a page by slug
 * Note: Pages are not currently in the generated JSON, so this returns null.
 * If pages are needed in the future, add them to prebuild.mjs.
 */
export async function getPage(
    slug: string
): Promise<PageContent | null> {
    return null;
}

/**
 * Get all news slugs for static generation
 */
export function getNewsSlugs(): string[] {
    return newsData.map((a) => a.slug);
}

