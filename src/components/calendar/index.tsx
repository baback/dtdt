'use client';

import { useAppStore } from '@/store/app-store';
import { CalendarHeader } from './calendar-header';
import { ListView } from './list-view';
import { DayView } from './day-view';
import { WeekView } from './week-view';
import { MonthView } from './month-view';

export function CalendarView() {
  const { currentView } = useAppStore();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <CalendarHeader />
      
      {currentView === 'list' && <ListView />}
      {currentView === 'day' && <DayView />}
      {currentView === 'week' && <WeekView />}
      {currentView === 'month' && <MonthView />}
    </div>
  );
}
