import { GraduationCap} from 'lucide-react';

export default function Qualificatoins(){
    const qualifications = [
        {
          degree: "Bachelor's in Computer Engineering",
          institution: "IOE, Pulchowk Campus, Tribhuvan University (81.02/100",
          year: "2019 - 2024",
          details: "I completed my Bachelor's in Computer Engineering with Distinction , covering a rigorous curriculum that included data structures and algorithms , database management systems and big data technologies , and software engineering methodologies with object-oriented analysis. My technical foundation spans computer architecture and organization , operating systems and embedded systems , distributed systems , and computer networks with internet/intranet technologies. The coursework also integrated advanced mathematics (calculus, statistics, numerical methods) , artificial intelligence and human language technologies , computer graphics , and project management, providing a comprehensive theoretical and practical engineering skillset."
        }
      ];

    return (
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
