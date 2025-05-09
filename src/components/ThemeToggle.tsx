
'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | undefined>(undefined);

  useEffect(() => {
    // Get initial theme from localStorage or system preference
    // This runs only on the client after mount to avoid hydration issues.
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    // Apply theme changes to the document and localStorage
    // This also runs only on the client.
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (theme === undefined) {
    // Render a placeholder or null until the theme is determined on the client
    // to prevent hydration mismatch with server-rendered HTML.
    return <Button variant="outline" size="icon" disabled aria-label="Toggle theme" className="h-[1.2rem] w-[1.2rem] p-0">
             <Sun className="h-[0.8rem] w-[0.8rem]" />
           </Button>; 
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="h-[1.2rem] w-[1.2rem] p-0">
      {theme === 'light' ? (
        <Sun className="h-[0.8rem] w-[0.8rem]" />
      ) : (
        <Moon className="h-[0.8rem] w-[0.8rem]" />
      )}
    </Button>
  );
}
