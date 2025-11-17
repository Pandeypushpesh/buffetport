function About() {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-content mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-8">
          About
        </h2>
        {/* First Paragraph: Concise Professional Introduction (SUMMARY) */}
        <p className="font-sans text-base text-text-primary leading-relaxed mb-4">
          I'm an <strong>enthusiastic and detail-oriented B.Tech (Computer Science & Engineering, 3rd Year) student</strong> with strong foundations in Core CS subjects, Data Structures, and Algorithms. I'm passionate about <strong>backend development, scalable systems</strong>, and problem-solving, with hands-on experience in the <strong>MERN stack</strong> and full-stack project development.
        </p>
        
        {/* Second Paragraph: Additional Context (Education & Certifications) */}
        <p className="font-sans text-base text-text-primary leading-relaxed">
          Currently pursuing my Bachelor of Technology from <strong>Gurukula Kangri (Deemed to be University)</strong> (expected May 2027) with a CGPA of 8.60/10. I am certified in <strong>Cloud Computing (IBM & NPTEL Elite)</strong> and actively participate in student leadership and public speaking initiatives.
        </p>
      </div>
    </section>
  );
}

export default About;