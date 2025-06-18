'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { Company, Plan } from '@/types/company';
import type { User } from '@/types/user';
import {
  Building2,
  Calendar,
  Download,
  Globe,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCcw,
  Search,
  UserIcon,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<Company | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  function downloadAsCsv(jsonData: any, fileName: string) {
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadAsXlsx(jsonData: any, fileName: string) {
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, fileName);
  }

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      setCompanies([]);
      const companiesRes = await api.get<Company[]>('/company');
      setCompanies(companiesRes.data);
      setPlans(companiesRes.data.map((company) => company.plan).filter(Boolean));
      setAdmins(companiesRes.data.map((company) => company.admin).filter(Boolean));
    } catch (error) {
      console.error('Error fetching data:', error);
      let errorMessage = 'Failed to fetch data';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage += `: ${JSON.stringify(error)}`;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(filteredCompanies);

  const handleBlock = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to block this company?');
    if (!confirmed) return;
    try {
      await api.post(`/company/block/${id}`);
      fetchData();
      toast({
        title: 'Success',
        description: 'Company blocked successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to block company',
        variant: 'destructive',
      });
    }
  };

  const handleReactivate = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to reactivate this company?');
    if (!confirmed) return;
    try {
      await api.post(`/company/reactivate/${id}`);
      fetchData();
      toast({
        title: 'Success',
        description: 'Company reactivated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reactivate company',
        variant: 'destructive',
      });
    }
  };

  const handleExtendPlan = async (id: string) => {
    try {
      await api.post(`/company/extend-plan/${id}`);
      fetchData();
      toast({
        title: 'Success',
        description: 'Company plan extended successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to extend company plan',
        variant: 'destructive',
      });
    }
  };

  const handleDetailsOpen = (company: Company) => {
    setSelectedCompanyDetails(company);
    setIsDetailsDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getStatusColor = (company: Company) => {
    if (company?.blocked) return 'bg-red-100 text-red-800';
    const currentDate = new Date();
    const planEndDate = new Date(company?.planEnd);
    const sevenDaysFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return planEndDate > currentDate
      ? 'bg-emerald-100 text-emerald-800'
      : planEndDate > sevenDaysFromNow
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';
  };

  const getStatusText = (company: Company) => {
    if (company?.blocked) return 'Blocked';
    const currentDate = new Date();
    const planEndDate = new Date(company?.planEnd);
    const sevenDaysFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return planEndDate > currentDate
      ? 'Active'
      : planEndDate > sevenDaysFromNow
        ? 'Overdue'
        : 'Inactive';
  };

  return (
    <div className='h-full w-full'>
      <Card className='w-full h-full mx-auto'>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle className='text-2xl font-bold'>Companies</CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Manage companies and their subscriptions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-6 pt-0'>
          <div className='flex justify-between items-center mb-6'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search companies...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <div className='flex items-center space-x-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Download className='mr-2 h-4 w-4' />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => downloadAsCsv(companies, 'companies.csv')}>
                    Download as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadAsXlsx(companies, 'companies.xlsx')}>
                    Download as XLSX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant='outline' size='sm' onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <RefreshCcw className='mr-2 h-4 w-4 animate-spin' />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className='mr-2 h-4 w-4' />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className='rounded-md border overflow-hidden h-[calc(100vh-300px)]'>
            <div className='overflow-y-auto h-full'>
              <Table className='w-full h-full'>
                <TableHeader className='sticky top-0 bg-gray-100 z-10'>
                  <TableRow className='bg-gray-100'>
                    <TableHead className='font-semibold'>Company Info</TableHead>
                    <TableHead className='font-semibold'>Admin</TableHead>
                    <TableHead className='font-semibold'>Subscription</TableHead>
                    <TableHead className='font-semibold'>Status</TableHead>
                    <TableHead className='font-semibold text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index} className='animate-pulse'>
                        <TableCell className='py-4'>
                          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                          <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                        </TableCell>
                        <TableCell>
                          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                        </TableCell>
                        <TableCell>
                          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                          <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                        </TableCell>
                        <TableCell>
                          <div className='h-6 bg-gray-200 rounded w-20'></div>
                        </TableCell>
                        <TableCell>
                          <div className='h-8 bg-gray-200 rounded w-8 ml-auto'></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='h-24 text-center'>
                        No companies found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id} className='hover:bg-gray-50 transition-colors'>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium text-gray-900'>{company.name}</span>
                            <span className='text-sm text-muted-foreground'>{company.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center space-x-2'>
                            <UserIcon className='h-4 w-4 text-muted-foreground' />
                            <span>
                              {company.adminId && admins.find((admin) => admin?.id === company.adminId)?.name || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>
                              {company.plan
                                ? plans.find((plan) => plan.id === company.planId)?.name
                                : 'N/A'}
                            </span>
                            <span className='text-sm text-muted-foreground'>
                              Expires: {new Date(company.planEnd).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='secondary'
                            className={`${getStatusColor(company)} px-2 py-1`}
                          >
                            {getStatusText(company)}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleDetailsOpen(company)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExtendPlan(company.id)}>
                                Extend Plan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {company.blocked ? (
                                <DropdownMenuItem onClick={() => handleReactivate(company.id)}>
                                  Reactivate Company
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleBlock(company.id)}>
                                  Block Company
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold'>
              {selectedCompanyDetails?.name}
            </DialogTitle>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-6 py-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <Building2 className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Company Name</p>
                  <p className='text-sm text-gray-900'>{selectedCompanyDetails?.name}</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <Mail className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='text-sm text-gray-900'>{selectedCompanyDetails?.email}</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <Phone className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Phone</p>
                  <p className='text-sm text-gray-900'>{selectedCompanyDetails?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <Globe className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Website</p>
                  <p className='text-sm text-gray-900'>
                    {selectedCompanyDetails?.website || 'N/A'}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <Calendar className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Subscription Period</p>
                  <p className='text-sm text-gray-900'>
                    {selectedCompanyDetails?.planStart &&
                      new Date(selectedCompanyDetails.planStart).toLocaleDateString()}{' '}
                    -
                    {selectedCompanyDetails?.planEnd &&
                      new Date(selectedCompanyDetails.planEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <UserIcon className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Admin Name</p>
                  <p className='text-sm text-gray-900'>
                    {selectedCompanyDetails?.adminId && admins.find((admin) => admin?.id === selectedCompanyDetails?.adminId)?.name ||
                      'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Separator className='my-4' />
          <div>
            <h3 className='font-medium mb-2'>Current Status</h3>
            <Badge
              variant='secondary'
              className={`${getStatusColor(selectedCompanyDetails as Company)} px-2 py-1`}
            >
              {getStatusText(selectedCompanyDetails as Company)}
            </Badge>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
