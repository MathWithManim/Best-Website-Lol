const Footer = () => {
  return (
    <footer className="p-10 border-t border-primary/20 text-center font-typewriter text-primary">
      <div className="flex justify-center gap-6 mb-4">
        <a href="#" className="hover:underline">Terms and Conditions</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
      </div>
      <p>&copy; {new Date().getFullYear()} Jasper Sona. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
