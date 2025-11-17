function Projects() {
  // Using the data from your PROJECTS section
  const projects = [
    {
      id: 1,
      title: '🌱 Samyakriti – Secure Digital Platform for Farmers & Retailers',
      description: (
        <>
          Built a transparent platform enabling contract farming with secure payment gateways. Developed modules for farmer
          registration, contract management, and payments. Solved farmer exploitation issues by ensuring fair trade and
          scam-free transactions. Contributed to enhancing efficiency in the agricultural supply chain.
        </>
      ),
    },
    {
      id: 2,
      title: '🎮 Gamez Adda',
      description: 'Developed an interactive game using React.js and JavaScript, designed for fun and hands-on learning of UI/UX and frontend logic.',
    },
    // Note: I did not include "infosys Website Development" as it lacks a detailed description
  ];

  return (
    <section id="work" className="py-24 px-4 bg-gray-50"> {/* Added a light background for card contrast */}
      <div className="max-w-content mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-12">
          Projects
        </h2>
        
        {/* Changed from space-y-12 to a grid layout for cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project) => (
            // Card Structure: Added padding, background, border, and shadow
            <div 
              key={project.id} 
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-left"
            >
              <h3 className="font-serif text-2xl text-text-primary mb-3">
                {project.title}
              </h3>
              <p className="font-sans text-base text-gray-600 leading-relaxed">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;