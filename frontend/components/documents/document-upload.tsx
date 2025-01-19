import React, { useCallback, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

interface DocumentUploadProps {
  onFilesChange: (files: File[]) => void;
  existingFiles?: File[];
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFilesChange,
  existingFiles = [],
  disabled = false,
  maxFiles = 10,
  maxSize = 25 * 1024 * 1024, // 25MB default
  acceptedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length + files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const newFiles = [...files, ...validFiles];
      setFiles(newFiles);
      onFilesChange(newFiles);
    },
    [files, maxFiles, maxSize, onFilesChange]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
  });

  return (
    <div className='space-y-4'>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className='mx-auto h-12 w-12 text-gray-400' />
        <p className='mt-2 text-sm text-gray-600'>
          {isDragActive
            ? 'Drop the files here'
            : 'Drag & drop files here, or click to select files'}
        </p>
        <p className='text-xs text-gray-500 mt-1'>
          Supported files: Images, PDF, DOC, DOCX (max {maxSize / 1024 / 1024}MB per file)
        </p>
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Existing Files</h4>
          <div className='grid grid-cols-1 gap-2'>
            {/* {existingFiles.map((file, index) => (
              <div
                key={file.id}
                className='flex items-center justify-between p-2 bg-gray-50 rounded-md'
              >
                <div className='flex items-center space-x-2'>
                  <FileText className='h-4 w-4 text-gray-500' />
                  <span className='text-sm text-gray-700'>{file.url}</span>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0'
                  onClick={() => {
                    // Handle existing file deletion
                  }}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ))} */}
          </div>
        </div>
      )}

      {/* New Files */}
      {files.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>New Files</h4>
          <div className='grid grid-cols-1 gap-2'>
            {files.map((file, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-2 bg-gray-50 rounded-md'
              >
                <div className='flex items-center space-x-2'>
                  <FileText className='h-4 w-4 text-gray-500' />
                  <span className='text-sm text-gray-700'>{file.name}</span>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0'
                  onClick={() => removeFile(index)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
