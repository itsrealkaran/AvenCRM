import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableFiltersProps {
  onFilterChange: (filters: any) => void;
  statusOptions?: { label: string; value: string }[];
  showAmountFilter?: boolean;
  showSourceFilter?: boolean;
  showTypeFilter?: boolean;
  typeOptions?: { label: string; value: string }[];
}

export function DataTableFilters({
  onFilterChange,
  statusOptions,
  showAmountFilter,
  showSourceFilter,
  showTypeFilter,
  typeOptions,
}: DataTableFiltersProps) {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [status, setStatus] = React.useState<string>();
  const [minAmount, setMinAmount] = React.useState<string>();
  const [maxAmount, setMaxAmount] = React.useState<string>();
  const [source, setSource] = React.useState<string>();
  const [type, setType] = React.useState<string>();

  const handleApplyFilters = () => {
    onFilterChange({
      startDate,
      endDate,
      status,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      source,
      type,
    });
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatus(undefined);
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setSource(undefined);
    setType(undefined);
    onFilterChange({});
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2">
          <label>Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <label>End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {statusOptions && (
          <div className="flex flex-col gap-2">
            <label>Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showAmountFilter && (
          <>
            <div className="flex flex-col gap-2">
              <label>Min Amount</label>
              <Input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="Min amount"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Max Amount</label>
              <Input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Max amount"
              />
            </div>
          </>
        )}

        {showSourceFilter && (
          <div className="flex flex-col gap-2">
            <label>Source</label>
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter source"
            />
          </div>
        )}

        {showTypeFilter && typeOptions && (
          <div className="flex flex-col gap-2">
            <label>Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
}
