import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-primary font-mono p-6">
      <h1 className="text-9xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-8">Page not found. System failure.</p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-accent text-bg rounded hover:bg-darker transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
