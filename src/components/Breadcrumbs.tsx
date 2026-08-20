import { Link, useLocation } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/profile': 'Profile',
  '/terms': 'Terms & Conditions',
  '/privacy': 'Privacy Policy',
  '/cookies': 'Cookie Policy',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 pt-4 pb-0">
      <ol className="flex items-center gap-1.5 text-xs font-mono text-primary/50 dark:text-[#f4d5ad]/50">
        <li>
          <Link to="/" className="hover:text-accent dark:hover:text-[#c98a6e] transition-colors" aria-label="Home">
            Home
          </Link>
        </li>
        {pathnames.map((segment, i) => {
          const path = '/' + pathnames.slice(0, i + 1).join('/');
          const label = routeLabels[path] || segment;
          const isLast = i === pathnames.length - 1;

          return (
            <li key={path} className="flex items-center gap-1.5">
              <span className="text-primary/30 dark:text-[#f4d5ad]/30" aria-hidden="true">/</span>
              {isLast ? (
                <span className="text-primary/80 dark:text-[#f4d5ad]/80" aria-current="page">{label}</span>
              ) : (
                <Link to={path} className="hover:text-accent dark:hover:text-[#c98a6e] transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
