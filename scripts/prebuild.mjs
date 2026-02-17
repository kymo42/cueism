import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');
const outputDirectory = path.join(process.cwd(), 'src', 'generated');

async function generateNews() {
    console.log('Generating news data...');

    // Ensure output directory exists
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const newsDir = path.join(contentDirectory, 'news');

    if (!fs.existsSync(newsDir)) {
        console.warn('No news directory found at:', newsDir);
        fs.writeFileSync(path.join(outputDirectory, 'news.json'), '[]');
        return;
    }

    const fileNames = fs.readdirSync(newsDir).filter((f) => f.endsWith('.md'));
    const articles = [];

    for (const fileName of fileNames) {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(newsDir, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Render HTML content
        const processedContent = await remark().use(html).process(content);
        const htmlContent = processedContent.toString();

        articles.push({
            slug,
            title: data.title || slug,
            date: data.date || '',
            excerpt: data.excerpt || '',
            image: data.image || undefined,
            content: content,
            htmlContent: htmlContent,
        });
    }

    // Sort by date descending
    articles.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    });

    fs.writeFileSync(path.join(outputDirectory, 'news.json'), JSON.stringify(articles, null, 2));
    console.log(`Generated ${articles.length} news articles in src/generated/news.json`);
}

generateNews().catch(console.error);
