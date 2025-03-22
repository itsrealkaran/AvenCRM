'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Form, FormField } from '../ui/form';
import { Input } from '../ui/input';

interface PermitNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  propertyName: string;
}

// Define form schema
const permitFormSchema = z.object({
  noPermit: z.boolean(),
  permitType: z.enum(['tarkheesi_permit_number', 'property_number']).optional(),
  permitNumber: z.string().optional(),
  qrCode: z.any().optional(), // For file upload
});

type PermitFormValues = z.infer<typeof permitFormSchema>;

const PermitNumberModal = ({ isOpen, onClose, id, propertyName }: PermitNumberModalProps) => {
  const { toast } = useToast();
  const [noPermit, setNoPermit] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PermitFormValues>({
    resolver: zodResolver(permitFormSchema),
    defaultValues: {
      noPermit: false,
      permitType: undefined,
      permitNumber: '',
      qrCode: null,
    },
  });

  const qrUpload = async (file: File | null) => {
    if (!file) return null;
    setIsUploading(true);

    try {
      // Create a preview URL
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      return file;
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload QR code. Please try again.',
        variant: 'destructive',
      });
      setPreviewUrl(null);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleVerifyOrUnverify = async (data: PermitFormValues) => {
    try {
      let qrCode = null;
      console.log(data, 'data');
      // If there's a QR code and no permit is false, upload the QR code first
      if (!data.noPermit && data.qrCode) {
        const file = data.qrCode;
        const formData = new FormData();
        formData.append('file', file);

        // Get presigned URL
        const response = await api.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/property/upload-file`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          }
        );

        // Upload to S3
        await axios.put(response.data.uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
        });

        console.log(response.data, 'response.data.key');
        qrCode = response.data.key;
      }

      // Submit the form data with the QR code URL
      await api.patch(`/property/${id}/permit-number`, {
        propertyId: id,
        noPermit: data.noPermit,
        permitType: data.noPermit ? null : data.permitType,
        permitNumber: data.noPermit ? null : data.permitNumber,
        qrCode: qrCode,
        isVerified: true,
      });

      toast({
        title: 'Property Verified',
        description: 'The property has been successfully verified.',
      });
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px] overflow-hidden'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='text-lg font-semibold text-gray-900'>
            Permit Number for {propertyName}
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-500'>
            Provide permit details for verification
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleVerifyOrUnverify)} className='space-y-4'>
            {/* No Permit Checkbox */}
            <FormField
              control={form.control}
              name='noPermit'
              render={({ field }) => (
                <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                  <input
                    type='checkbox'
                    id='noPermit'
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      setNoPermit(e.target.checked);
                    }}
                    className='h-4 w-4 rounded border-gray-300 text-[#5932EA]'
                  />
                  <label htmlFor='noPermit' className='ml-2 text-sm'>
                    I don&apos;t have a permit number
                  </label>
                </div>
              )}
            />

            {!noPermit && (
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='permitType'
                  render={({ field }) => (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Permit Type</p>
                      <div className='grid grid-cols-2 gap-3'>
                        {['tarkheesi_permit_number', 'property_number'].map((type) => (
                          <div key={type} className='relative'>
                            <input
                              type='radio'
                              id={type}
                              value={type}
                              checked={field.value === type}
                              onChange={() => field.onChange(type)}
                              className='peer absolute opacity-0'
                            />
                            <label
                              htmlFor={type}
                              className='flex items-center p-2 border rounded-lg cursor-pointer transition-all peer-checked:border-[#5932EA] peer-checked:bg-[#5932EA]/5'
                            >
                              <div
                                className={`w-3 h-3 border rounded-full mr-2 flex items-center justify-center ${field.value === type ? 'border-[#5932EA]' : ''}`}
                              >
                                {field.value === type && (
                                  <div className='w-2 h-2 rounded-full bg-[#5932EA]' />
                                )}
                              </div>
                              <span className='text-sm'>
                                {type === 'tarkheesi_permit_number'
                                  ? 'Tarkheesi Permit'
                                  : 'Property Number'}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name='permitNumber'
                  render={({ field }) => (
                    <div className='space-y-1'>
                      <label className='text-sm font-medium text-gray-700'>Permit Number</label>
                      <Input {...field} placeholder='Enter permit number' className='h-9' />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name='qrCode'
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className='space-y-1'>
                      <label className='text-sm font-medium text-gray-700'>Upload QR Code</label>
                      <div className='mt-1 flex flex-col items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg hover:border-[#5932EA]'>
                        {previewUrl ? (
                          <div className='space-y-2 w-full'>
                            <div className='relative w-full aspect-square max-w-[150px] mx-auto'>
                              <img
                                src={previewUrl}
                                alt='QR Preview'
                                className='rounded-lg object-cover w-full h-full'
                              />
                              <button
                                type='button'
                                onClick={() => {
                                  setPreviewUrl(null);
                                  onChange(null);
                                }}
                                className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                              >
                                <X className='h-4 w-4' />
                              </button>
                            </div>
                            {isUploading && (
                              <div className='flex items-center justify-center text-sm text-gray-500'>
                                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                Uploading...
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className='text-center flex items-center space-x-2'>
                            <svg
                              className='h-6 w-6 text-gray-400'
                              stroke='currentColor'
                              fill='none'
                              viewBox='0 0 48 48'
                            >
                              <path
                                d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                                strokeWidth={2}
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                            <div className='text-sm'>
                              <label className='relative cursor-pointer text-[#5932EA] hover:text-[#4A2BC2]'>
                                <span>Upload QR</span>
                                <Input
                                  {...field}
                                  type='file'
                                  accept='image/*'
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    qrUpload(file).then((result) => onChange(result));
                                  }}
                                  className='sr-only'
                                />
                              </label>
                              <span className='text-gray-500 ml-1'>or drag and drop</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>
            )}

            <DialogFooter className='mt-4'>
              <div className='flex space-x-2'>
                <Button type='button' variant='outline' onClick={onClose} className='px-3 h-9'>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='bg-[#5932EA] hover:bg-[#4A2BC2] px-3 h-9'
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PermitNumberModal;
