import React, { useState, useEffect } from 'react';
import { GraduationCap, Briefcase, Mail, Github, Linkedin, BookOpen, ArrowLeft, Calendar } from 'lucide-react';
import allBlogs from '../blogs';
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'; 
import rehypeKatex from 'rehype-katex'; 
import 'katex/dist/katex.min.css';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('about');
  const [selectedBlog, setSelectedBlog] = useState(null);

  const openBlog = (blog) => {
    setSelectedBlog(blog);
  };

  const closeBlog = () => {
    setSelectedBlog(null);
  };

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

  


  const projects = [
    {
      title: "3D Exhibition Environment using 3D Gaussian Splatting",
      description: "Built a full pipeline for 3D reconstruction and interactive visualization of Nepalese heritage sites using NeRF and Gaussian Splatting. Digitized 3 temples in Patan with occlusion masking and integrated into Three.js exhibition platform.",
      tech: ["Python", "PyTorch", "Three.js", "Gaussian Splatting", "Blender"],
      link: "https://github.com/Pramish-Aryal/3Drishya-2.0"
    },
    {
      title: "Discrypt – Privacy-Preserving Human Language Model",
      description: "Developed an NLP model using T5-small and Mistral-7B fine-tuned with QLoRA for PII detection and masking in chat conversations. Built a REST API with Flask and integrated into a Discord bot for real-time privacy protection.",
      tech: ["Python", "Hugging Face", "Flask", "AWS SageMaker", "T5", "Mistral-7B"],
      link: "https://github.com/liza1212/Discrypt"
    },
    {
      title: "Yoggis – AI Yoga Trainer",
      description: "Designed a pose classification system using PoseNet and custom classifier for real-time posture correction. Achieved 94% classification accuracy with custom dataset of yoga poses.",
      tech: ["Python", "TensorFlow", "PoseNet", "OpenCV"],
      link: "https://github.com/Nadika18/MinorProject"
    },
    {
      title: "3D Reconstruction of Pimbahal",
      description: "Digitally reconstructed Pimbahal temple in Blender and hosted the model for public access using Three.js. Developed expertise in 3D visualization pipelines and asset optimization.",
      tech: ["Blender", "Three.js", "JavaScript"],
      link: "https://github.com/MoAgr/3D-Model-of-Pimbahal"
    },
    {
      title: "Avritti – AI Music Generator",
      description: "Implemented genetic algorithms to generate unique and evolving music sequences. Built backend with FastAPI and designed web interface in Vue.js for real-time playback and user-driven music improvement.",
      tech: ["Python", "FastAPI", "Vue.js", "MIDIFile", "Genetic Algorithms"],
      link: "https://github.com/PrabigyaAcharya/Avritti"
    }
  ];

  const qualifications = [
    {
      degree: "Bachelor's in Computer Engineering",
      institution: "IOE, Pulchowk Campus, Tribhuvan University (81.02/100",
      year: "2019 - 2024",
      details: "I completed my Bachelor's in Computer Engineering with Distinction , covering a rigorous curriculum that included data structures and algorithms , database management systems and big data technologies , and software engineering methodologies with object-oriented analysis. My technical foundation spans computer architecture and organization , operating systems and embedded systems , distributed systems , and computer networks with internet/intranet technologies. The coursework also integrated advanced mathematics (calculus, statistics, numerical methods) , artificial intelligence and human language technologies , computer graphics , and project management, providing a comprehensive theoretical and practical engineering skillset."
    }
  ];

  const experience = [
    {
      role: "Research Assistant",
      company: "NAAMII (Nepal Applied Mathematics and Informatics Institute)",
      year: "June 2025 - Present",
    },
    {
      role: "Research Intern",
      company: "NAAMII (Nepal Applied Mathematics and Informatics Institute)",
      year: "November 2024 - April 2025",
    },
    {
      role: "Software Engineer",
      company: "Growthzilla",
      year: "April 2024 - November 2024",
    }
  ];
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Prabigya Acharya</h1>
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
                onClick={() => setActiveSection('experience')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'experience' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Experience
              </button>
              <button
                onClick={() => setActiveSection('qualifications')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'qualifications' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Education
              </button>
              <button
                onClick={() => setActiveSection('projects')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'projects' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveSection('blog')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'blog' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Blog
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
        {activeSection === 'about' && (
          <section className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                  PA
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Prabigya Acharya</h2>
                  <p className="text-gray-600">AI Researcher | Computer Vision & Machine Learning</p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Hello! I'm a passionate Artificial Intelligence researcher with a keen interest in Computer Vision, 
                  Natural Language Processing and problem-solving. This portfolio showcases my academic journey 
                  and the projects I've worked on.
                </p>
                <p>
                  I enjoy learning new technologies and applying them to create meaningful solutions. 
                  I am currently looking for research opportunities in use of NLP and CV applications in education domain.
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <a href="mailto:acharyaprabigya@gmail.com" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Mail size={20} />
                  <span>Email</span>
                </a>
                <a href="https://github.com/PrabigyaAcharya" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Github size={20} />
                  <span>GitHub</span>
                </a>
                <a href="https://www.linkedin.com/in/aprab/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Linkedin size={20} />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'experience' && (
          <section className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Work Experience</h2>
            {experience.map((exp, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{exp.role}</h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    <p className="text-gray-500 text-sm mt-1">{exp.year}</p>
                    <p className="text-gray-700 mt-3">{exp.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeSection === 'qualifications' && (
          <section className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Education & Certifications</h2>
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
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        View Project →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

{activeSection === 'blog' && !selectedBlog && (
          <section className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Blog</h2>
            {allBlogs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No blog posts yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {allBlogs.map((blog) => (
                  <div 
                    key={blog.id} 
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openBlog(blog)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <BookOpen className="text-blue-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{blog.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Calendar size={16} />
                          <span>{blog.date}</span>
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-3">{blog.excerpt}</p>
                        <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === 'blog' && selectedBlog && (
          <section className="animate-fadeIn">
            <button 
              onClick={closeBlog}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Blog List
            </button>
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
        )}
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
  );
}