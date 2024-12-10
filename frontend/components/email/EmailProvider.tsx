'use client';

import { SiGmail } from 'react-icons/si';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function EmailProvider() {
  const handleGmailConnect = async () => {
    try {
      // Redirect to Google OAuth consent screen
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/gmail`;
    } catch (error) {
      toast.info('Failed to connect Gmail account');
    }
  };

  const handleOutlookConnect = async () => {
    try {
      // Redirect to Outlook OAuth consent screen
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/outlook`;
    } catch (error) {
      toast.error('Failed to connect Outlook account');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Email Provider</CardTitle>
        <CardDescription>Connect your email account to start sending emails</CardDescription>
      </CardHeader>
      <CardContent className='flex gap-4'>
        <Button variant='outline' className='flex items-center gap-2' onClick={handleGmailConnect}>
          <SiGmail />
          Connect Gmail
        </Button>
        <Button
          variant='outline'
          className='flex items-center gap-2'
          onClick={handleOutlookConnect}
        >
          <img src='/outlook-icon.svg' alt='Outlook' className='w-5 h-5' />
          Connect Outlook
        </Button>
      </CardContent>
    </Card>
  );
}
