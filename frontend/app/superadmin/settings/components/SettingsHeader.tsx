'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export default function SettingsHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Clear cookies
      document.cookie = 'Authorization=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'RefreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

      // Redirect to sign-in page
      router.push('/sign-in');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <div className='flex justify-end mb-6'>
      <Button variant='outline' onClick={handleSignOut} className='gap-2'>
        <LogOut className='w-4 h-4' />
        Sign Out
      </Button>
    </div>
  );
}
