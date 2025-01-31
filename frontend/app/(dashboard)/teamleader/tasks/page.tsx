'use client';

import React, { useEffect, useState } from 'react';
import { CreateTaskDTO, Task, TaskPriority, TaskStatus, UpdateTaskDTO } from '@/types';
import { format } from 'date-fns';
import {
  AlertCircle,
  Check,
  Clock,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate');
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: undefined,
    colorTag: '#000000',
    tags: [],
    category: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get<Task[]>('/tasks');
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await api.post<Task>('/tasks', formData);
      setTasks([response.data, ...tasks]);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      const updateData: UpdateTaskDTO = {
        id: selectedTask.id,
        ...formData,
      };

      const response = await api.put<Task>(`/tasks/${selectedTask.id}`, updateData);
      setTasks(tasks.map((task) => (task.id === selectedTask.id ? response.data : task)));
      setIsEditModalOpen(false);
      resetForm();
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.delete('/tasks/bulk', { data: { taskIds: Array.from(selectedTasks) } });
      setTasks(tasks.filter((task) => !selectedTasks.has(task.id)));
      setSelectedTasks(new Set());
      toast.success('Tasks deleted successfully');
    } catch (error) {
      toast.error('Failed to delete tasks');
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: undefined,
      colorTag: '#000000',
      tags: [],
      category: '',
    });
    setSelectedTask(null);
  };

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return TaskPriority[b.priority].localeCompare(TaskPriority[a.priority]);
        case 'status':
          return TaskStatus[a.status].localeCompare(TaskStatus[b.status]);
        default:
          return 0;
      }
    });

  return (
    <Card className='p-6 h-full'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Tasks</h1>
        <div className='flex gap-2'>
          {selectedTasks.size > 0 && (
            <Button variant='destructive' onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className='w-4 h-4 mr-2' />
              Delete Selected ({selectedTasks.size})
            </Button>
          )}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='w-4 h-4 mr-2' />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateTask}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className='mb-6 flex gap-4 flex-wrap'>
        <div className='flex-1 min-w-[200px]'>
          <Input
            placeholder='Search tasks...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='Filter Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All Status</SelectItem>
            {Object.values(TaskStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='Filter Priority' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All Priority</SelectItem>
            {Object.values(TaskPriority).map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <Filter className='w-4 h-4 mr-2' />
              Sort By
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('dueDate')}>
              {sortBy === 'dueDate' && <Check className='w-4 h-4 mr-2' />}
              Due Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('priority')}>
              {sortBy === 'priority' && <Check className='w-4 h-4 mr-2' />}
              Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('status')}>
              {sortBy === 'status' && <Check className='w-4 h-4 mr-2' />}
              Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className='p-4 rounded-lg shadow-md relative animate-pulse bg-gray-200'
                style={{ borderLeft: '4px solid #666666' }}
              >
                <div className='flex justify-between items-start mb-2'>
                  <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                  <div className='flex space-x-2'>
                    <div className='h-4 w-4 bg-gray-300 rounded-full'></div>
                    <div className='h-4 w-4 bg-gray-300 rounded-full'></div>
                    <div className='h-4 w-4 bg-gray-300 rounded-full'></div>
                  </div>
                </div>
                <div className='h-3 bg-gray-300 rounded w-full mb-3'></div>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center space-x-2'>
                    <div className='h-3 w-12 bg-gray-300 rounded-full'></div>
                    <div className='h-3 w-12 bg-gray-300 rounded-full'></div>
                  </div>
                  <div className='h-3 w-20 bg-gray-300 rounded-full'></div>
                </div>
              </div>
            ))
          : filteredTasks.map((task: Task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => {
                  setSelectedTask(task);
                  setFormData({
                    title: task.title,
                    description: task.description || '',
                    priority: task.priority,
                    status: task.status,
                    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                    colorTag: task.colorTag || '#000000',
                    tags: task.tags || [],
                    category: '',
                  });
                  setIsEditModalOpen(true);
                }}
                onDelete={() => {
                  setSelectedTask(task);
                  setIsDeleteDialogOpen(true);
                }}
                isSelected={selectedTasks.has(task.id)}
                onSelect={() => toggleTaskSelection(task.id)}
              />
            ))}
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateTask}
            onCancel={() => setIsEditModalOpen(false)}
            isEdit
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTasks.size > 0
                ? `This will permanently delete ${selectedTasks.size} selected tasks.`
                : 'This will permanently delete this task.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedTasks.size > 0) {
                  handleBulkDelete();
                } else if (selectedTask) {
                  handleDeleteTask(selectedTask.id);
                }
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

