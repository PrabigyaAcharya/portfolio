import { BookOpen } from 'lucide-react';

export default function Research() {
    const researchPapers = [
        {
            title: "Deep Learning for Natural Language Processing",
            publication: "International Journal of AI Research",
            year: "2023",
            link: "https://example.com/deep-learning-nlp",
            details: "This paper explores the application of deep learning techniques in natural language processing tasks, including sentiment analysis, machine translation, and text summarization."
        },
        {
            title: "Optimizing Distributed Systems with Edge Computing",
            publication: "Journal of Computer Science",
            year: "2022",
            link: "https://example.com/edge-computing",
            details: "The research focuses on leveraging edge computing to optimize distributed systems, improving latency and resource utilization in IoT networks."
        }
    ];

    return (
        <section className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Research & Publications</h2>
            {researchPapers.map((paper, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <BookOpen className="text-green-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800">{paper.title}</h3>
                            <p className="text-green-600 font-medium">{paper.publication}</p>
                            <p className="text-gray-500 text-sm mt-1">{paper.year}</p>
                            <p className="text-gray-700 mt-3">{paper.details}</p>
                            <a
                                href={paper.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline mt-2 inline-block"
                            >
                                Read More
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}