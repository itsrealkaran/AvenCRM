"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

function AuthGaurd(
    {
        children
    }: Readonly<{   
        children: React.ReactNode
    }>
) {

    const router = useRouter();
    const accessToken = localStorage.getItem('accessToken')
    const pathname = usePathname();

    const { toast } = useToast();

    if (!accessToken) { 
        toast({
            title: 'Unauthorized',
            description: 'You are not logged in',
            variant: 'destructive'
        })
        router.push('/sign-in');   
    }

    const role = pathname.split('/')[1];

    const authresponse = 


  return (
    <div>
      {children}
    </div>
  )
}

export default AuthGaurd
