import type { ReactNode } from 'react';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t no-print">
        {currentYear !== null ? `© ${currentYear} TaskMaster. All rights reserved.` : '© TaskMaster. All rights reserved.'}
      </footer>
    </div>
  );
}
