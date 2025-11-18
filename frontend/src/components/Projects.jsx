function Projects() {
  const projects = [
    {
      id: 1,
      title: 'Portfolio Card Website',
      description: (
        <>
          Designed and developed an <strong>interactive portfolio card website</strong> using HTML, CSS, and JavaScript.
        </>
      ),
    },
    {
      id: 2,
      title: 'Samyakriti — Contract Farming Platform',
      description: (
        <>
          A digital platform providing a <strong>secure and transparent system for contract farming</strong>, enabling direct farmer–retailer collaboration with strong terms, conditions, and integrated payment security.
        </>
      ),
    },
    {
      id: 3,
      title: 'Autokunji — Password Generator',
      description: (
        <>
          A personal utility tool to <strong>generate random, secure passwords</strong> with auto-copy and dynamic reset functionality.
        </>
      ),
    },
    {
      id: 4,
      title: 'Tic-Tac-Toe Game',
      description: (
        <>
          A simple JavaScript-based Tic-Tac-Toe game featuring two-player mode, win detection logic, draw condition handling, and restart functionality.
        </>
      ),
    },
    {
      id: 5,
      title: 'Health Coach Portfolio Website',
      description: (
        <>
          Designed and developed a <strong>modern and clean portfolio website</strong> for a health coach, showcasing their expertise, services, and client impact.
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