interface TaskFormProps {
  formData: CreateTaskDTO;
  setFormData: React.Dispatch<React.SetStateAction<CreateTaskDTO>>;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

function TaskForm({ formData, setFormData, onSubmit, onCancel, isEdit = false }: TaskFormProps) {
  const colorOptions = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#FDCB6E', // Sunflower Yellow
    '#6C5CE7', // Purple
    '#A8E6CF', // Mint Green
    '#FF8ED4', // Soft Pink
    '#000000', // Black
  ];

  return (
    <div className='space-y-4'>
      <Input
        placeholder='Task Title'
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <Textarea
        placeholder='Description'
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <Select
        value={formData.priority}
        onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
      >
        <SelectTrigger>
          <SelectValue placeholder='Select Priority' />
        </SelectTrigger>
        <SelectContent>
          {Object.values(TaskPriority).map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priority}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isEdit && (
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select Status' />
          </SelectTrigger>
          <SelectContent>
            {Object.values(TaskStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div>
        <label className='block text-sm font-medium mb-2'>Due Date</label>
        <Calendar
          mode='single'
          selected={formData.dueDate}
          onSelect={(date) => setFormData({ ...formData, dueDate: date })}
        />
      </div>
      <div>
        <label className='block text-sm font-medium mb-2'>Color Tag</label>
        <div className='flex space-x-2'>
          {colorOptions.map((color) => (
            <button
              key={color}
              type='button'
              className={`w-8 h-8 rounded-full border-2 ${
                formData.colorTag === color
                  ? 'border-primary ring-2 ring-primary/50'
                  : 'border-gray-300 hover:border-primary'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, colorTag: color })}
            />
          ))}
        </div>
      </div>
      <div className='flex justify-end space-x-2'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>{isEdit ? 'Update' : 'Create'} Task</Button>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

function TaskCard({ task, onEdit, onDelete, isSelected, onSelect }: TaskCardProps) {
  const getPriorityBadgeStyle = (priority: TaskPriority) => {
    const styles = {
      [TaskPriority.LOW]: 'bg-green-100 text-green-800 border border-green-200',
      [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      [TaskPriority.HIGH]: 'bg-red-100 text-red-800 border border-red-200',
    };
    return styles[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeStyle = (status: TaskStatus) => {
    const styles = {
      [TaskStatus.TODO]: 'bg-blue-100 text-blue-800 border border-blue-200',
      [TaskStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800 border border-green-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      className='p-4 rounded-lg shadow-md relative'
      style={{ borderLeft: `4px solid ${task.colorTag || '#000000'}` }}
    >
      <div className='flex justify-between items-start mb-2'>
        <h3 className='font-semibold flex-grow pr-2'>{task.title}</h3>
        <div className='flex space-x-2'>
          <Button variant='ghost' size='icon' onClick={onEdit}>
            <Pencil className='w-4 h-4' />
          </Button>
          <Button variant='ghost' size='icon' onClick={onDelete}>
            <Trash className='w-4 h-4' />
          </Button>
          <Checkbox checked={isSelected} onChange={onSelect} />
        </div>
      </div>
      <p className='text-sm text-gray-600 mb-3'>{task.description}</p>
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-2'>
          <Badge
            className={`${getPriorityBadgeStyle(task.priority)} px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider`}
          >
            {task.priority}
          </Badge>
          <Badge
            className={`${getStatusBadgeStyle(task.status)} px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider`}
          >
            {task.status}
          </Badge>
        </div>
        {task.dueDate && (
          <div className='text-xs text-gray-500 flex items-center'>
            <Clock className='w-3.5 h-3.5 mr-1 opacity-70' />
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  );
}
