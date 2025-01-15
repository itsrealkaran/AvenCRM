'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Company, Plan } from '@/types/company';
import { User } from '@/types/user';
import {
  Building2,
  Calendar,
  Globe,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCcw,
  Search,
  User as UserIcon,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<Company | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
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

  // Function to download as XLSX
  function downloadAsXlsx(jsonData: any, fileName: string) {
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, fileName);
  }

  // Example Usage:
  const jsonData = [
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Anna', age: 28, city: 'London' },
  ];

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setCompanies([]);
      const companiesRes = await api.get<Company[]>('/company');
      setCompanies(companiesRes.data);
      setPlans(companiesRes.data.map((company) => company.plan));
      setAdmins(companiesRes.data.map((company) => company.admin));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
    const confirmed = window.confirm('Are you sure you want to reactivate this company?');
    if (!confirmed) return;
    try {
      await api.post(`/company/extend-plan/${id}`);
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

  const handleDetailsOpen = (company: Company) => {
    setSelectedCompanyDetails(company);
    setIsDetailsDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getStatusColor = (company: Company) => {
    if (company?.blocked) return 'bg-red-100 text-red-800';
    return new Date(company?.planEnd) > new Date()
      ? 'bg-emerald-100 text-emerald-800'
      : new Date(company?.planEnd) > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';
  };

  const getStatusText = (company: Company) => {
    if (company?.blocked) return 'Blocked';
    return new Date(company?.planEnd) > new Date()
      ? 'Active'
      : new Date(company?.planEnd) > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ? 'Overdue'
        : 'Inactive';
  };

  return (
    <section className='h-full'>
      <Card className='container space-y-4 p-4 md:p-6 h-full'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Companies</h1>
            <p className='text-muted-foreground mt-1'>Manage companies and their subscriptions</p>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Search companies...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className='p-1 border-[1px] hover:bg-muted/50 px-2 rounded-md'>
              Download
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => downloadAsCsv(companies, 'companies.csv')}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadAsXlsx(companies, 'companies.xlsx')}>
                XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <RefreshCcw
            className='h-7 w-7 border-[1px] p-1 rounded-md hover:bg-muted/50'
            onClick={handleRefresh}
          />
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow className='bg-white/50'>
                <TableHead className='font-semibold'>Company Info</TableHead>
                <TableHead className='font-semibold'>Admin</TableHead>
                <TableHead className='font-semibold'>Subscription</TableHead>
                <TableHead className='font-semibold'>Status</TableHead>
                <TableHead className='font-semibold'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index} className='hover:bg-muted/50 animate-pulse'>
                    <TableCell>
                      <div className='flex flex-col space-y-1'>
                        <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                        <div className='h-4 bg-gray-300 rounded w-1/2 mt-2'></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col space-y-1'>
                        <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                        <div className='h-4 bg-gray-300 rounded w-3/4 mt-2'></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-1/4'></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} className='hover:bg-muted/50'>
                    <TableCell>
                      <div className='flex flex-col space-y-1'>
                        <span className='font-medium'>{company.name}</span>
                        <span className='text-sm text-muted-foreground'>{company.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        <UserIcon className='h-4 w-4 text-muted-foreground' />
                        <span>
                          {admins.find((admin) => admin.id === company.adminId)?.name || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col space-y-1'>
                        <span className='font-medium'>
                          {plans.find((plan) => plan.id === company.planId)?.name || 'N/A'}
                        </span>
                        <span className='text-sm text-muted-foreground'>
                          Expires: {new Date(company.planEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary' className={getStatusColor(company!)}>
                        {getStatusText(company!)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='center' className='flex flex-col gap-1'>
                            <DropdownMenuItem onClick={() => handleDetailsOpen(company)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleExtendPlan(company.id)}
                              className='text-blue-600'
                            >
                              Extend Plan
                            </DropdownMenuItem>{' '}
                            {/* Implement Extend in backend */}
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
                            {/* <DropdownMenuItem
                              onClick={() => handleDelete(company.id)}
                              className='text-red-600'
                            >
                              Delete Company
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCompanies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center'>
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </div>

        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle className='text-xl font-semibold mb-4'>
                {selectedCompanyDetails?.name}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <Building2 className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>Company Name</p>
                      <p className='text-sm text-muted-foreground'>
                        {selectedCompanyDetails?.name}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>Email</p>
                      <p className='text-sm text-muted-foreground'>
                        {selectedCompanyDetails?.email}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>Phone</p>
                      <p className='text-sm text-muted-foreground'>
                        {selectedCompanyDetails?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <Globe className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>Website</p>
                      <p className='text-sm text-muted-foreground'>
                        {selectedCompanyDetails?.website || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>Subscription Period</p>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(selectedCompanyDetails?.planStart || '').toLocaleDateString()} -
                        {new Date(selectedCompanyDetails?.planEnd || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <UserIcon className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>Admin Name</p>
                      <p className='text-sm text-muted-foreground'>
                        {admins.find((admin) => admin.id === selectedCompanyDetails?.adminId)
                          ?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>Admin Email</p>
                      <p className='text-sm text-muted-foreground'>
                        {admins.find((admin) => admin.id === selectedCompanyDetails?.adminId)
                          ?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>Admin Phone</p>
                      <p className='text-sm text-muted-foreground'>
                        {admins.find((admin) => admin.id === selectedCompanyDetails?.adminId)
                          ?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className='font-medium mb-2'>Current Status</h3>
                <Badge
                  variant='secondary'
                  className={getStatusColor(selectedCompanyDetails as Company)}
                >
                  {getStatusText(selectedCompanyDetails as Company)}
                </Badge>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </section>
  );
}
