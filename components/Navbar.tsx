'use client';

import Container from './Container';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Menu, X, Brain } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isHomePage = pathname === '/';

  const getNavLink = (section: string) => {
    return isHomePage ? `#${section}` : `/#${section}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 w-full transition-all duration-700 ease-in-out',
        isScrolled ? 'px-4 py-4' : ''
      )}
    >
      <div
        className={cn(
          'transition-all duration-700 ease-in-out',
          isScrolled
            ? 'bg-background/20 mx-auto max-w-3xl rounded-full border border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-xl'
            : 'w-full'
        )}
      >
        <Container reverse>
          <div
            className={cn(
              'mx-auto flex items-center justify-between transition-all duration-700 ease-in-out',
              isScrolled ? 'h-11 max-w-none px-5' : 'h-14 px-4 md:max-w-screen-xl'
            )}
          >
            <div className="flex items-start">
              <Link href="/" className="flex items-center gap-2">
                <Brain
                  className={cn(
                    'transition-all duration-500 ease-in-out text-primary',
                    isScrolled ? 'h-6 w-6' : 'h-8 w-8'
                  )}
                />
                <span
                  className={cn(
                    'font-medium transition-all duration-500 ease-in-out text-foreground',
                    isScrolled ? 'text-sm' : 'text-lg'
                  )}
                >
                  Legal Lens AI
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform md:block">
              <ul
                className={cn(
                  'flex items-center justify-center transition-all duration-500 ease-in-out',
                  isScrolled ? 'gap-4' : 'gap-8'
                )}
              >
                <Link
                  href={getNavLink('features')}
                  className={cn(
                    'hover:text-foreground/80 transition-colors duration-300 text-foreground',
                    isScrolled ? 'text-sm' : 'text-sm'
                  )}
                >
                  Features
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    'hover:text-foreground/80 transition-colors duration-300 text-foreground',
                    isScrolled ? 'text-sm' : 'text-sm'
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/documents"
                  className={cn(
                    'hover:text-foreground/80 transition-colors duration-300 text-foreground',
                    isScrolled ? 'text-sm' : 'text-sm'
                  )}
                >
                  Documents
                </Link>
                <Link
                  href="/how-it-works"
                  className={cn(
                    'hover:text-foreground/80 transition-colors duration-300 text-foreground whitespace-nowrap',
                    isScrolled ? 'text-sm' : 'text-sm'
                  )}
                >
                  How It Works
                </Link>
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Desktop CTA Button / User Profile */}
              <SignedOut>
                <Link
                  href="/login"
                  className={cn(
                    'inline-flex items-center justify-center rounded-full font-medium transition-all duration-500 ease-in-out',
                    'hidden border-0 bg-primary text-primary-foreground hover:bg-primary/90 md:flex',
                    isScrolled ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                  )}
                >
                  Get Started
                </Link>
              </SignedOut>
              
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: cn(
                        "transition-all duration-500 ease-in-out ring-2 ring-border hover:ring-primary/40",
                        isScrolled ? "w-6 h-6" : "w-8 h-8"
                      )
                    }
                  }}
                />
              </SignedIn>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className={cn(
                  'inline-flex items-center justify-center rounded-full transition-all duration-300 md:hidden',
                  'border border-border bg-background/5 text-foreground backdrop-blur-lg hover:bg-background/10',
                  isScrolled ? 'h-8 w-8 p-1' : 'h-9 w-9 p-1.5'
                )}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X
                    className={cn(
                      'transition-all duration-300',
                      isScrolled ? 'h-4 w-4' : 'h-4 w-4'
                    )}
                  />
                ) : (
                  <Menu
                    className={cn(
                      'transition-all duration-300',
                      isScrolled ? 'h-4 w-4' : 'h-4 w-4'
                    )}
                  />
                )}
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-background/95 absolute top-16 right-4 left-4 rounded-2xl border border-border p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Menu</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/5 text-foreground backdrop-blur-lg transition-all duration-300 hover:bg-background/10"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col space-y-2">
              <Link
                href={getNavLink('features')}
                className="flex items-center rounded-lg px-4 py-3 text-foreground transition-colors duration-300 hover:bg-background/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center rounded-lg px-4 py-3 text-foreground transition-colors duration-300 hover:bg-background/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/documents"
                className="flex items-center rounded-lg px-4 py-3 text-foreground transition-colors duration-300 hover:bg-background/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Documents
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center rounded-lg px-4 py-3 text-foreground transition-colors duration-300 hover:bg-background/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <SignedOut>
                  <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors duration-300 hover:bg-primary/90"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-center">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
