function Projects() {
  const projects = [
    {
      id: 1,
      title: '🌐 Portfolio Card Website',
      description: (
        <>
          Designed & developed this <strong>interactive portfolio card website</strong> using HTML, CSS, and JavaScript.
        </>
      ),
    },
    {
      id: 2,
      title: '🌱 Samyakriti (Contract Farming Platform)',
      description: (
        <>
          The Samyakriti platform is an <strong>innovative digital solution</strong> aimed at creating a <strong>secure and transparent environment for contract farming</strong>, connecting farmers directly with retailers. It addresses issues of exploitation by enforcing strict terms and conditions for both parties and integrating a reliable payment gateway, promoting fair trade and streamlined agricultural supply chain efficiency.
        </>
      ),
    },
    {
      id: 3,
      title: '💻 Autokunji (Password Generator)',
      description: (
        <>
          Personal tool to <strong>Generate Random different kinds and length of passwords</strong>. Features include an auto clipboard copy function and dynamically resetting capabilities.
        </>
      ),
    },
    {
      id: 4,
      title: '❌🅾️ Tic-Tac-Toe Game',
      description: (
        <>
          Created a basic Tic-Tac-Toe game using <strong>JavaScript</strong> to learn and practice fundamental programming concepts. The game includes a simple 3x3 grid, two-player functionality, and logic to check for winners, draw conditions, and game restart.
        </>
      ),
    },
    {
      id: 5,
      title: '🌿 Abhishek Fit Journey (Health Coach Portfolio)',
      description: (
        <>
          Designed and developed a <strong>modern portfolio website for a friend</strong> in the Health Coaching industry. The site highlights their expertise, services, and client testimonials, providing an engaging platform for potential clients to connect and learn more about holistic wellness.
        </>
      ),
    },
  ];

  return (
    <section id="work" className="py-24 px-4 bg-gray-50">
      <div className="max-w-content mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-12">
          Projects
        </h2>
        
        {/* Using a responsive grid: 1 column on small, 2 on medium, 3 on large */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-left h-full flex flex-col"
            >
              <h3 className="font-serif text-2xl text-text-primary mb-3">
                {project.title}
              </h3>
              <p className="font-sans text-base text-gray-600 leading-relaxed flex-grow">
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