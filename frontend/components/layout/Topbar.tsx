'use client';

import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';
import { LogOut, Search, Settings, User } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export default function Topbar() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authApi.logout();
      router.push('/sign-in');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className='h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-full items-center px-6 gap-4'>
        <div className='flex flex-1 items-center gap-4 md:gap-6'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input type='search' placeholder='Search dashboard...' className='pl-8 bg-background' />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-9 w-9 rounded-full border'>
              <User className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-40'>
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className='mr-2 h-4 w-4' />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className='mr-2 h-4 w-4' />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className='mr-2 h-4 w-4' />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
