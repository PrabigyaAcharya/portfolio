import { Briefcase} from 'lucide-react';

export default function Projects() {
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

    return (
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
      )
}