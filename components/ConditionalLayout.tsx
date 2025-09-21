'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith('/chat/');

  if (isChatPage) {
    // For chat pages, render only the children without navbar and footer
    return <>{children}</>;
  }

  // For all other pages, render with navbar and footer
  return (
    <>
      <Navbar />
      <main className="flex-1 relative z-10 pt-16">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-muted/30 relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">L</span>
                </div>
                <span className="text-xl font-bold text-foreground">Legal Lens AI</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Transform your legal document analysis with cutting-edge AI technology. 
                Get instant insights, risk assessments, and actionable recommendations.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a></li>
                <li><a href="/documents" className="hover:text-foreground transition-colors">Documents</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#help" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Legal Lens AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">Made with ❤️ for Hack2Skill Hackathon</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">AI Technology</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
