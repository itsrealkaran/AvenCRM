import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';

import 'react-datetime/css/react-datetime.css';
import './globals.css';

import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const foundersGrotesk = localFont({
  src: [
    { path: './fonts/TestFoundersGrotesk-Bold.otf', weight: '700' },
    { path: './fonts/TestFoundersGrotesk-Light.otf', weight: '300' },
    { path: './fonts/TestFoundersGrotesk-Medium.otf', weight: '500' },
    { path: './fonts/TestFoundersGrotesk-Regular.otf', weight: '400' },
    { path: './fonts/TestFoundersGrotesk-Semibold.otf', weight: '600' },
  ],
  variable: '--font-founders-grotesk',
});

const foundersGroteskMono = localFont({
  src: [
    { path: './fonts/TestFoundersGroteskMono-Bold.otf', weight: '700' },
    { path: './fonts/TestFoundersGroteskMono-Light.otf', weight: '300' },
    { path: './fonts/TestFoundersGroteskMono-Medium.otf', weight: '500' },
    { path: './fonts/TestFoundersGroteskMono-Regular.otf', weight: '400' },
    { path: './fonts/TestFoundersGroteskMono-Semibold.otf', weight: '600' },
  ],
  variable: '--font-founders-grotesk-mono',
});

export const metadata: Metadata = {
  title: 'AvenCRM',
  description: 'Manage your real estate business with ease and efficiency.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${foundersGrotesk.variable} ${foundersGroteskMono.variable} antialiased bg-background`}
      >
        <Script
          strategy='lazyOnload'
          id='facebook-jssdk'
          src='https://connect.facebook.net/en_US/sdk.js'
        />
        <Script id='facebook-init'>
          {`
            window.fbAsyncInit = function() {
              FB.init({
                appId: '2340954516269174',
                xfbml: true,
                version: 'v22.0',
                config_id: '608691068704818'
              });
            };
          `}
        </Script>
        {children}
        <Sonner />
        <Toaster />
      </body>
    </html>
  );
}
