import { useState } from 'react';

function Hero() {
  const [name] = useState('Pushpesh Kumar');
  // Updated Tagline from your summary data
  const [tagline] = useState('COMPUTER SCIENCE AND ENGINEERING STUDENT | BACHELOR OF TECHNOLOGY (2027)');

  const handleDownloadResume = () => {
    // Logic to initiate a direct file download
    // IMPORTANT: Ensure your resume file (e.g., 'Pushpesh_Resume.pdf') is in your public directory
    const resumeUrl = '/assets/Pushpesh_Resume.pdf'; 
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = 'Pushpesh_Kumar_Resume.pdf'; // Suggested download filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Download resume initiated');
  };

  return (
    <section className="pt-32 pb-24 px-4 text-center">
      <div className="max-w-content mx-auto">
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-text-primary mb-4">
          {name}
        </h1>
        <p className="font-sans text-xl text-text-secondary font-light mb-8">
          {tagline}
        </p>
        <button
          onClick={handleDownloadResume}
          className="bg-accent text-white px-8 py-4 rounded-sm hover:bg-accent-hover transition-colors duration-200 font-sans text-base"
        >
          Download Resume
        </button>
      </div>
    </section>
  );
}

export default Hero;