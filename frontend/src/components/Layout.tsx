
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onLogout?: () => void;
  currentUser?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onLogout, currentUser }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full max-w-md bg-zalo-blue p-4 flex justify-between items-center text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-lg">
             <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M42 24C42 33.9411 33.9411 42 24 42C19.623 42 15.6093 40.4335 12.483 37.8293L4 40L6.17071 31.517C3.56653 28.3907 2 24.377 2 20C2 10.0589 10.0589 2 20 2C29.9411 2 38 10.0589 38 20" stroke="#0068FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 18L26 18" stroke="#0068FF" strokeWidth="4" strokeLinecap="round"/>
              <path d="M14 26L22 26" stroke="#0068FF" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="font-bold text-lg tracking-tight">Zalo YEP 2025</h1>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            {currentUser?.split('@')[0]}
          </button>
        )}
      </header>

      <main className="w-full max-w-md p-6 flex-1 flex flex-col">
        {title && <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{title}</h2>}
        {children}
      </main>

      <footer className="w-full max-w-md p-4 text-center text-gray-400 text-xs">
        &copy; 2025 Zalo Corporation. Year End Party Edition.
      </footer>
    </div>
  );
};

export default Layout;
