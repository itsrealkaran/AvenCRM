/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { SiGmail } from 'react-icons/si';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function EmailProvider() {
  const handleGmailConnect = async () => {
    try {
      let redirectUrl = 'https://accounts.google.com/o/oauth2/v2/auth?';
      redirectUrl += `scope=https://mail.google.com/`;
      redirectUrl += `&response_type=code`;
      redirectUrl += `&access_type=offline`;
      redirectUrl += `&client_id=${process.env.GOOGLE_CLIENT_ID}`;
      redirectUrl += `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}`;
      window.location.href = redirectUrl;
    } catch (error) {
      toast.info('Failed to connect Gmail account');
      console.log(error);
    }
  };

  const handleOutlookConnect = async () => {
    try {
      let redirectUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
      redirectUrl += `scope=https://outlook.office.com/mail.readwrite`;
      redirectUrl += `&response_type=code`;
      redirectUrl += `&access_type=offline`;
      redirectUrl += `&client_id=${process.env.OUTLOOK_CLIENT_ID}`;
      redirectUrl += `&redirect_uri=${process.env.OUTLOOK_REDIRECT_URI}`;
      window.location.href = redirectUrl;
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
