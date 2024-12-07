'use client';

import { useState } from 'react';
import { Calendar, Clock, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

const dummyTasks = [
  {
    id: 1,
    title: 'Follow up with John Doe',
    dueDate: '2023-06-15',
    priority: 'High',
    status: 'Pending',
  },
  {
    id: 2,
    title: 'Schedule property viewing for 123 Main St',
    dueDate: '2023-06-18',
    priority: 'Medium',
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Prepare listing presentation for 456 Elm St',
    dueDate: '2023-06-20',
    priority: 'Low',
    status: 'Completed',
  },
];

export function TaskManager() {
  const [tasks, setTasks] = useState(dummyTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: '', status: '' });

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTask = () => {
    if (newTask.title && newTask.dueDate && newTask.priority && newTask.status) {
      setTasks([...tasks, { id: tasks.length + 1, ...newTask }]);
      setNewTask({ title: '', dueDate: '', priority: '', status: '' });
    }
  };

  const handleToggleStatus = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' }
          : task
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Manager</CardTitle>
        <CardDescription>Manage your real estate tasks and to-dos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center space-x-2'>
            <Input
              placeholder='Search tasks'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-[300px]'
            />
            <Button variant='outline'>
              <Search className='mr-2 h-4 w-4' />
              Search
            </Button>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Enter the details of the new task.</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='title' className='text-right'>
                    Title
                  </Label>
                  <Input
                    id='title'
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='dueDate' className='text-right'>
                    Due Date
                  </Label>
                  <Input
                    id='dueDate'
                    type='date'
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='priority' className='text-right'>
                    Priority
                  </Label>
                  <Select onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger className='col-span-3'>
                      <SelectValue placeholder='Select priority' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='High'>High</SelectItem>
                      <SelectItem value='Medium'>Medium</SelectItem>
                      <SelectItem value='Low'>Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='status' className='text-right'>
                    Status
                  </Label>
                  <Select onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger className='col-span-3'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Pending'>Pending</SelectItem>
                      <SelectItem value='In Progress'>In Progress</SelectItem>
                      <SelectItem value='Completed'>Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[50px]'></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={task.status === 'Completed'}
                    onCheckedChange={() => handleToggleStatus(task.id)}
                  />
                </TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  <div className='flex items-center'>
                    <Calendar className='mr-2 h-4 w-4' />
                    {task.dueDate}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      task.priority === 'High'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.priority}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      task.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.status}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
