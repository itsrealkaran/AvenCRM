'use client';

import React, { useEffect, useState } from 'react';
import { CreateTaskDTO, Task, TaskPriority, TaskStatus, UpdateTaskDTO } from '@/types';
import { format } from 'date-fns';
import { Loader2, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: undefined,
    colorTag: '#000000',
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: undefined,
      colorTag: '#000000',
    });
    setSelectedTask(null);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      colorTag: task.colorTag || '#000000',
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  return (
    <Card className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Tasks</h1>
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

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => openEditModal(task)}
            onDelete={() => handleDeleteTask(task.id)}
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
      <Input
        type='color'
        value={formData.colorTag}
        onChange={(e) => setFormData({ ...formData, colorTag: e.target.value })}
      />
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
}

function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div
      className='p-4 rounded-lg shadow-md'
      style={{ borderLeft: `4px solid ${task.colorTag || '#000000'}` }}
    >
      <div className='flex justify-between items-start mb-2'>
        <h3 className='font-semibold'>{task.title}</h3>
        <div className='flex space-x-2'>
          <Button variant='ghost' size='icon' onClick={onEdit}>
            <Pencil className='w-4 h-4' />
          </Button>
          <Button variant='ghost' size='icon' onClick={onDelete}>
            <Trash className='w-4 h-4' />
          </Button>
        </div>
      </div>
      <p className='text-sm text-gray-600 mb-2'>{task.description}</p>
      <div className='flex justify-between text-sm'>
        <span className='px-2 py-1 rounded bg-primary/10'>{task.priority}</span>
        <span className='px-2 py-1 rounded bg-secondary/10'>{task.status}</span>
      </div>
      {task.dueDate && (
        <div className='mt-2 text-sm text-gray-500'>
          Due: {format(new Date(task.dueDate), 'PPP')}
        </div>
      )}
    </div>
  );
}
