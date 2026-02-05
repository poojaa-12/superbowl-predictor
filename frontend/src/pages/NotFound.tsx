import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center glass p-12 rounded-2xl">
        <h1 className="text-6xl font-bold text-gold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Link 
          to="/" 
          className="px-6 py-3 rounded-full gradient-gold text-background font-medium hover:opacity-90 transition-opacity"
        >
          Back to Predictor
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
