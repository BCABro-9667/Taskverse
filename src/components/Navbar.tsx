
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, UserCircle, Building, Users, LogOut } from 'lucide-react'; 
import { useRouter } from 'next/navigation';


export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const companyName = user?.companyName || 'TaskMaster';
  const companyLogoUrl = user?.companyLogoUrl;

  const handleLogout = () => {
    logout();
    // AuthContext's logout should handle redirection, or you can do it here
    // router.push('/login'); // This might be redundant if AuthContext handles it
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm no-print">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-2">
          {companyLogoUrl ? (
            <Image 
              src={companyLogoUrl} 
              alt={`${companyName} Logo`}
              width={32} 
              height={32} 
              className="rounded"
              data-ai-hint="company logo"
            />
          ) : (
            <Building className="h-7 w-7 text-primary" />
          )}
          <span className="text-xl font-bold text-primary">{companyName}</span>
        </Link>

        <div className="flex items-center gap-4">
          { user && (
            <nav className="hidden md:flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/assignees">
                  <Users className="mr-2 h-4 w-4" /> Assignees
                </Link>
              </Button>
            </nav>
          )}
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.name || 'User Avatar'} data-ai-hint="profile avatar" />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/assignees">
                      <Users className="mr-2 h-4 w-4" />
                      Assignees
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <nav className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </nav>
          )}
        </div>
      </div>
    </header>
  );
}

