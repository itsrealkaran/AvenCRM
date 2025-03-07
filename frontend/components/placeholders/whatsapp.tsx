import { Crown, Lock } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '../ui/button';
import { Card } from '../ui/card';

const WhatsAppPlaceholder = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleNotifyAdmin = () => {
    toast({
      title: 'Notification sent to admin',
      description: 'We notified the admin about your request to upgrade to the Enterprise plan.',
    });
  };

  return (
    <Card className='relative h-full overflow-hidden'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#25D366]/5 to-transparent' />

      {/* Content */}
      <div className='relative p-8 h-full flex flex-col'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-8'>
          <div className='p-2 bg-[#25D366]/10 rounded-lg'>
            <FaWhatsapp className='w-6 h-6 text-[#25D366]' />
          </div>
          <div>
            <h1 className='text-xl font-semibold'>WhatsApp Campaigns</h1>
            <p className='text-sm text-muted-foreground'>Enterprise Feature</p>
          </div>
          <Lock className='w-4 h-4 text-muted-foreground ml-auto' />
        </div>

        {/* Main Content */}
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center max-w-md mx-auto space-y-6'>
            <div className='p-3 bg-[#25D366]/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center'>
              <Crown className='w-8 h-8 text-[#25D366]' />
            </div>

            <div className='space-y-2'>
              <h2 className='text-2xl font-semibold'>Unlock WhatsApp Integration</h2>
              <p className='text-muted-foreground'>
                Connect with your customers through WhatsApp Business API. Available exclusively for
                Enterprise users.
              </p>
            </div>

            {user?.role === 'ADMIN' ? (
              <Button
                className='bg-[#25D366] hover:bg-[#25D366]/90 text-white w-full'
                onClick={() => (window.location.href = '/admin/subscription')}
              >
                <Crown className='w-4 h-4 mr-2' />
                Upgrade to Enterprise
              </Button>
            ) : (
              <Button
                className='bg-[#25D366] hover:bg-[#25D366]/90 text-white w-full'
                onClick={handleNotifyAdmin}
              >
                Notify Admin
              </Button>
            )}

            <p className='text-xs text-muted-foreground'>
              Get access to WhatsApp campaigns and more enterprise features
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 pt-6 border-t border-border'>
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Lock className='w-4 h-4' />
              <span>Enterprise Feature</span>
            </div>
            <span>Contact support for more info</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WhatsAppPlaceholder;
