import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/about', label: 'About' },
    { path: '/experience', label: 'Experience' },
    { path: '/qualifications', label: 'Qualifications' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Blog' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
        <Link 
            to="/" 
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Prabigya Acharya
          </Link>

          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`
              }
            >
              {item.label}
            </NavLink>
            ))}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-2">
            {navItems.map((item) => (
              <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)} 
              className={({ isActive }) =>
                `block w-full text-left px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`
              }
            >
              {item.label}
            </NavLink>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}