import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Restaurant Industry Blog - Insights, Guides & Best Practices',
  description:
    'Expert insights on restaurant management, food cost optimization, technology trends, and operational best practices. Resources for restaurant owners and operators in India.',
  keywords: ['restaurant management blog', 'restaurant industry insights India', 'food cost management tips', 'restaurant technology trends', 'restaurant operations best practices'],
}

const featuredPost = {
  title: 'The Complete Guide to Reducing Food Costs in Multi-Outlet Restaurants',
  excerpt: 'A data-driven approach to cutting food costs by 10-18% using recipe management, inventory tracking, and variance analysis. Real case studies from Indian restaurant chains.',
  category: 'Food Cost Management',
  readTime: '12 min read',
  date: 'Feb 28, 2026',
  href: '/blog',
}

const posts = [
  {
    title: 'QR Code Ordering: How Indian Restaurants Are Boosting Revenue by 20%',
    excerpt: 'Detailed analysis of how QR ordering impacts average order value, table turns, and labor costs across different restaurant formats.',
    category: 'Technology',
    readTime: '8 min read',
    date: 'Feb 22, 2026',
    href: '/blog',
  },
  {
    title: 'Restaurant Inventory Management: From Spreadsheets to Real-Time Tracking',
    excerpt: 'Step-by-step guide to transitioning from manual inventory management to automated real-time tracking across multiple outlets.',
    category: 'Operations',
    readTime: '10 min read',
    date: 'Feb 15, 2026',
    href: '/blog',
  },
  {
    title: 'How to Choose the Right Restaurant POS System in India (2026 Guide)',
    excerpt: 'Comprehensive buyer\'s guide covering features, pricing, integrations, and key decision factors for choosing a restaurant POS in India.',
    category: 'Buying Guides',
    readTime: '15 min read',
    date: 'Feb 8, 2026',
    href: '/blog',
  },
  {
    title: 'Building a Restaurant Loyalty Program That Actually Works',
    excerpt: 'Why most restaurant loyalty programs fail and how to build one that drives genuine repeat visits. Data from 200+ restaurants.',
    category: 'Marketing',
    readTime: '9 min read',
    date: 'Feb 1, 2026',
    href: '/blog',
  },
  {
    title: 'Cloud Kitchen Economics: Unit Economics, Technology, and Scaling',
    excerpt: 'Deep dive into cloud kitchen unit economics, the role of technology in operational efficiency, and strategies for scaling multi-brand operations.',
    category: 'Industry Insights',
    readTime: '11 min read',
    date: 'Jan 25, 2026',
    href: '/blog',
  },
  {
    title: 'GST Compliance for Restaurants: Everything You Need to Know in 2026',
    excerpt: 'Updated guide to GST rates, input tax credit, composition scheme, and compliance requirements for restaurants in India.',
    category: 'Compliance',
    readTime: '14 min read',
    date: 'Jan 18, 2026',
    href: '/blog',
  },
]

const categories = [
  'All',
  'Operations',
  'Technology',
  'Food Cost Management',
  'Marketing',
  'Industry Insights',
  'Buying Guides',
  'Compliance',
  'Case Studies',
]

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-12 lg:pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Resources & Insights
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Expert perspectives on restaurant operations, technology, and growth strategies for the Indian food service industry.
            </p>
          </div>

          {/* Categories */}
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  cat === 'All'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={featuredPost.href}
            className="block p-6 lg:p-10 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50/30 border border-primary-100 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">Featured</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><Tag className="w-3 h-3" /> {featuredPost.category}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {featuredPost.title}
            </h2>
            <p className="mt-3 text-base text-gray-600 max-w-3xl">{featuredPost.excerpt}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {featuredPost.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.title}
                href={post.href}
                className="p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">{post.category}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Stay ahead of the curve</h2>
          <p className="mt-2 text-gray-600">
            Weekly insights on restaurant technology, operations, and industry trends. No spam, ever.
          </p>
          <form className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
