import { DealStatus, LeadStatus } from '@/types';
import { ColumnDef, Row } from '@tanstack/react-table';

export interface BaseRecord {
  id: string;
  name: string;
  [key: string]: any;
}

export interface DataTableProps<TData extends BaseRecord, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (record: TData) => void;
  onDelete?: (recordId: string) => void;
  onBulkDelete?: (rows: Row<TData>[]) => void;
  onSelectionChange?: (selectedItems: TData[]) => void;
  onStatusChange?: (recordId: string, newStatus: LeadStatus | DealStatus) => Promise<void>;
  onConvertToDeal?: (record: TData) => void;
  filterPlaceholder?: string;
  disabled?: boolean;
  additionalActions?: React.ReactNode;
  buttons?: React.ReactNode;
  refetch?: () => void;
  onCreateLead?: () => void;
  onCreateDeal?: () => void;
  onDownload?: (format: 'csv' | 'xlsx') => void;
}
