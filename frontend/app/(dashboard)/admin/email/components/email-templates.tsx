'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const dummyTemplates = [
  { id: 1, name: 'Welcome Email', category: 'Onboarding' },
  { id: 2, name: 'Property Listing', category: 'Marketing' },
  { id: 3, name: 'Follow-up', category: 'Sales' },
];

export function EmailTemplates() {
  const [templates, setTemplates] = useState(dummyTemplates);
  const [newTemplate, setNewTemplate] = useState({ name: '', category: '', content: '' });

  const handleAddTemplate = () => {
    if (newTemplate.name && newTemplate.category && newTemplate.content) {
      setTemplates([...templates, { id: templates.length + 1, ...newTemplate }]);
      setNewTemplate({ name: '', category: '', content: '' });
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>Design and save reusable email templates</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Template Name</Label>
            <Input
              id='name'
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='category'>Category</Label>
            <Select onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Onboarding'>Onboarding</SelectItem>
                <SelectItem value='Marketing'>Marketing</SelectItem>
                <SelectItem value='Sales'>Sales</SelectItem>
                <SelectItem value='Support'>Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='content'>Template Content</Label>
            <Textarea
              id='content'
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              rows={5}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddTemplate}>Save Template</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Manage your saved email templates</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>
                    <div className='flex space-x-2'>
                      <Button variant='ghost' size='icon'>
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='icon'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
