import { GraduationCap, Briefcase, Mail, Github, Linkedin, BookOpen, ArrowLeft, Calendar } from 'lucide-react';

export default function About() {
    return (
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