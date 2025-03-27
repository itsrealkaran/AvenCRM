import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';

interface CreateFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreateForm: (form: LeadForm) => void;
}

interface FormQuestion {
  type: 'FULL_NAME' | 'EMAIL' | 'PHONE' | 'CUSTOM' | 'FIRST_NAME' | 'LAST_NAME';
  key: string;
  label?: string;
  options?: Array<{ value: string; key: string }>;
}

interface LeadForm {
  name: string;
  questions: FormQuestion[];
}

const QUESTION_TYPES = [
  'FULL_NAME',
  'EMAIL',
  'PHONE',
  'CUSTOM',
  'FIRST_NAME',
  'LAST_NAME',
] as const;

export function CreateFormModal({ open, onClose, onCreateForm }: CreateFormModalProps) {
  const [formName, setFormName] = useState('');
  const [questions, setQuestions] = useState<FormQuestion[]>([
    { type: 'FULL_NAME', key: 'question1' },
    { type: 'EMAIL', key: 'question2' },
    { type: 'PHONE', key: 'question3' },
  ]);
  const [newQuestion, setNewQuestion] = useState<FormQuestion>({
    type: 'CUSTOM',
    key: '',
    label: '',
  });
  const [isAddingOptions, setIsAddingOptions] = useState(false);
  const [newOption, setNewOption] = useState({ value: '', key: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addQuestion = () => {
    if (newQuestion.type === 'CUSTOM' && !newQuestion.label) {
      setErrors({ ...errors, newQuestion: 'Custom questions require a label' });
      return;
    }

    const questionKey = `question${questions.length + 1}`;
    setQuestions([...questions, { ...newQuestion, key: questionKey }]);
    setNewQuestion({ type: 'CUSTOM', key: '', label: '' });
    setIsAddingOptions(false);
    setErrors({});
  };

  const addOptionToQuestion = () => {
    if (!newOption.value) {
      setErrors({ ...errors, option: 'Option value is required' });
      return;
    }

    // Auto-generate the key based on current number of options
    const nextKeyNumber = (newQuestion.options?.length || 0) + 1;
    const generatedKey = `key${nextKeyNumber}`;

    setNewQuestion({
      ...newQuestion,
      options: [...(newQuestion.options || []), { value: newOption.value, key: generatedKey }],
    });
    setNewOption({ value: '', key: '' });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formName.trim()) newErrors.name = 'Form name is required';
    if (questions.length < 2) newErrors.questions = 'At least two questions are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const response = await api.post('/meta-ads/form', {
        name: formName,
        questions,
      });
      console.log(response, 'response');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create Lead Form</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 mt-4'>
          <div className='space-y-2'>
            <Label htmlFor='form-name'>Form Name</Label>
            <Input
              id='form-name'
              placeholder='Enter form name'
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
          </div>

          <div className='space-y-2'>
            <Label>Questions</Label>
            <div className='border rounded-lg p-4 space-y-4'>
              {questions.map((question, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-2 bg-gray-50 rounded'
                >
                  <div>
                    <p className='font-medium'>{question.type}</p>
                    {question.label && <p className='text-sm text-gray-500'>{question.label}</p>}
                    {question.options && (
                      <div className='text-sm text-gray-500'>
                        Options: {question.options.map((opt) => opt.value).join(', ')}
                      </div>
                    )}
                  </div>
                  <Button variant='ghost' size='sm' onClick={() => removeQuestion(index)}>
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}

              <div className='space-y-2'>
                <Select
                  value={newQuestion.type}
                  onValueChange={(value: (typeof QUESTION_TYPES)[number]) =>
                    setNewQuestion({ ...newQuestion, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select question type' />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {newQuestion.type === 'CUSTOM' && (
                  <>
                    <Input
                      placeholder='Question label'
                      value={newQuestion.label}
                      onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                    />
                    <Button variant='outline' onClick={() => setIsAddingOptions(!isAddingOptions)}>
                      {isAddingOptions ? 'Cancel Options' : 'Add Options'}
                    </Button>

                    {isAddingOptions && (
                      <div className='space-y-2'>
                        <Input
                          placeholder='Option value'
                          value={newOption.value}
                          onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                        />
                        <Button onClick={addOptionToQuestion}>Add Option</Button>

                        {/* Display current options */}
                        {newQuestion.options && newQuestion.options.length > 0 && (
                          <div className='mt-2 space-y-2'>
                            <Label>Current Options:</Label>
                            <div className='bg-gray-50 p-2 rounded'>
                              {newQuestion.options.map((option, index) => (
                                <div
                                  key={option.key}
                                  className='flex items-center justify-between py-1'
                                >
                                  <span className='text-sm'>{option.value}</span>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                      setNewQuestion({
                                        ...newQuestion,
                                        options: newQuestion.options?.filter((_, i) => i !== index),
                                      });
                                    }}
                                  >
                                    <X className='h-4 w-4' />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <Button onClick={addQuestion}>Add Question</Button>
              </div>
            </div>
            {errors.questions && <p className='text-sm text-red-500'>{errors.questions}</p>}
          </div>

          {errors.submit && <p className='text-sm text-red-500'>{errors.submit}</p>}

          <Button className='w-full bg-[#5932EA] hover:bg-[#5932EA]/90' onClick={handleSubmit}>
            Create Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
