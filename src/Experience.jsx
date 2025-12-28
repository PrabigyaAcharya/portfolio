import { Briefcase} from 'lucide-react';

export default function Experience() {
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
      )
}