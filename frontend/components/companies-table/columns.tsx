"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table-row-actions";

export type Company = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  plan: "enterprise" | "pro" | "basic";
  employees: number;
  lastActive: string;
};

export const columns: ColumnDef<Company>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Company Name" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      return (
        <div className="flex w-[200px] items-center">
          <span>{row.getValue("email")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "plan",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" />,
    cell: ({ row }) => {
      const plan = row.getValue("plan") as string;

      return <Badge variant="outline">{plan}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "employees",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Employees" />,
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <span>{row.getValue("employees")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "lastActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Active" />,
    cell: ({ row }) => {
      return (
        <div className="flex w-[150px] items-center">
          <span>{row.getValue("lastActive")}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
