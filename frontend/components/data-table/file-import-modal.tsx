'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { fieldMatcher } from '@/utils/field-matcher';
import { Download, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

const FileImportModal = ({ jsonData, headers, onClose }: { jsonData: any; headers: string[]; onClose: () => void }) => {
  const pathname = usePathname();
  const route = pathname.split('/')[2];
  const [isImporting, setIsImporting] = useState(false);
  const [erroredData, setErroredData] = useState<any>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  type LeadFields = {
    name: string;
    email: string;
    phone: string;
    leadAmount: string;
    budget: string;
    location: string;
  };

  type AgentFields = {
    name: string;
    email: string;
    phone: string;
    dob: string;
    designation: string;
  };

  type MappedFields = LeadFields | AgentFields;

  const initialRecords =
    (route === 'leads' && {
      name: fieldMatcher.name(jsonData[0]),
      email: fieldMatcher.email(jsonData[0]),
      phone: fieldMatcher.phone(jsonData[0]),
      leadAmount: fieldMatcher.leadAmount(jsonData[0]),
      budget: fieldMatcher.budget(jsonData[0]),
      location: fieldMatcher.location(jsonData[0]),
    }) ||
    (route === 'manage-agents' && {
      name: fieldMatcher.name(jsonData[0]),
      email: fieldMatcher.email(jsonData[0]),
      phone: fieldMatcher.phone(jsonData[0]),
      dob: fieldMatcher.dob(jsonData[0]),
      designation: fieldMatcher.designation(jsonData[0]),
    });
  const [mappedFields, setMappedFields] = useState<MappedFields | false>(initialRecords);

  const handleFieldChange = (key: string, value: string) => {
    setMappedFields((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      } as MappedFields;
    });
  };

  const handleDownloadCSV = () => {
    // Convert errored data to CSV format
    const headers = ['Row Number', 'Field', 'Value'];
    const rows = erroredData
      .map((error: any, index: number) => {
        return Object.entries(error).map(([field, value]) => [index + 1, field, value || '']);
      })
      .flat();

    const csvContent = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');

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
      setErroredData([]);

      // Create a reverse mapping of field names
      const fieldMapping = Object.entries(mappedFields).reduce(
        (acc, [key, value]) => {
          if (value) acc[value] = key;
          return acc;
        },
        {} as Record<string, string>
      );

      // Map the data according to our field structure
      const mappedData = jsonData.map((item: any) => {
        const mappedItem: Record<string, any> = {};
        Object.entries(item).forEach(([key, value]) => {
          const mappedKey = fieldMapping[key];
          if (mappedKey) {
            if (route === 'leads' && (mappedKey === 'leadAmount' || mappedKey === 'budget')) {
              mappedItem[mappedKey] = value ? Number(value) : 0;
            } else if (route === 'manage-agents' && mappedKey === 'dob') {
              if (value) {
                try {
                  const [day, month, year] = (value as string).split('-').map(Number);
                  if (
                    isNaN(day) ||
                    isNaN(month) ||
                    isNaN(year) ||
                    day < 1 ||
                    day > 31 ||
                    month < 1 ||
                    month > 12 ||
                    year < 1900 ||
                    year > new Date().getFullYear()
                  ) {
                    mappedItem[mappedKey] = null;
                  } else {
                    const date = new Date(year, month - 1, day, 12, 0, 0);
                    if (date.toString() === 'Invalid Date') {
                      mappedItem[mappedKey] = null;
                    } else {
                      mappedItem[mappedKey] = date.toISOString();
                    }
                  }
                } catch (error) {
                  mappedItem[mappedKey] = null;
                }
              } else {
                mappedItem[mappedKey] = null;
              }
            } else {
              mappedItem[mappedKey] = value;
            }
          }
        });
        return mappedItem;
      });

      // Process data in batches if it's the leads route
      if (route === 'leads' || route === 'manage-agents') {
        const BATCH_SIZE = 10;
        const batches = [];
        for (let i = 0; i < mappedData.length; i += BATCH_SIZE) {
          batches.push(mappedData.slice(i, i + BATCH_SIZE));
        }
        setTotalBatches(batches.length);

        const allErroredData = [];
        for (let i = 0; i < batches.length; i++) {
          setImportProgress(i + 1);
          const batch = batches[i];
          try {
            const endpoint = route === 'leads' ? '/leads/bulk' : '/user/bulk';
            const { data } = await apiClient.post(endpoint, batch);
            if (data.erroredData?.length > 0 && data.erroredData[0] !== null) {
              allErroredData.push(...data.erroredData);
            }
          } catch (error) {
            console.error('Batch import error:', error);
            toast.error(`Failed to import batch ${i + 1}. Continuing with remaining batches.`);
          }
        }

        if (allErroredData.length > 0) {
          toast.warning('Import completed with some errors.');
          setErroredData(allErroredData);
          setShowErrorDialog(true);
        } else {
          toast.success(`All ${route === 'leads' ? 'leads' : 'agents'} imported successfully!`);
          onClose();
        }
      } else {
        // For other routes, process normally
        const endpoint = '/user/bulk';
        const { data } = await apiClient.post(endpoint, mappedData);

        if (data.erroredData?.length > 0 && data.erroredData[0] !== null) {
          toast.warning(`${data.message}. Some records could not be imported.`);
          setErroredData(data.erroredData);
          setShowErrorDialog(true);
          return;
        }

        toast.success(data.message);
        onClose();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Please try again.');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setTotalBatches(0);
    }
  };

  return (
    <>
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Import Errors</DialogTitle>
            <DialogDescription>
              The following records could not be imported due to validation errors:
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-[400px] overflow-y-auto'>
            <div className='space-y-4'>
              {erroredData.map((error: any, index: number) => (
                <div key={index} className='p-4 bg-red-50 rounded-md'>
                  <p className='font-medium text-red-800'>Row {index + 1}</p>
                  {Object.entries(error).map(([field, value]) => (
                    <div key={field} className='mt-1 text-sm text-red-600'>
                      <span className='font-medium'>{field}:</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className='sm:justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={handleDownloadCSV}
              className='inline-flex items-center gap-2'
            >
              <Download className='h-4 w-4' />
              Download Errors as CSV
            </Button>
            <Button type='button' onClick={() => setShowErrorDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
        {isImporting && (route === 'leads' || route === 'manage-agents') ? (
          <Card className='shadow-xl w-[400px] p-6'>
            <CardHeader className='text-center'>
              <CardTitle>Importing {route === 'leads' ? 'Leads' : 'Agents'}</CardTitle>
              <CardDescription>
                Processing batch {importProgress} of {totalBatches}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center py-6'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
              <div className='mt-4 text-sm text-gray-500'>
                {Math.round((importProgress / totalBatches) * 100)}% Complete
              </div>
              <div className='w-full mt-4 h-2 bg-gray-200 rounded-full overflow-hidden'>
                <div 
                  className='h-full bg-blue-600 transition-all duration-300'
                  style={{ width: `${(importProgress / totalBatches) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className='shadow-xl w-[50%] max-h-[85%] h-fit overflow-hidden z-50'>
            <CardHeader className='flex flex-row items-center justify-between border-b pb-4'>
              <div>
                <CardTitle className='text-xl font-semibold'>
                  Import {route.charAt(0).toUpperCase() + route.slice(1)}
                </CardTitle>
                <CardDescription className='text-gray-500'>
                  Map your file fields to our system fields
                </CardDescription>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full hover:bg-gray-100'
                onClick={onClose}
              >
                <X className='h-5 w-5' />
              </Button>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='flex flex-col space-y-6'>
                <div className='grid grid-cols-2 gap-x-8'>
                  <div className='text-sm font-medium text-gray-700 text-center'>System Fields</div>
                  <div className='text-sm font-medium text-gray-700 text-center'>
                    Your File Fields
                  </div>
                </div>
                <div className='space-y-3'>
                  {Object.entries(mappedFields).map(([key, value]) => (
                    <div key={key} className='grid grid-cols-2 gap-x-8 items-center'>
                      <div className='bg-gray-50 px-4 py-2.5 rounded-md text-gray-700 font-medium border border-gray-200'>
                        {key.charAt(0).toUpperCase() +
                          key
                            .slice(1)
                            .replace(/([A-Z])/g, ' $1')
                            .trim()}
                      </div>
                      <select
                        value={value}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className='px-4 py-2.5 rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors'
                      >
                        <option value="">Select matching field...</option>
                        {headers.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
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
                className='px-4 bg-primary hover:bg-primary/80 disabled:bg-primary/40'
              >
                {isImporting ? 'Importing...' : 'Import Data'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
};

export default FileImportModal;
