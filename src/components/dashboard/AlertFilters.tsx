'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FilterX } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import type { Camera } from '@/lib/types';

interface AlertFiltersProps {
  cameras: Camera[];
  onFilterChange: (filters: { cameraId?: string; type?: string; date?: Date, severity?: string }) => void;
  onClearFilters: () => void;
}

export function AlertFilters({ cameras, onFilterChange, onClearFilters }: AlertFiltersProps) {
  const [selectedCamera, setSelectedCamera] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [selectedSeverity, setSelectedSeverity] = useState<string | undefined>();

  const handleApplyFilters = () => {
    onFilterChange({ 
      cameraId: selectedCamera, 
      type: selectedType, 
      date: selectedDate,
      severity: selectedSeverity
    });
  };

  const handleClear = () => {
    setSelectedCamera(undefined);
    setSelectedType(undefined);
    setSelectedDate(undefined);
    setSelectedSeverity(undefined);
    onClearFilters();
  }

  const alertTypes = ['physical_assault', 'nudity', 'distress', 'non_consensual', 'other'];
  const severities = ['LOW', 'MEDIUM', 'HIGH'];

  return (
    <Card className="p-4 mb-6 shadow">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg">Filter Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Camera" />
            </SelectTrigger>
            <SelectContent>
              {cameras.map(camera => (
                <SelectItem key={camera.id} value={camera.id}>{camera.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              {alertTypes.map(type => (
                <SelectItem key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Severity" />
            </SelectTrigger>
            <SelectContent>
              {severities.map(severity => (
                <SelectItem key={severity} value={severity}>{severity}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto">Apply Filters</Button>
            <Button onClick={handleClear} variant="outline" className="w-full sm:w-auto">
              <FilterX className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Minimal Card components if not already globally available or for local structure.
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-lg border bg-card text-card-foreground ${className}`} {...props} />
);
const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 ${className}`} {...props} />
);
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props} />
);
const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`${className}`} {...props} />
);

