'use client';

import { useEffect, useRef, useState } from 'react';

interface TextPosition {
  id: number;
  text: string;
  x: number;
  y: number;
  font: string;
  maxWidth?: number;
  lineHeight?: number;
}

export default function Home() {
  const [textPositions, setTextPositions] = useState<TextPosition[]>([
    {
      id: 1,
      text: 'WELCOME HOME',
      x: 250,
      y: 100,
      font: 'bold 36px Arial',
      maxWidth: 500,
      lineHeight: 40,
    },
    {
      id: 2,
      text: 'INFO',
      x: 250,
      y: 160,
      font: '200 20px sans-serif',
      maxWidth: 500,
      lineHeight: 30,
    },
    {
      id: 3,
      text: '~author',
      x: 620,
      y: 420,
      font: '400 18px sans-serif',
      maxWidth: 150,
      lineHeight: 30,
    },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imageRef.current) {
      imageRef.current = new Image();
      imageRef.current.src = '/template.jpg';
      imageRef.current.width = 800;
      imageRef.current.height = 533;
      imageRef.current.style.objectFit = 'contain';
      imageRef.current.onload = () => {
        setImageLoaded(true);
        drawCanvas();
      };
    }
  }, []);

  const wrapText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    for (let i = 0; i < lines.length; i++) {
      context.fillText(lines[i], x, y + i * lineHeight);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 533;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    textPositions.forEach((pos) => {
      if (pos.text) {
        ctx.font = pos.font;
        ctx.fillStyle = 'black';

        if (pos.maxWidth && pos.lineHeight) {
          // Use text wrapping for longer texts
          wrapText(ctx, pos.text, pos.x, pos.y, pos.maxWidth, pos.lineHeight);
        } else {
          // Regular text rendering for short texts
          ctx.fillText(pos.text, pos.x, pos.y);
        }
      }
    });
  };

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [textPositions, imageLoaded]);

  const handleTextChange = (id: number, text: string) => {
    setTextPositions((prevPositions) =>
      prevPositions.map((pos) => (pos.id === id ? { ...pos, text } : pos))
    );
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'image-with-text.png';
    link.href = dataUrl;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='flex items-center  gap-4'>
        <div className='relative'>
          <canvas ref={canvasRef} className='border border-gray-300' />
        </div>

        <div className='grid grid-cols-1 gap-4 w-full max-w-md'>
          {textPositions.map((pos) => (
            <div key={pos.id} className='flex gap-2'>
              <input
                type='text'
                value={pos.text}
                onChange={(e) => handleTextChange(pos.id, e.target.value)}
                placeholder={`Text Position ${pos.id}`}
                className='border border-gray-300 rounded px-3 py-2 w-full'
              />
              <div className='text-sm text-gray-500'>
                (x: {pos.x}, y: {pos.y})
              </div>
            </div>
          ))}

          <button
            onClick={handleDownload}
            className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded'
          >
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
}
