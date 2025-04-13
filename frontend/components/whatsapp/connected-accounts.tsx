'use client';

import { useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { WhatsAppPhoneNumberData } from '@/types/whatsapp.types';
import { LogOut } from 'lucide-react';
import { FaCheck, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WhatsAppConnectModal } from '@/components/whatsapp/whatsapp-connect-modal';

import { RegisterNumberModal } from './register-number';
import { VerifyNumberModal } from './verify-number-modal';

export function ConnectedAccounts({
  accounts,
  accessToken,
  wabaId,
}: {
  accounts: WhatsAppPhoneNumberData[];
  accessToken: string;
  wabaId: string;
}) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<WhatsAppPhoneNumberData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [registeringAccount, setRegisteringAccount] = useState<{
    phoneNumberId: string;
    id: string;
  } | null>(null);
  const [isRegisteringModalOpen, setIsRegisteringModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyModalAccount, setVerifyModalAccount] = useState<{
    phoneNumberId: string;
    phoneNumber: string;
  } | null>(null);

  const handleUpdateAccount = async () => {
    if (!editingAccount) return;

    try {
      await whatsAppService.updateAccount(editingAccount.phoneNumberId, { displayName });
      toast.success('Account updated successfully');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
    }
  };

  const requestOTP = async (phoneNumberId: string) => {
    try {
      // @ts-ignore
      FB.api(
        `/${phoneNumberId}/request_code?access_token=${accessToken}`,
        'POST',
        {
          code_method: 'SMS',
          language: 'en',
        },
        (response: any) => {
          if (response.error) {
            console.error('Error verifying account:', response.error);
            toast.error(response.error.error_user_msg);
          }
        }
      );
    } catch (error) {
      console.error('Error verifying account:', error);
      toast.error('Failed to verify account');
    }
  };

  return (
    <Card className='min-h-[300px] max-h-[480px] overflow-y-auto'>
      <CardHeader className='flex flex-row justify-between items-center'>
        <CardTitle className='text-xl font-semibold'>Connected WhatsApp Accounts</CardTitle>
        <Button
          onClick={() => setShowConnectModal(true)}
          className='bg-[#25D366] hover:bg-[#25D366]/90 text-white'
        >
          <FaWhatsapp className='w-4 h-4 mr-2' />
          Connect New Account
        </Button>
      </CardHeader>

      {accounts.length === 0 ? (
        <Card className='border border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-8'>
            <FaWhatsapp className='w-12 h-12 text-[#25D366] mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No WhatsApp Accounts Connected</h3>
            <p className='text-muted-foreground text-center mb-4'>
              Connect your WhatsApp Business account to start creating campaigns
            </p>
            <Button
              onClick={() => setShowConnectModal(true)}
              className='bg-[#25D366] hover:bg-[#25D366]/90 text-white'
            >
              <FaWhatsapp className='w-4 h-4 mr-2' />
              Connect Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-4 mb-4'>
          {accounts.map((account) => (
            <Card key={account.phoneNumberId}>
              <CardHeader className='pb-2'>
                <CardTitle className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    <FaWhatsapp className='w-5 h-5 text-[#25D366] mr-2' />
                    <span>{account.name}</span>
                  </div>
                  {account.codeVerificationStatus === 'VERIFIED' && (
                    <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center'>
                      <FaCheck className='w-3 h-3 mr-1' /> Verified
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <p className='text-sm text-muted-foreground'>Phone: {account.phoneNumber}</p>
                  <div className='flex space-x-2 mt-4'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setIsRegisteringModalOpen(true);
                        setRegisteringAccount({
                          phoneNumberId: account.phoneNumberId,
                          id: account.id,
                        });
                      }}
                      disabled={account.isRegistered}
                    >
                      {registeringAccount?.id === account.id && account.isRegistered ? (
                        <>
                          <FaCheck className='w-3 h-3 mr-1' /> Registered
                        </>
                      ) : (
                        <>
                          <FaCheck className='w-3 h-3 mr-1' /> Register
                        </>
                      )}
                    </Button>
                    {account.codeVerificationStatus === 'NOT_VERIFIED' && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-emerald-500 hover:text-emerald-700 justify-self-end'
                        onClick={() => {
                          requestOTP(account.phoneNumberId);
                          setVerifyModalAccount({
                            phoneNumberId: account.phoneNumberId,
                            phoneNumber: account.phoneNumber,
                          });
                          setIsVerifyModalOpen(true);
                        }}
                      >
                        <LogOut className='w-3 h-3 mr-1' /> Verify
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WhatsAppConnectModal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={() => {
          // fetchAccounts();
        }}
      />

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit WhatsApp Account</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 mt-4'>
            <div className='space-y-2'>
              <Label htmlFor='displayName'>Account Name</Label>
              <Input
                id='displayName'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleUpdateAccount}
              className='w-full bg-[#5932EA] hover:bg-[#5932EA]/90'
            >
              Update Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <RegisterNumberModal
        open={isRegisteringModalOpen}
        onClose={() => setIsRegisteringModalOpen(false)}
        accessToken={accessToken}
        phoneNumberId={registeringAccount?.phoneNumberId || ''}
        wabaId={wabaId}
        phoneNumbers={accounts}
      />

      <VerifyNumberModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        phoneNumber={verifyModalAccount?.phoneNumber || ''}
        accessToken={accessToken}
        phoneNumberId={verifyModalAccount?.phoneNumberId || ''}
        onRequestOTP={() => requestOTP(verifyModalAccount?.phoneNumberId || '')}
      />
    </Card>
  );
}
