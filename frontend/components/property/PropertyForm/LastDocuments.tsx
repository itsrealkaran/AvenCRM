import type React from 'react';
import { usePropertyForm } from '@/contexts/PropertyFormContext';
import axios from 'axios';
import { ExternalLink, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

const LastDocuments: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Store files in form data for local state
      updateFormData({ documents: Array.from(files) });

      const uploadPromises = Array.from(files).map(async (file) => {
        // First, get the presigned URL
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/property/upload-file`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          }
        );

        // Now upload the file directly to S3 using the presigned URL
        await axios.put(response.data.uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
        });

        return response.data.downloadUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url);

      // Update form with new document URLs
      updateFormData({
        documents: [...(formData.documents || []), ...validUrls],
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      // TODO: Add proper error handling UI here
      // For now, reset the documents state
      updateFormData({ documents: formData.documents || [] });
    }
  };

  const removeDocument = (index: number) => {
    updateFormData({
      documents: formData.documents.filter((_, i) => i !== index),
    });
  };

  const openDocument = (file: File) => {
    const url = file;
    window.open(url as any, '_blank');
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='documents'>Upload Documents</Label>
        <Input id='documents' type='file' multiple onChange={handleFileChange} />
        <ScrollArea className='h-[300px] w-full rounded-md border p-4'>
          <ul className='space-y-2'>
            {formData.documents.map((file, index) => (
              <li key={index} className='flex justify-between items-center'>
                <span className='truncate max-w-[200px]'>{file.name}</span>
                <div className='flex items-center space-x-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => openDocument(file)}
                  >
                    <ExternalLink className='h-4 w-4 mr-2' />
                    Open
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeDocument(index)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LastDocuments;
