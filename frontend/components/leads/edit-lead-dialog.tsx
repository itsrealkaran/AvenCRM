'use client';

import { useState } from 'react';
import { leadsApi } from '@/services/leads.service';
import { LeadStatus, PropertyType } from '@estate/database';
import { UpdateLead, updateLeadSchema } from '@estate/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import DocumentUpload from '../document/document-upload';
import { BaseEntityDialog, CommonFormFields, NotesField } from '../entity-dialog';

interface EditLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: UpdateLead | null;
}

export function EditLeadDialog({ open, onOpenChange, lead }: EditLeadDialogProps) {
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const updateLead = useMutation({
    mutationFn: async ({ values, files }: { values: UpdateLead; files: File[] }) => {
      if (!lead?.id) throw new Error('Lead ID is required');
      return leadsApi.updateLead(lead.id, values, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setUploadedFiles([]); // Reset files after successful update
      onOpenChange(false);
      toast.success('Lead updated successfully');
    },
    onError: (error) => {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    },
  });

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  if (!lead) return null;

  const defaultValues: UpdateLead = {
    id: lead.id,
    name: lead.name,
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    status: lead.status,
    source: lead.source ?? '',
    propertyType: lead.propertyType,
    budget: lead.budget ?? 0,
    location: lead.location ?? '',
    document: lead.document ?? null,
    expectedDate:
      typeof lead.expectedDate === 'string' ? new Date(lead.expectedDate) : lead.expectedDate,
    lastContactDate:
      typeof lead.lastContactDate === 'string'
        ? new Date(lead.lastContactDate)
        : lead.lastContactDate,
  };

  const handleSubmit = async (values: UpdateLead) => {
    try {
      await updateLead.mutateAsync({ values, files: uploadedFiles });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    }
  };

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Lead'
      schema={updateLeadSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={updateLead.isPending}
    >
      {(form) => (
        <>
          <CommonFormFields form={form} isLoading={updateLead.isPending} />

          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-medium'>Documents</h3>
              {lead.document?.files && lead.document.files.length > 0 && (
                <Button
                  variant='outline'
                  type='button'
                  size='sm'
                  onClick={() => {
                    setUploadedFiles([]);
                    form.setValue('document', null);
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {lead.document?.files &&
                lead.document.files.map((file, index) => (
                  <div key={file.url} className='group relative border rounded-lg p-4 space-y-4'>
                    <div className='aspect-video relative bg-muted rounded-md overflow-hidden'>
                      {file.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          src={file.url}
                          alt={`File ${index + 1}`}
                          className='object-cover w-full h-full'
                        />
                      ) : (
                        <div className='flex items-center justify-center h-full'>
                          <FileText className='h-12 w-12 text-muted-foreground' />
                        </div>
                      )}
                      <Button
                        variant='destructive'
                        type='button'
                        size='icon'
                        className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                        onClick={() => {
                          const newFiles =
                            lead.document?.files?.filter((f) => f.url !== file.url) || [];
                          form.setValue('document', {
                            ...lead.document,
                            files: newFiles,
                          });
                        }}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                    <div className='space-y-2'>
                      <p className='font-medium truncate'>File {index + 1}</p>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          type='button'
                          size='sm'
                          className='flex-1'
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <DocumentUpload
              onFilesChange={handleFilesChange}
              existingFiles={lead.document?.files || []}
              disabled={updateLead.isPending}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={updateLead.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(LeadStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='propertyType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={updateLead.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select property type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PropertyType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='budget'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter budget'
                      disabled={updateLead.isPending}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter location'
                      disabled={updateLead.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='source'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter source' disabled={updateLead.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <NotesField form={form} isLoading={updateLead.isPending} />

          <div className='flex justify-end space-x-4'>
            <Button
              type='button'
              variant='outline'
              disabled={updateLead.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={updateLead.isPending} className='min-w-[100px]'>
              {updateLead.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                'Update Lead'
              )}
            </Button>
          </div>
        </>
      )}
    </BaseEntityDialog>
  );
}
