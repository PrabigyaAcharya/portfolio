import React, { useState } from 'react';
import About from './About';
import NavBar from './NavBar';
import Experience from './Experience';
import Qualifications from './Qualifications';
import BlogList from './BlogList';
import BlogPost from './BlogPost';
import Projects from './Projects';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

export default function Portfolio() {

  return (
    <Router>
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
    
      <main className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
        <Routes>
              <Route path="/" element={<Navigate to="/about" replace />} />
              
              <Route path="/about" element={<About />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/qualifications" element={<Qualifications />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:id" element={<BlogPost />} />
            </Routes>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Prabigya Acharya. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
    </Router>
  );
}