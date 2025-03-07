'use client';

import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import axios from 'axios';

interface DocumentsFieldProps {
  form: UseFormReturn<any>;
  isLoading?: boolean;
}

const DocumentsField = ({ form, isLoading }: DocumentsFieldProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'documents',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/property/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await axios.put(response.data.uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // Get the document name from the form field
      const documentName = form.getValues(`documents.${index}.name`);

      // Update the existing field instead of appending
      form.setValue(`documents.${index}.file`, response.data.key);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <FormLabel>Documents</FormLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8'
          onClick={() =>
            append({
              name: '',
              file: null,
            })
          }
          disabled={isLoading}
        >
          <PlusCircle className='mr-2 h-4 w-4' />
          Add Document
        </Button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className='space-y-4 rounded-lg border p-4'>
          <div className='flex justify-end'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => remove(index)}
              disabled={isLoading}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name={`documents.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Contract Agreement' 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`documents.${index}.file`}
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Upload File</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type='file'
                        onChange={(e) => handleFileUpload(e, index)}
                        className="w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 truncate"
                        {...field}
                      />
                      {value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onChange(null)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentsField;
