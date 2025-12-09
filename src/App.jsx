import React, { useState } from 'react';
import { GraduationCap, Briefcase, Mail, Github, Linkedin } from 'lucide-react';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('about');

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
      institution: "IOE, Pulchowk Campus, Tribhuvan University",
      year: "2019 - 2024",
      details: "GPA: 81.02/100. Ranked Top 1% among 16,000 applicants. Merit scholarships for 6/8 semesters. Core courses: Data Structures, Computer Networks, Operating Systems, Distributed Systems, Machine Learning, Computer Vision."
    },
    {
      degree: "Harvard CS50AI (Online)",
      institution: "Harvard University",
      year: "2024",
      details: "Completed Harvard's advanced AI course, gaining mastery in search, optimization, machine learning, and game theory. Strengthened algorithmic problem-solving and AI system design."
    },
    {
      degree: "4th NAAMII AI School",
      institution: "Nepal Applied Mathematics and Informatics Institute",
      year: "2024",
      details: "Intensive 10-day AI school: 55 hours of lectures, 18 hours of labs, 14 hours of projects. Learned from experts from ETH Zürich, NUS. Topics: ML, NLP, Transformers, GNNs, Responsible AI."
    },
    {
      degree: "Samsung Coding & Programming Training",
      institution: "Samsung & Pulchowk Campus",
      year: "2023",
      details: "Certified Python course with 96 participants. Achieved top performance in coding assessments. Covered advanced Python concepts, dynamic programming, and algorithm design."
    }
  ];

  const experience = [
    {
      role: "Research Assistant",
      company: "NAAMII (Nepal Applied Mathematics and Informatics Institute)",
      year: "June 2024 - Present",
      details: "Developing hierarchical 3D scene description framework for Gaussian Splatting with paper submission to CVPR 2025. Engineered LangGraph-based pipeline for automated scene description generation. Tools: Python, PyTorch, LangChain, LangGraph."
    },
    {
      role: "Research Intern",
      company: "NAAMII (Nepal Applied Mathematics and Informatics Institute)",
      year: "November 2024 - April 2025",
      details: "Developed generative approach using Stable Diffusion to synthesize warped 3D views from single 2D images. Created pipeline for frame extraction and depth/normal map generation. Curated novel dataset from RealEstate10k."
    },
    {
      role: "Software Engineer",
      company: "Growthzilla",
      year: "April 2024 - November 2024",
      details: "Designed online payment integration system using Propay API. Built automated reconciliation system reducing manual work by 60%. Worked remotely across 3 countries with React and Node.js."
    },
    {
      role: "Game Developer Intern",
      company: "Avanna Games Studio",
      year: "October 2023 - April 2024",
      details: "Created physics engine and sound simulator for mobile applications (Football and Guitar Simulator). Worked with Unity, C#, and Blender. Gained hands-on experience in game mechanics and 3D modeling."
    },
    {
      role: "Teaching Assistant",
      company: "5th Nepal AI School (NAAMII)",
      year: "2024",
      details: "Assisted 10-day international AI school with 100+ participants. Supported lectures and workshops led by researchers from Oxford and SUNY. Facilitated coordination between instructors and participants."
    },
    {
      role: "Instructor",
      company: "Software Fellowship (LOCUS, Pulchowk Campus)",
      year: "2023",
      details: "Taught Data Structures and Algorithms in Python to 50 freshers for 4 days. Coordinated with instructors to maintain classroom participation and smooth learning experience."
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
                  <p className="text-gray-600">Artificial Intelligence Researcher</p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Hello! I'm a passionate artificial intelligence researcher with a keen interest in Computer Vision, 
                  Reinforcement Learning, and problem-solving. This portfolio showcases my academic journey 
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
                <a href="https://github.com/PrabigyaAcharya" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Github size={20} />
                  <span>GitHub</span>
                </a>
                <a href="https://www.linkedin.com/in/aprab/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
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
