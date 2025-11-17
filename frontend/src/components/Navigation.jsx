function Navigation() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="pt-8 pb-4 px-4">
      <div className="max-w-content mx-auto">
        <div className="flex justify-center items-center space-x-8 font-sans text-base">
          <button
            onClick={() => scrollToSection('about')}
            className="text-text-primary hover:text-accent transition-colors duration-200"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('work')}
            className="text-text-primary hover:text-accent transition-colors duration-200"
          >
            Work
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="text-text-primary hover:text-accent transition-colors duration-200"
          >
            Contact
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

