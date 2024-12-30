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
import { useAuth } from '@/hooks/useAuth';
import { SignOutButton } from '@/components/SignOutButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Topbar() {
  const router = useRouter();
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className='h-16 border-b bg-white/70 z-40'>
      <div className='flex h-full items-center px-6 gap-4'>
        <div className='flex flex-1 items-center gap-4 md:gap-6'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input type='search' placeholder='Search dashboard...' className='pl-8 bg-background' />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-9 px-2 gap-2 rounded-full'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src={user?.image} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col items-start'>
                <span className='text-sm font-medium'>{user?.name}</span>
                <span className='text-xs text-muted-foreground capitalize'>{user?.role?.toLowerCase()}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className='mr-2 h-4 w-4' />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className='mr-2 h-4 w-4' />
              Settings
            </DropdownMenuItem>
            <SignOutButton variant="ghost" className="w-full justify-start" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
