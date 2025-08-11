import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  content: string
  excerpt: string
  readingTime: number
  featured?: boolean
  image?: string
}

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  excerpt: string
  readingTime: number
  featured?: boolean
  image?: string
}

const postsDirectory = path.join(process.cwd(), 'content/blog')

export function getBlogPosts(): BlogPostMeta[] {
  // Ensure the directory exists
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matterResult = matter(fileContents)

      return {
        slug,
        title: matterResult.data.title,
        description: matterResult.data.description,
        date: matterResult.data.date,
        author: matterResult.data.author,
        tags: matterResult.data.tags || [],
        excerpt: matterResult.data.excerpt || '',
        readingTime: calculateReadingTime(matterResult.content),
        featured: matterResult.data.featured || false,
        image: matterResult.data.image,
      }
    })

  // Sort posts by date
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    
    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    // Use remark to convert markdown into HTML string
    const processedContent = remark()
      .use(html)
      .use(remarkGfm)
      .processSync(matterResult.content)
    const contentHtml = processedContent.toString()

    return {
      slug,
      title: matterResult.data.title,
      description: matterResult.data.description,
      date: matterResult.data.date,
      author: matterResult.data.author,
      tags: matterResult.data.tags || [],
      content: contentHtml,
      excerpt: matterResult.data.excerpt || '',
      readingTime: calculateReadingTime(matterResult.content),
      featured: matterResult.data.featured || false,
      image: matterResult.data.image,
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
}

export function getFeaturedPosts(): BlogPostMeta[] {
  const posts = getBlogPosts()
  return posts.filter(post => post.featured).slice(0, 3)
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  const posts = getBlogPosts()
  return posts.filter(post => post.tags.includes(tag))
}

export function getAllTags(): string[] {
  const posts = getBlogPosts()
  const tags = posts.flatMap(post => post.tags)
  return [...new Set(tags)].sort()
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function generateExcerpt(content: string, maxLength: number = 160): string {
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (plainText.length <= maxLength) return plainText
  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
} 