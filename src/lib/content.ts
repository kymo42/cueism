import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

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
    const possiblePaths = [
        path.join(process.cwd(), 'content', 'news'),
        path.join(process.cwd(), '../content', 'news'), // specific to some build envs
        path.join(__dirname, 'content', 'news'),
        path.join(__dirname, '../../content', 'news'),
    ];

    console.log('Searching for news content in:', possiblePaths);

    let newsDir = '';
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            newsDir = p;
            console.log('Found news directory at:', p);
            break;
        }
    }

    if (!newsDir) {
        console.warn('News directory not found in any known location.');
        return [];
    }

    const fileNames = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md'));

    const articles: NewsArticle[] = fileNames.map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(newsDir, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            slug,
            title: data.title || slug,
            date: data.date || '',
            excerpt: data.excerpt || '',
            image: data.image || undefined,
            content,
        };
    });

    return articles.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    });
}

/**
 * Get a single news article by slug with rendered HTML
 */
export async function getNewsBySlug(
    slug: string
): Promise<NewsArticle | null> {
    const newsDir = path.join(contentDirectory, 'news');
    const fullPath = path.join(newsDir, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedContent = await remark().use(html).process(content);

    return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        excerpt: data.excerpt || '',
        image: data.image || undefined,
        content,
        htmlContent: processedContent.toString(),
    };
}

/**
 * Get a page by slug (from content/pages/)
 */
export async function getPage(
    slug: string
): Promise<PageContent | null> {
    const pagesDir = path.join(contentDirectory, 'pages');
    const fullPath = path.join(pagesDir, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedContent = await remark().use(html).process(content);

    return {
        slug,
        title: data.title || slug,
        content,
        htmlContent: processedContent.toString(),
    };
}

/**
 * Get all news slugs for static generation
 */
export function getNewsSlugs(): string[] {
    const newsDir = path.join(contentDirectory, 'news');

    if (!fs.existsSync(newsDir)) {
        return [];
    }

    return fs
        .readdirSync(newsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, ''));
}
