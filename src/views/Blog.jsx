'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Breadcrumb from '@/components/Breadcrumb';
import { Search, Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Blogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogCategories = ['All', 'Agency Tips', 'Industry Insights', 'Success Stories', 'Trends', 'Guides'];

  const featuredBlog = {
    id: 1,
    title: 'How to Choose the Right Business Service Provider in 2026',
    excerpt: 'A comprehensive guide to evaluating and selecting the perfect service provider for your business needs. Learn the key factors that matter most.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
    category: 'Guides',
    author: 'Priya Sharma',
    date: '2026-02-10',
    readTime: '8 min read'
  };

  const blogs = [
    {
      id: 2,
      title: 'Top 10 Digital Marketing Agencies in Mumbai 2026',
      excerpt: 'Discover the leading digital marketing agencies transforming businesses in Mumbai with innovative strategies.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      category: 'Agency Tips',
      author: 'Rahul Verma',
      date: '2026-02-08',
      readTime: '6 min read'
    },
    {
      id: 3,
      title: 'The Rise of AI in Business Consulting Services',
      excerpt: 'How artificial intelligence is revolutionizing the consulting industry and what it means for businesses.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      category: 'Industry Insights',
      author: 'Anita Desai',
      date: '2026-02-05',
      readTime: '7 min read'
    },
    {
      id: 4,
      title: 'Success Story: How TechCorp Found Their Perfect Staffing Partner',
      excerpt: 'A deep dive into how one company transformed their hiring process by partnering with the right agency.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop',
      category: 'Success Stories',
      author: 'Vikram Singh',
      date: '2026-02-03',
      readTime: '5 min read'
    },
    {
      id: 5,
      title: '2026 Business Service Trends You Cannot Ignore',
      excerpt: 'Stay ahead of the curve with these emerging trends shaping the business services landscape.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      category: 'Trends',
      author: 'Sneha Patel',
      date: '2026-02-01',
      readTime: '6 min read'
    },
    {
      id: 6,
      title: 'Understanding Service Level Agreements (SLAs)',
      excerpt: 'Everything you need to know about SLAs when working with service providers.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
      category: 'Guides',
      author: 'Arjun Mehta',
      date: '2026-01-28',
      readTime: '10 min read'
    },
    {
      id: 7,
      title: 'Why Reviews Matter: The Impact of Social Proof',
      excerpt: 'How authentic reviews influence decision-making and build trust in the digital age.',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
      category: 'Industry Insights',
      author: 'Neha Gupta',
      date: '2026-01-25',
      readTime: '5 min read'
    }
  ];

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Blog' }]} />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Insights & Resources
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Expert advice, industry trends, and success stories to help you make smarter business decisions
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-white/60 ml-4" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-white placeholder:text-white/60 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            {blogCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? 'all' : category)}
                className={`px-5 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  (selectedCategory === 'all' && category === 'All') || selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Article */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href={createPageUrl('BlogPost') + `?id=${featuredBlog.id}`}>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto">
                  <img src={featuredBlog.image} alt={featuredBlog.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-blue-600 font-semibold text-sm mb-3">{featuredBlog.category}</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                    {featuredBlog.title}
                  </h2>
                  <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                    {featuredBlog.excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{featuredBlog.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(featuredBlog.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{featuredBlog.readTime}</span>
                    </div>
                  </div>
                  <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-3 w-fit">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Blog Grid */}
        <div className="mt-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={createPageUrl('BlogPost') + `?id=${blog.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200 h-full">
                    <div className="relative h-48">
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1 rounded-lg text-xs font-semibold">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight hover:text-blue-600 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(blog.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No articles found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}