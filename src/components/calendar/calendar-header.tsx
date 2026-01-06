'use client';

import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { CalendarView } from '@/types';

export function CalendarHeader() {
  const {
    currentView,
    setCurrentView,
    selectedDate,
    setSelectedDate,
    setShowCreateTask,
  } = useAppStore();

  const navigate = (direction: 'prev' | 'next') => {
    const modifier = direction === 'prev' ? -1 : 1;
    
    switch (currentView) {
      case 'day':
        setSelectedDate(addDays(selectedDate, modifier));
        break;
      case 'week':
        setSelectedDate(addWeeks(selectedDate, modifier));
        break;
      case 'month':
        setSelectedDate(addMonths(selectedDate, modifier));
        break;
      case 'list':
        setSelectedDate(addWeeks(selectedDate, modifier));
        break;
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getTitle = () => {
    switch (currentView) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = format(selectedDate, 'MMM d');
        const weekEnd = format(addDays(selectedDate, 6), 'MMM d, yyyy');
        return `${weekStart} - ${weekEnd}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'list':
        return 'All Tasks';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
        
        <h2 className="text-lg font-semibold">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-4">
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as CalendarView)}>
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Task
        </Button>
      </div>
    </div>
  );
}
