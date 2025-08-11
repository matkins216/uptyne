import { Metadata } from 'next'
import Link from 'next/link'
import { getBlogPosts, getFeaturedPosts } from '@/lib/blog'
import { Calendar, Clock, User, Tag, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - Uptyne',
  description: 'Latest insights, tips, and updates about website monitoring, uptime tracking, and digital infrastructure.',
  openGraph: {
    title: 'Blog - Uptyne',
    description: 'Latest insights, tips, and updates about website monitoring, uptime tracking, and digital infrastructure.',
    type: 'website',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const featuredPosts = await getFeaturedPosts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Uptyne Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest insights on website monitoring, uptime tracking, 
            and digital infrastructure management.
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Posts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <FeaturedPostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">All Posts</h2>
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FeaturedPostCard({ post }: { post: any }) {
  return (
    <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {post.image && (
        <div className="aspect-video bg-gray-200">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.readingTime} min read
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt || post.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">By {post.author}</span>
          <Link 
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Read more
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.author}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
              {post.title}
            </Link>
          </h3>
          
          <p className="text-gray-600 mb-4">
            {post.excerpt || post.description}
          </p>
          
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <Link 
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Read full article
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  )
} 