'use client';

import { usePathname } from 'next/navigation';
import { X, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { fieldMatcher } from '@/utils/field-matcher';

const FileImportModal = ({ jsonData, onClose }: { jsonData: any; onClose: () => void }) => {
  const pathname = usePathname();
  const route = pathname.split('/')[2];
  const [isImporting, setIsImporting] = useState(false);
  const [erroredData, setErroredData] = useState<any>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const initialRecords = route === 'leads' ? {
    name: fieldMatcher.name(jsonData[0]),
    email: fieldMatcher.email(jsonData[0]),
    phone: fieldMatcher.phone(jsonData[0]),
    leadAmount: fieldMatcher.leadAmount(jsonData[0]),
    budget: fieldMatcher.budget(jsonData[0]),
    location: fieldMatcher.location(jsonData[0]),
  } : {};

  const [mappedFields, setMappedFields] = useState(initialRecords);

  const handleFieldChange = (key: string, value: string) => {
    setMappedFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDownloadCSV = () => {
    // Convert errored data to CSV format
    const headers = ['Row Number', 'Field', 'Value'];
    const rows = erroredData.map((error: any, index: number) => {
      return Object.entries(error).map(([field, value]) => [
        index + 1,
        field,
        value || ''
      ]);
    }).flat();

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'import_errors.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      
      // Create a reverse mapping of field names
      const fieldMapping = Object.entries(mappedFields).reduce((acc, [key, value]) => {
        if (value) acc[value] = key;
        return acc;
      }, {} as Record<string, string>);

      // Map the data according to our field structure
      const mappedData = jsonData.map((item: any) => {
        const mappedItem: Record<string, any> = {};
        Object.entries(item).forEach(([key, value]) => {
          const mappedKey = fieldMapping[key];
          if (mappedKey) {
            // Convert numeric strings to numbers for amount fields
            if (mappedKey === 'leadAmount' || mappedKey === 'budget') {
              mappedItem[mappedKey] = value ? Number(value) : 0;
            } else {
              mappedItem[mappedKey] = value;
            }
          }
        });
        return mappedItem;
      });

      // Send the mapped data to the server
      const { data } = await apiClient.post('/leads/bulk', mappedData);

      if (data.erroredData?.length > 0 && data.erroredData[0] !== null) {
        toast.warning(`${data.message}. Some records could not be imported.`);
        setErroredData(data.erroredData);
        setShowErrorDialog(true);
        return;
      }

      toast.success(data.message);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Errors</DialogTitle>
            <DialogDescription>
              The following records could not be imported due to validation errors:
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {erroredData.map((error: any, index: number) => (
                <div key={index} className="p-4 bg-red-50 rounded-md">
                  <p className="font-medium text-red-800">Row {index + 1}</p>
                  {Object.entries(error).map(([field, value]) => (
                    <div key={field} className="mt-1 text-sm text-red-600">
                      <span className="font-medium">{field}:</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Errors as CSV
            </Button>
            <Button type="button" onClick={() => setShowErrorDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
        <Card className='shadow-xl w-[50%] max-h-[85%] h-fit overflow-hidden z-50'>
          <CardHeader className='flex flex-row items-center justify-between border-b pb-4'>
            <div>
              <CardTitle className='text-xl font-semibold'>Import {route.charAt(0).toUpperCase() + route.slice(1)}</CardTitle>
              <CardDescription className='text-gray-500'>Map your file fields to our system fields</CardDescription>
            </div>
            <Button variant='ghost' size='icon' className='rounded-full hover:bg-gray-100' onClick={onClose}>
              <X className='h-5 w-5' />
            </Button>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='flex flex-col space-y-6'>
              <div className='grid grid-cols-2 gap-x-8'>
                <div className='text-sm font-medium text-gray-700 text-center'>System Fields</div>
                <div className='text-sm font-medium text-gray-700 text-center'>Your File Fields</div>
              </div>
              <div className='space-y-3'>
                {Object.entries(mappedFields).map(([key, value]) => (
                  <div key={key} className='grid grid-cols-2 gap-x-8 items-center'>
                    <div className='bg-gray-50 px-4 py-2.5 rounded-md text-gray-700 font-medium border border-gray-200'>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <input
                      value={value}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className='px-4 py-2.5 rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors'
                      placeholder='Select matching field...'
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex justify-end space-x-3 border-t p-4 bg-gray-50'>
            <Button variant='outline' onClick={onClose} className='px-4'>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className='px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default FileImportModal;
