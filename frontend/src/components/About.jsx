function About() {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-content mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-8">
          About
        </h2>

        {/* Professional Introduction */}
        <p className="font-sans text-base text-text-primary leading-relaxed mb-4">
          I'm an <strong>enthusiastic and detail-oriented B.Tech Computer Science Engineering student</strong> with strong foundations in Core CS subjects, Data Structures, and Algorithms. I'm passionate about <strong>backend development, scalable systems</strong>, and problem-solving, with hands-on experience in the <strong>MERN stack</strong> and full-stack project development.
        </p>

        {/* Additional Context (Skills & Certifications, no college info) */}
        <p className="font-sans text-base text-text-primary leading-relaxed">
          I hold certifications in <strong>Cloud Computing (IBM & NPTEL Elite)</strong> and actively engage in student leadership, communication building, and public speaking initiatives, while consistently improving my technical and analytical capabilities.
        </p>
      </div>
    </section>
  );
}

export default About;
