import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar } from 'lucide-react';

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'; 
import rehypeKatex from 'rehype-katex'; 
import 'katex/dist/katex.min.css';

import allBlogs from '../blogs'

export default function BlogPost(){

  const MarkdownComponents = {
    // Headers
    h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-800 mb-6" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props} />,
    h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-gray-800 mt-5 mb-2" {...props} />,
    
    // Text formatting
    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
    em: ({node, ...props}) => <em className="italic text-gray-600" {...props} />,
    p: ({node, ...props}) => <p className="text-gray-700 mb-4 leading-relaxed" {...props} />,
    
    // Lists
    ul: ({node, ...props}) => <ul className="list-disc ml-6 my-4" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal ml-6 my-4" {...props} />,
    li: ({node, ...props}) => <li className="mb-2 pl-1" {...props} />,
    
    // Code blocks
    code: ({node, inline, className, children, ...props}) => {
      return inline ? (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-pink-600" {...props}>
          {children}
        </code>
      ) : (
        <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto my-4 border border-gray-200">
          <code className="text-sm font-mono text-gray-800" {...props}>{children}</code>
        </pre>
      );
    },

    // Images & Links
    img: ({node, ...props}) => {
      let styleWidth = undefined;
      
      try {
        const url = new URL(props.src, 'https://dummy.com'); 
        const w = url.searchParams.get('w');
        if (w) styleWidth = w;
      } catch (e) {
        console.error("Error parsing image URL params", e);
      }

    return (
        <img 
          className="max-w-full h-auto rounded-lg shadow-md my-6 object-cover mx-auto" 
          style={{ width: styleWidth }} 
          {...props} 
          alt={props.alt || ''} 
        />
      );
    },
    a: ({node, ...props}) => (
      <a 
        className="text-blue-600 hover:text-blue-700 underline transition-colors" 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props} 
      />
    ),
    
    // Blockquotes (Bonus addition)
    blockquote: ({node, ...props}) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" {...props} />
    ),
  };
  const { id } = useParams(); 

  const selectedBlog = allBlogs.find((blog) => blog.id.toString() === id);

  if (!selectedBlog) {
    return <Navigate to="/blog" replace />;
  }

    return (
        <section className="animate-fadeIn max-w-4xl mx-auto">
      <Link 
        to="/blog"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium w-fit"
      >
        <ArrowLeft size={20} />
        Back to Blog List
      </Link>

      <article className="bg-white rounded-lg shadow-md p-8">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedBlog.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{selectedBlog.date}</span>
          </div>
        </header>
        
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown 
            components={MarkdownComponents}
            remarkPlugins={[remarkGfm, remarkMath]} 
            rehypePlugins={[rehypeKatex]}          
          >
            {selectedBlog.content}
          </ReactMarkdown>
        </div>
        
      </article>
    </section>
  );
}