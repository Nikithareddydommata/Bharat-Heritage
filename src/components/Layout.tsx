import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Compass, BookOpen, Info, LogIn, LogOut, User, Loader2 } from 'lucide-react';
import { auth, signInWithGoogle, logout } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError("Popup blocked. Please allow popups for this site.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // User closed the popup, no need for a visible error
      } else {
        setAuthError("An error occurred during sign in. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/locations', label: 'Locations', icon: Compass },
    { path: '/translator', label: 'Translator', icon: BookOpen },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-heritage-cream/80 backdrop-blur-md border-b border-heritage-olive/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl font-bold tracking-tighter serif italic text-heritage-olive">Bharat Heritage</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium uppercase tracking-widest transition-colors hover:text-heritage-olive ${
                    location.pathname === item.path ? 'text-heritage-olive underline underline-offset-8' : 'text-heritage-ink/60'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {authError && (
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter max-w-[150px] text-right">
                  {authError}
                </span>
              )}
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium sans uppercase tracking-tighter opacity-60">Welcome</span>
                    <span className="text-sm font-semibold serif">{user.displayName}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-heritage-olive/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} className="text-heritage-olive" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={authLoading}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-heritage-olive text-white text-sm font-medium hover:bg-heritage-olive/90 transition-all shadow-lg shadow-heritage-olive/20 disabled:opacity-50"
                >
                  {authLoading ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
                  <span>{authLoading ? 'Signing In...' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="bg-heritage-ink text-heritage-cream py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="serif italic text-3xl mb-4 opacity-80">Preserving the past for the future.</h2>
          <div className="w-24 h-px bg-heritage-cream/20 mx-auto mb-8" />
          <p className="text-sm opacity-50 uppercase tracking-[0.2em]">© 2026 Bharat Heritage Explorer</p>
        </div>
      </footer>
    </div>
  );
}
