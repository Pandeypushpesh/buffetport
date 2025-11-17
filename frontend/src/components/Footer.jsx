function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 border-t border-gray-200">
      <div className="max-w-content mx-auto text-center">
        <p className="font-sans text-sm text-text-muted">
          © {currentYear} Your Name. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

