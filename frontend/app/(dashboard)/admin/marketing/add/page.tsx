'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TemplateImage {
  src: string;
  loaded: boolean;
}

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [propertyImage0, setPropertyImage0] = useState<string | null>(null);
  const [propertyImage1, setPropertyImage1] = useState<string | null>(null);
  const [propertyImage2, setPropertyImage2] = useState<string | null>(null);
  const [property, setProperty] = useState('PROPERTY');
  const [title, setTitle] = useState('Contact Now');
  const [status, setStatus] = useState('+911234567890');

  const [templateImages] = useState<{ [key: string]: TemplateImage }>({
    // layer1: { src: '/temp/3.png', loaded: false },
    layer2: { src: '/temp/4.png', loaded: false },
    layer3: { src: '/temp/5.png', loaded: false },
    layer4: { src: '/temp/6.png', loaded: false },
    // layer5: { src: '/temp/7.png', loaded: false },
    layer6: { src: '/temp/8.png', loaded: false },
    layer7: { src: '/temp/9.png', loaded: false },
    layer8: { src: '/temp/10.png', loaded: false },
    // layer9: { src: '/temp/11.png', loaded: false },
    layer10: { src: '/temp/12.png', loaded: false },
    layer11: { src: '/temp/13.png', loaded: false },
    layer12: { src: '/temp/14.png', loaded: false },
    // layer13: { src: '/temp/15.png', loaded: false }
  });

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const drawCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Black background
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 84px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';

      if (propertyImage0) {
        const img1 = await loadImage(propertyImage0);
        ctx.drawImage(
          img1,
          canvas.width * 0.4,
          canvas.height * 0,
          canvas.width * 0.6,
          canvas.height * 0.7
        );
      }

      // Draw template layers in order
      for (const key in templateImages) {
        const layer = templateImages[key];
        const img = await loadImage(layer.src);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      // Property images if uploaded
      if (propertyImage1) {
        const img1 = await loadImage(propertyImage1);
        ctx.drawImage(
          img1,
          canvas.width * 0.61,
          canvas.height * 0.375,
          canvas.width * 0.28,
          canvas.height * 0.24
        );
      }

      if (propertyImage2) {
        const img2 = await loadImage(propertyImage2);
        ctx.drawImage(
          img2,
          canvas.width * 0.61,
          canvas.height * 0.665,
          canvas.width * 0.28,
          canvas.height * 0.245
        );
      }

      // Draw custom text
      ctx.font = 'bold 84px Arial';
      ctx.fillText(property.toUpperCase(), canvas.width * 0.33, canvas.height * 0.27);

      ctx.font = 'bolder 40px Arial';
      ctx.fillText(title, canvas.width * 0.31, canvas.height * 0.86);

      ctx.font = 'bold 36px Arial';
      ctx.fillText(status, canvas.width * 0.32, canvas.height * 0.9);
    } catch (error) {
      console.error('Error drawing canvas:', error);
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [propertyImage1, propertyImage2, property, status]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (value: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'property-listing.png';
    link.click();
  };

  return (
    <div className='h-full bg-gray-100 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>Property Listing Generator</h1>

        <div className='flex flex-col md:flex-row gap-8'>
          {/* Left Section - Canvas */}
          <Card className='flex-1 p-4'>
            <canvas
              ref={canvasRef}
              width={1000}
              height={1000}
              className='w-full border border-gray-200 rounded-lg bg-white'
            />
          </Card>

          {/* Right Section - Controls */}
          <Card className='w-full md:w-96 p-6 space-y-6'>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='title'>Property</Label>
                <Input
                  id='title'
                  type='text'
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  placeholder='Enter property title'
                />
              </div>

              <div>
                <Label htmlFor='title'>Contact Now</Label>
                <Input
                  id='title'
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Enter property status'
                />
              </div>

              <div>
                <Label htmlFor='status'>Status</Label>
                <Input
                  id='status'
                  type='text'
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder='Enter property status'
                />
              </div>

              <div>
                <Label htmlFor='image1'>Background</Label>
                <Input
                  id='image0'
                  type='file'
                  accept='image/*'
                  onChange={(e) => handleImageUpload(e, setPropertyImage0)}
                />
              </div>

              <div>
                <Label htmlFor='image1'>Property Image 1</Label>
                <Input
                  id='image1'
                  type='file'
                  accept='image/*'
                  onChange={(e) => handleImageUpload(e, setPropertyImage1)}
                />
              </div>

              <div>
                <Label htmlFor='image2'>Property Image 2</Label>
                <Input
                  id='image2'
                  type='file'
                  accept='image/*'
                  onChange={(e) => handleImageUpload(e, setPropertyImage2)}
                />
              </div>

              <Button className='w-full' onClick={handleDownload}>
                Download Image
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
