'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ContactForm } from './ContactForm';

interface FloatingContactFormProps {
  propertyId: string;
  agentId: string;
}

export function FloatingContactForm({ propertyId, agentId }: FloatingContactFormProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return;
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      
      // Show when user has scrolled 30% of the page
      const threshold = (pageHeight - windowHeight) * 0.3;
      setIsVisible(scrollPosition > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md animate-slide-up">
      <Card className="shadow-lg border-2 border-[#7C3AED]">
        <CardContent className="p-6">
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="text-lg font-semibold mb-4">Interested in this property?</h3>
          <ContactForm propertyId={propertyId} agentId={agentId} />
        </CardContent>
      </Card>
    </div>
  );
}
