import React, { useState } from 'react';
import { GraduationCap, Briefcase, Mail, Github, Linkedin } from 'lucide-react';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('about');

  const projects = [
    {
      title: "Project Title 1",
      description: "Brief description of your project, technologies used, and what problem it solves.",
      tech: ["React", "Node.js", "MongoDB"],
      link: "#"
    },
    {
      title: "Project Title 2",
      description: "Another project showcasing your skills in web development or other technical areas.",
      tech: ["Python", "Flask", "PostgreSQL"],
      link: "#"
    },
    {
      title: "Project Title 3",
      description: "A third project demonstrating your ability to work with different technologies.",
      tech: ["JavaScript", "Express", "MySQL"],
      link: "#"
    }
  ];

  const qualifications = [
    {
      degree: "Bachelor's Degree in Computer Science",
      institution: "Your University Name",
      year: "2020 - 2024",
      details: "Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems"
    },
    {
      degree: "Higher Secondary Education",
      institution: "Your School/College Name",
      year: "2018 - 2020",
      details: "Major: Science/Computer Science"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Prabigya</h1>
            <div className="flex gap-6">
              <button
                onClick={() => setActiveSection('about')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'about' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveSection('qualifications')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'qualifications' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Qualifications
              </button>
              <button
                onClick={() => setActiveSection('projects')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'projects' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Projects
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {activeSection === 'about' && (
          <section className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                  P
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Prabigya</h2>
                  <p className="text-gray-600">Computer Science Student</p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Hello! I'm a passionate computer science student with a keen interest in web development, 
                  software engineering, and problem-solving. This portfolio showcases my academic journey 
                  and the projects I've worked on.
                </p>
                <p>
                  I enjoy learning new technologies and applying them to create meaningful solutions. 
                  My focus areas include full-stack development, database management, and building 
                  scalable applications.
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <a href="mailto:your.email@example.com" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Mail size={20} />
                  <span>Email</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Github size={20} />
                  <span>GitHub</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Linkedin size={20} />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'qualifications' && (
          <section className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Education & Qualifications</h2>
            {qualifications.map((qual, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{qual.degree}</h3>
                    <p className="text-blue-600 font-medium">{qual.institution}</p>
                    <p className="text-gray-500 text-sm mt-1">{qual.year}</p>
                    <p className="text-gray-700 mt-3">{qual.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeSection === 'projects' && (
          <section className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Projects</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Briefcase className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                      <p className="text-gray-700 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech.map((tech, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <a href={project.link} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        View Project →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Prabigya. All rights reserved.</p>
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
  );
}
