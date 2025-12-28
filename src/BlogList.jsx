import React from 'react';
import { Link } from 'react-router-dom';
import allBlogs from '../blogs'


export default function BlogList() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Latest Writings</h2>
        <p className="text-gray-600 mt-2">Organized Thoughts.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allBlogs.map((post) => (
          <Link 
            to={`/blog/${post.id}`} 
            key={post.id}
            className="group bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                {post.category}
              </span>
              <span className="text-gray-400 text-xs">{post.date}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
              {post.excerpt}
            </p>
            
            <div className="flex items-center text-blue-600 text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform">
              Read article 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}