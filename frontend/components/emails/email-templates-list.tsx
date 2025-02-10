'use client';

import { useEffect, useState } from 'react';
import type { EmailTemplate } from '@/types/email';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

import {
  createEmailTemplate,
  deleteEmailTemplate,
  fetchEmailTemplates,
  updateEmailTemplate,
} from '@/components/email/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { AITextarea } from '../ui/ai-textarea';

export function EmailTemplatesList() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    content: '',
    variables: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetchEmailTemplates();
      setTemplates(response);
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        const updatedTemplate = await updateEmailTemplate(
          currentTemplate.id!,
          currentTemplate as EmailTemplate
        );
        setTemplates(templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)));
      } else {
        const createdTemplate = await createEmailTemplate(currentTemplate as EmailTemplate);
        setTemplates([...templates, createdTemplate]);
      }
      setIsDialogOpen(false);
      setCurrentTemplate({ name: '', subject: '', content: '', variables: [] });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to create/update template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteEmailTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className='w-full'>
      <CardHeader>
        <div>
          <CardTitle className='text-2xl font-bold'>Email Templates</CardTitle>
          <CardDescription>Create and manage your email templates</CardDescription>
        </div>
        <div className='mt-4 flex justify-between items-center space-x-4'>
          <div className='flex-1'>
            <Input
              placeholder='Search templates...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant='outline' onClick={loadTemplates}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setIsDialogOpen(true);
            }}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
          >
            <FaPlus className='mr-2 h-4 w-4' /> Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className='h-4 w-32 bg-gray-200 rounded animate-pulse'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-4 w-48 bg-gray-200 rounded animate-pulse'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-4 w-36 bg-gray-200 rounded animate-pulse'></div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='h-8 w-8 bg-gray-200 rounded float-right animate-pulse'></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>{template.variables?.join(', ')}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <FaEdit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)}>
                            <FaTrash className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-10'>
                    <h3 className='text-lg font-semibold mb-2'>No templates found</h3>
                    <p className='text-muted-foreground mb-4'>
                      Create your first email template to get started
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className='bg-[#5932EA] hover:bg-[#5932EA]/90'
                    >
                      <FaPlus className='mr-2 h-4 w-4' /> Create Template
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[80vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Edit your email template details.'
                : 'Create a new email template for your campaigns.'}
            </DialogDescription>
          </DialogHeader>
          <form
            id='templateForm'
            onSubmit={handleCreateOrUpdateTemplate}
            className='flex-1 overflow-y-auto pr-6'
          >
            <div className='grid gap-4 p-4'>
              <div className='space-y-4 pb-6'>
                <div className='grid gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Template Name</Label>
                    <Input
                      id='name'
                      value={currentTemplate.name}
                      onChange={(e) =>
                        setCurrentTemplate({ ...currentTemplate, name: e.target.value })
                      }
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='subject'>Subject</Label>
                    <div className='flex items-center border rounded-md bg-white'>
                      <Input
                        id='subject'
                        value={currentTemplate.subject}
                        onChange={(e) =>
                          setCurrentTemplate({ ...currentTemplate, subject: e.target.value })
                        }
                        className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                      />
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='content'>Content</Label>
                    <div className='border rounded-md bg-white'>
                      <Tabs defaultValue='edit' className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                          <TabsTrigger value='edit'>Edit</TabsTrigger>
                          <TabsTrigger value='preview'>Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value='edit' className='p-4'>
                          <AITextarea
                            id='content'
                            value={currentTemplate.content}
                            onChange={(e) =>
                              setCurrentTemplate({ ...currentTemplate, content: e.target.value })
                            }
                            className='min-h-[150px] w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                          />
                        </TabsContent>
                        <TabsContent value='preview' className='p-4'>
                          <div
                            className='border rounded p-4 min-h-[150px]'
                            dangerouslySetInnerHTML={{ __html: currentTemplate.content! }}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='variables'>Variables</Label>
                    <Input
                      id='variables'
                      value={currentTemplate.variables?.join(', ')}
                      onChange={(e) =>
                        setCurrentTemplate({
                          ...currentTemplate,
                          variables: e.target.value.split(', '),
                        })
                      }
                      placeholder='name, email, etc.'
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
          <DialogFooter className='flex-shrink-0'>
            <Button
              type='submit'
              form='templateForm'
              className='bg-[#5932EA] hover:bg-[#5932EA]/90 text-white'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Update Template'
              ) : (
                'Create Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
