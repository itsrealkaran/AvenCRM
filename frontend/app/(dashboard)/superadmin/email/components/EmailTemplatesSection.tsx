'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description?: string;
  variables?: string[];
  createdAt: string;
}

export default function EmailTemplatesSection() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    description: '',
    variables: '',
  });

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await api.get(`/email/templates`);
      const data = await response.data;
      console.log(data);
      setTemplates(data.templates);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch email templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingTemplate
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/templates/${editingTemplate.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/templates`;
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          variables: formData.variables
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error('Failed to save template');

      await fetchTemplates();
      setIsDialogOpen(false);
      resetForm();

      toast({
        title: 'Success',
        description: `Template ${editingTemplate ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingTemplate ? 'update' : 'create'} template`,
        variant: 'destructive',
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/templates/${templateId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to delete template');

      await fetchTemplates();
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      description: '',
      variables: '',
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      description: template.description || '',
      variables: template.variables?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create Template
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[725px]'>
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} Email Template</DialogTitle>
            <DialogDescription>
              Create a reusable email template with optional variables
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid w-full gap-4'>
              <div className='grid w-full gap-2'>
                <Label htmlFor='name'>Template Name</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder='Newsletter Template'
                  required
                />
              </div>
              <div className='grid w-full gap-2'>
                <Label htmlFor='subject'>Email Subject</Label>
                <Input
                  id='subject'
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder='Your Monthly Newsletter'
                  required
                />
              </div>
              <div className='grid w-full gap-2'>
                <Label htmlFor='content'>Email Content</Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder='Dear {{name}},&#10;&#10;Your content here...'
                  className='min-h-[200px]'
                  required
                />
              </div>
              <div className='grid w-full gap-2'>
                <Label htmlFor='variables'>Variables (comma-separated)</Label>
                <Input
                  id='variables'
                  value={formData.variables}
                  onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                  placeholder='name, company, date'
                />
              </div>
              <div className='grid w-full gap-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder='Template description...'
                />
              </div>
            </div>
            <div className='flex justify-end gap-4'>
              <Button type='button' variant='outline' onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type='submit'>{editingTemplate ? 'Update' : 'Create'} Template</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {templates &&
          templates.map((template) => (
            <Card key={template.id} className='bg-gradient-to-tr from-slate-200 to-slate-50'>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div>
                    <span className='font-medium'>Subject:</span> {template.subject}
                  </div>
                  {template.variables && template.variables.length > 0 && (
                    <div>
                      <span className='font-medium'>Variables:</span>{' '}
                      {template.variables.join(', ')}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className='justify-between'>
                <Button variant='outline' size='sm' onClick={() => handleEdit(template)}>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive' size='sm'>
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this template? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTemplate(template.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
      </div>

      {templates.length === 0 && (
        <div className='text-center p-8 border rounded-lg bg-muted'>
          <Plus className='mx-auto h-12 w-12 opacity-50 mb-4' />
          <h3 className='text-lg font-medium'>No email templates</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            Create your first email template to get started
          </p>
        </div>
      )}
    </div>
  );
}
