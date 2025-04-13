'use client';

import { useEffect, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { Info, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTemplate: () => void;
  editingTemplate?: any;
  wabaId: string;
  accessToken: string;
}

export function CreateTemplateModal({
  open,
  onClose,
  onCreateTemplate,
  editingTemplate,
  wabaId,
  accessToken,
}: CreateTemplateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(editingTemplate?.name || '');
  const [language, setLanguage] = useState(editingTemplate?.language || 'en_US');
  const [category, setCategory] = useState(editingTemplate?.category || 'MARKETING');
  const [headerText, setHeaderText] = useState(
    editingTemplate?.components?.find((c: any) => c.type === 'HEADER')?.text || ''
  );
  const [headerExamples, setHeaderExamples] = useState<string[]>(
    editingTemplate?.components?.find((c: any) => c.type === 'HEADER')?.example?.header_text || []
  );
  const [bodyText, setBodyText] = useState(
    editingTemplate?.components?.find((c: any) => c.type === 'BODY')?.text || ''
  );
  const [bodyExamples, setBodyExamples] = useState<string[]>(
    editingTemplate?.components?.find((c: any) => c.type === 'BODY')?.example?.body_text?.[0] || []
  );
  const [showRules, setShowRules] = useState(false);

  const handleSubmit = async () => {
    if (!name || !language || !category || !bodyText) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Count variables in header and body text
    const headerVariables = (headerText.match(/{{(\d+)}}/g) || []).length;
    const bodyVariables = (bodyText.match(/{{(\d+)}}/g) || []).length;

    // Validate examples match variables
    if (headerText && headerExamples.length !== headerVariables) {
      toast.error(
        `Please provide ${headerVariables} example${headerVariables !== 1 ? 's' : ''} for the header variables`
      );
      return;
    }

    if (bodyExamples.length !== bodyVariables) {
      toast.error(
        `Please provide ${bodyVariables} example${bodyVariables !== 1 ? 's' : ''} for the body variables`
      );
      return;
    }

    setIsLoading(true);

    try {
      const templateData = {
        name: name.toLowerCase().replace(/ /g, '_'),
        language,
        category,
        components: [
          ...(headerText
            ? [
                {
                  type: 'HEADER',
                  format: 'TEXT',
                  text: headerText,
                  example: {
                    header_text: headerExamples,
                  },
                },
              ]
            : []),
          {
            type: 'BODY',
            text: bodyText,
            example: {
              body_text: [bodyExamples],
            },
          },
          {
            type: 'FOOTER',
            text: 'Generated using AvenCRM',
          },
        ],
      };

      if (editingTemplate) {
        // TODO: Update template
      } else {
        // @ts-ignore
        FB.api(`/${wabaId}/message_templates`, 'POST', templateData, (response) => {
          console.log('response:', response);
          if (response.error) {
            toast.error(response.error.error_user_msg);
          } else {
            toast.success('Template created successfully');
          }
        });
      }

      onCreateTemplate();
      onClose();
    } catch (error) {
      console.error('Error creating/updating template:', error);
      toast.error(editingTemplate ? 'Failed to update template' : 'Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderExampleChange = (index: number, value: string) => {
    const newExamples = [...headerExamples];
    newExamples[index] = value;
    setHeaderExamples(newExamples);
  };

  const addHeaderExample = () => {
    const headerVariables = (headerText.match(/{{(\d+)}}/g) || []).length;
    if (headerExamples.length < headerVariables) {
      setHeaderExamples([...headerExamples, '']);
    } else {
      toast.error('Maximum number of examples reached for header variables');
    }
  };

  const removeHeaderExample = (index: number) => {
    setHeaderExamples(headerExamples.filter((_, i) => i !== index));
  };

  const handleBodyExampleChange = (index: number, value: string) => {
    const newExamples = [...bodyExamples];
    newExamples[index] = value;
    setBodyExamples(newExamples);
  };

  const addBodyExample = () => {
    const bodyVariables = (bodyText.match(/{{(\d+)}}/g) || []).length;
    if (bodyExamples.length < bodyVariables) {
      setBodyExamples([...bodyExamples, '']);
    } else {
      toast.error('Maximum number of examples reached for body variables');
    }
  };

  const removeBodyExample = (index: number) => {
    setBodyExamples(bodyExamples.filter((_, i) => i !== index));
  };

  // Update examples when text changes
  useEffect(() => {
    const headerVariables = (headerText.match(/{{(\d+)}}/g) || []).length;
    const bodyVariables = (bodyText.match(/{{(\d+)}}/g) || []).length;

    // Adjust header examples
    if (headerExamples.length > headerVariables) {
      setHeaderExamples(headerExamples.slice(0, headerVariables));
    } else if (headerExamples.length < headerVariables) {
      setHeaderExamples([
        ...headerExamples,
        ...Array(headerVariables - headerExamples.length).fill(''),
      ]);
    }

    // Adjust body examples
    if (bodyExamples.length > bodyVariables) {
      setBodyExamples(bodyExamples.slice(0, bodyVariables));
    } else if (bodyExamples.length < bodyVariables) {
      setBodyExamples([...bodyExamples, ...Array(bodyVariables - bodyExamples.length).fill('')]);
    }
  }, [headerText, bodyText]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[700px] max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {editingTemplate ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
          <DialogDescription className='text-base'>
            Create a new WhatsApp message template. Templates must be approved by Meta before they
            can be used.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[calc(90vh-230px)] pr-4'>
          <div className='grid gap-6 py-4 mx-8'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-left font-medium'>
                Name
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='inline-block ml-1 h-4 w-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>A unique identifier for your template</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='col-span-3'
                placeholder='e.g., seasonal_promotion'
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='language' className='text-left font-medium'>
                Language
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='inline-block ml-1 h-4 w-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The language code for your template</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select language' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='en_US'>English (US)</SelectItem>
                  <SelectItem value='en_GB'>English (UK)</SelectItem>
                  <SelectItem value='es'>Spanish</SelectItem>
                  <SelectItem value='fr'>French</SelectItem>
                  <SelectItem value='de'>German</SelectItem>
                  <SelectItem value='it'>Italian</SelectItem>
                  <SelectItem value='pt'>Portuguese</SelectItem>
                  <SelectItem value='ru'>Russian</SelectItem>
                  <SelectItem value='ja'>Japanese</SelectItem>
                  <SelectItem value='ko'>Korean</SelectItem>
                  <SelectItem value='ar'>Arabic</SelectItem>
                  <SelectItem value='hi'>Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='category' className='text-left font-medium'>
                Category
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='inline-block ml-1 h-4 w-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The purpose category of your template</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='MARKETING'>Marketing</SelectItem>
                  <SelectItem value='UTILITY'>Utility</SelectItem>
                  <SelectItem value='AUTHENTICATION'>Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-3 items-center gap-4 ml-auto'>
              <div className='col-span-1 flex justify-start ml-2 mt-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-muted-foreground hover:text-foreground'
                  onClick={() => setShowRules(true)}
                >
                  <Info className='h-4 w-4 mr-2' />
                  View Verification Rules
                </Button>
              </div>
            </div>

            <Dialog open={showRules} onOpenChange={setShowRules}>
              <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                  <DialogTitle>WhatsApp Template Verification Rules</DialogTitle>
                  <DialogDescription>
                    Follow these rules to ensure your template gets approved by the WhatsApp team.
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Variable Format</h4>
                    <p className='text-sm text-muted-foreground'>
                      • Variables must use the correct format:{' '}
                      <code className='font-mono bg-muted px-1 rounded'>
                        &#123;&#123;1&#125;&#125;
                      </code>
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      • Variables must be sequential (e.g., &#123;&#123;1&#125;&#125;,
                      &#123;&#123;2&#125;&#125;, &#123;&#123;3&#125;&#125;)
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium'>Variable Restrictions</h4>
                    <p className='text-sm text-muted-foreground'>
                      • Variables cannot contain special characters (#, $, %)
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      • Template cannot end with a variable
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium'>Message Length</h4>
                    <p className='text-sm text-muted-foreground'>
                      • Message length should be proportional to the number of variables
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      • Too many variables in a short message may be rejected
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className='grid grid-cols-4 gap-4'>
              <Label
                htmlFor='header'
                className='text-left font-medium sticky top-0 pt-4 bg-background'
              >
                Header
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='inline-block ml-1 h-4 w-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Optional header text for your template</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className='col-span-3 space-y-3 sticky top-0 pt-4 bg-background'>
                <Input
                  id='header'
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder='e.g., Our {{1}} is on!'
                  className='font-mono'
                />
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-sm font-medium'>Variable Examples</Label>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addHeaderExample}
                      className='h-8'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add Example
                    </Button>
                  </div>
                  {headerExamples.map((example, index) => (
                    <div key={index} className='flex gap-2'>
                      <Input
                        value={example}
                        onChange={(e) => handleHeaderExampleChange(index, e.target.value)}
                        placeholder={`Example ${index + 1}`}
                        className='flex-1'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => removeHeaderExample(index)}
                        className='h-10 w-10'
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-4 gap-4'>
              <Label
                htmlFor='body'
                className='text-left font-medium sticky top-0 pt-4 bg-background'
              >
                Body
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='inline-block ml-1 h-4 w-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        The main content of your template. Use &#123;&#123;1&#125;&#125;,
                        &#123;&#123;2&#125;&#125;, etc. for variables.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className='col-span-3 space-y-3 sticky top-0 pt-4 bg-background'>
                <Textarea
                  id='body'
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder='e.g., Shop now through {{1}} and use code {{2}} to get {{3}} off of all merchandise.'
                  className='min-h-[100px] font-mono'
                />
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-sm font-medium'>Variable Examples</Label>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addBodyExample}
                      className='h-8'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add Example
                    </Button>
                  </div>
                  {bodyExamples.map((example, index) => (
                    <div key={index} className='flex gap-2'>
                      <Input
                        value={example}
                        onChange={(e) => handleBodyExampleChange(index, e.target.value)}
                        placeholder={`Example ${index + 1}`}
                        className='flex-1'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => removeBodyExample(index)}
                        className='h-10 w-10'
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className='mt-6'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
          >
            {isLoading ? 'Creating...' : editingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
