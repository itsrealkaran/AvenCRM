'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface ContactFormProps {
  propertyId: string;
  agentId: string;
}

interface Note {
  note: string;
  time: string;
}

export function ContactForm({ propertyId, agentId }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: [] as Note[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const currentTime = new Date().toISOString().slice(0, 16); // Format: "2025-02-06T22:19"
      const noteWithTime = {
        note: formData.notes[0]?.note || '',
        time: currentTime
      };

      await api.post('/public/setLead', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyId,
        agentId,
        notes: [noteWithTime]
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: []
      });
      alert('Your inquiry has been sent successfully!');
    } catch (error) {
      console.error('Error sending inquiry:', error);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'note') {
      setFormData(prev => ({
        ...prev,
        notes: [{
          note: value,
          time: new Date().toISOString().slice(0, 16)
        }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Your Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email Address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>
      <div>
        <Input
          type="tel"
          placeholder="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>
      <div>
        <Textarea
          placeholder="Your Message"
          name="note"
          value={formData.notes[0]?.note || ''}
          onChange={handleChange}
          className="w-full min-h-[100px]"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]"
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Inquiry'}
      </Button>
    </form>
  );
}
