import type { ReactNode } from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image 
            src="https://picsum.photos/seed/taskmasterlogo/150/50" // Placeholder logo
            alt="TaskMaster Logo" 
            width={150} 
            height={50}
            className="mx-auto mb-4 rounded"
            data-ai-hint="app logo"
          />
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-lg sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}