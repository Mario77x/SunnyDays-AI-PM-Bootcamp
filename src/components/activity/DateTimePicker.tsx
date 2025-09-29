import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay, isToday } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface DateTimePickerProps {
  selectedDate: Date | null;
  selectedTime: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onNext: () => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  onNext
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { language, t } = useLanguage();
  const today = startOfDay(new Date());

  const locale = language === 'nl' ? nl : enUS;
  const dayNames = language === 'nl' 
    ? ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days from previous month to fill the grid
  const startDate = new Date(monthStart);
  const dayOfWeek = monthStart.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0
  startDate.setDate(startDate.getDate() - mondayOffset);
  
  // Get days from next month to fill the grid (ensure 6 weeks)
  const endDate = new Date(monthEnd);
  const totalDays = 42; // 6 weeks × 7 days
  const daysFromStart = Math.ceil((monthEnd.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
  const remainingDays = totalDays - daysFromStart;
  endDate.setDate(endDate.getDate() + remainingDays);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    if (!isBefore(date, today)) {
      onDateChange(date);
    }
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, today);
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && isSameDay(date, selectedDate);
  };

  const isDateInCurrentMonth = (date: Date) => {
    return isSameMonth(date, currentMonth);
  };

  const isDateToday = (date: Date) => {
    return isToday(date);
  };

  // Quick date selection helpers
  const getQuickDates = () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisWeekend = new Date(today);
    const daysUntilSaturday = (6 - today.getDay()) % 7;
    thisWeekend.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return [
      { label: language === 'nl' ? 'Morgen' : 'Tomorrow', date: tomorrow },
      { label: language === 'nl' ? 'Dit weekend' : 'This weekend', date: thisWeekend },
      { label: language === 'nl' ? 'Volgende week' : 'Next week', date: nextWeek }
    ];
  };

  const quickDates = getQuickDates();

  return (
    <div className="space-y-6">
      {/* Quick Date Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          {language === 'nl' ? 'Snelle selectie' : 'Quick selection'}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {quickDates.map((quickDate, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleDateClick(quickDate.date)}
              className="text-sm h-9 justify-start"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {quickDate.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="p-2 h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold text-center min-w-0 flex-1">
            {format(currentMonth, 'MMMM yyyy', { locale })}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="p-2 h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const disabled = isDateDisabled(date);
              const selected = isDateSelected(date);
              const inCurrentMonth = isDateInCurrentMonth(date);
              const todayDate = isDateToday(date);
              
              return (
                <Button
                  key={index}
                  variant={selected ? "default" : "ghost"}
                  className={`
                    h-9 w-full p-0 text-sm font-normal
                    ${!inCurrentMonth ? 'text-gray-300 hover:text-gray-400' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : 'hover:bg-blue-50'}
                    ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    ${todayDate && !selected ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                    ${!disabled && !selected && inCurrentMonth ? 'hover:bg-gray-100' : ''}
                  `}
                  onClick={() => handleDateClick(date)}
                  disabled={disabled}
                >
                  {format(date, 'd')}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected date display */}
      {selectedDate && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">
              {t('activity.form.selectedDate')}: {format(selectedDate, 'EEEE d MMMM yyyy', { locale })}
            </p>
          </div>
        </div>
      )}

      {/* Time picker */}
      <div className="space-y-2">
        <Label htmlFor="time" className="text-sm font-medium text-gray-700">
          {t('activity.form.timeOptional')}
        </Label>
        <Input
          id="time"
          type="time"
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full h-11"
        />
        <p className="text-xs text-gray-500">
          {language === 'nl' 
            ? 'Laat leeg als de tijd nog niet vaststaat' 
            : 'Leave empty if time is not yet determined'}
        </p>
      </div>

      {/* Next button */}
      <Button 
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11"
        disabled={!selectedDate}
      >
        {t('activity.form.nextWeather')}
      </Button>
    </div>
  );
};