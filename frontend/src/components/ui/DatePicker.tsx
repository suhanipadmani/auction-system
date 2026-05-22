"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  align?: "left" | "right";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  label,
  required,
  disabled,
  className,
  minDate,
  maxDate,
  showTime = false,
  align = "left",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : undefined;

  // Formatting helpers
  const formatValue = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    if (showTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.hour12 = true;
    }
    return date.toLocaleString("default", options);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateDays = useCallback(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Previous month filler
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }

    // Next month filler
    const totalDaysVisible = 42; // 6 rows * 7 days
    const nextMonthFiller = totalDaysVisible - days.length;
    for (let i = 1; i <= nextMonthFiller; i++) {
      days.push({
        day: i,
        month: month + 1,
        year,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  const handleDateClick = (day: number, month: number, year: number) => {
    const newDate = new Date(year, month, day);
    
    // Keep current time if selectedDate exists
    if (selectedDate) {
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    } else {
      newDate.setHours(0, 0, 0, 0);
    }
    
    // Check min/max
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;

    onChange(newDate);
    if (!showTime) setIsOpen(false);
  };

  const handleTimeChange = (type: "hour" | "minute", val: number) => {
    const newDate = selectedDate ? new Date(selectedDate) : new Date();
    if (type === "hour") newDate.setHours(val);
    else newDate.setMinutes(val);
    
    onChange(newDate);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const isSelected = (day: number, month: number, year: number) => {
    return (
      selectedDate?.getDate() === day &&
      selectedDate?.getMonth() === month &&
      selectedDate?.getFullYear() === year
    );
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isDisabled = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-foreground/80 flex items-center gap-1">
          {label}
          {required && <span className="text-destructive font-bold">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background transition-all",
            "hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
            isOpen && "ring-2 ring-ring ring-offset-2"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className={cn("truncate", !selectedDate && "text-muted-foreground")}>
              {selectedDate ? formatValue(selectedDate) : placeholder}
            </span>
          </div>
          {selectedDate && !disabled && (
            <div
              className="ml-2 hover:text-destructive transition-colors p-0.5 rounded-full hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            >
              <X className="h-3 w-3" />
            </div>
          )}
        </button>

        {isOpen && (
          <div className={cn(
            "absolute top-full z-50 mt-2 rounded-xl border bg-card p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200",
            align === "left" ? "left-0" : "right-0",
            showTime ? "w-[420px]" : "w-[280px]",
            "max-w-[calc(100vw-2rem)] sm:max-w-none h-auto"
          )}>
            <div className={cn("flex gap-4", showTime && "flex-row")}>
              <div className="flex-1">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {formatMonthYear(viewDate)}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-white/10"
                      onClick={() => changeMonth(-1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-white/10"
                      onClick={() => changeMonth(1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-[10px] font-bold text-center text-muted-foreground uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {generateDays().map((dateObj, index) => {
                    const selected = isSelected(dateObj.day, dateObj.month, dateObj.year);
                    const current = isToday(dateObj.day, dateObj.month, dateObj.year);
                    const disabled = isDisabled(dateObj.day, dateObj.month, dateObj.year);
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDateClick(dateObj.day, dateObj.month, dateObj.year)}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs transition-all relative flex items-center justify-center",
                          !dateObj.isCurrentMonth && "text-muted-foreground/30",
                          dateObj.isCurrentMonth && !selected && "hover:bg-primary/20 text-foreground",
                          selected && "bg-primary text-white font-bold shadow-lg shadow-primary/30",
                          current && !selected && "border border-primary/50 text-primary font-bold",
                          disabled && "opacity-20 cursor-not-allowed grayscale"
                        )}
                      >
                        {dateObj.day}
                        {current && !selected && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {showTime && (
                <div className="w-[120px] flex flex-col border-l border-white/10 pl-3">
                  <div className="text-[10px] font-bold text-white/40 uppercase mb-3 tracking-wider text-center">Time</div>
                  
                  <div className="flex flex-1 gap-2 min-h-0">
                    {/* Hours Column */}
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1 h-[240px]">
                      <div className="text-[8px] font-bold text-white/20 text-center uppercase mb-1">Hr</div>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleTimeChange("hour", i)}
                          className={cn(
                            "h-8 w-full rounded-lg text-[11px] transition-all flex items-center justify-center shrink-0",
                            selectedDate?.getHours() === i 
                              ? "bg-primary text-white font-bold shadow-lg shadow-primary/20" 
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {i.toString().padStart(2, "0")}
                        </button>
                      ))}
                    </div>

                    {/* Minutes Column */}
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1 h-[240px]">
                      <div className="text-[8px] font-bold text-white/20 text-center uppercase mb-1">Min</div>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const min = i * 5;
                        return (
                          <button
                            key={min}
                            type="button"
                            onClick={() => handleTimeChange("minute", min)}
                            className={cn(
                              "h-8 w-full rounded-lg text-[11px] transition-all flex items-center justify-center shrink-0",
                              selectedDate?.getMinutes() === min 
                                ? "bg-primary text-white font-bold shadow-lg shadow-primary/20" 
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {min.toString().padStart(2, "0")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] uppercase font-extrabold h-8 px-4 hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                onClick={() => {
                  const today = new Date();
                  setViewDate(today);
                  handleDateClick(today.getDate(), today.getMonth(), today.getFullYear());
                }}
              >
                Today
              </Button>
              {showTime && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-6 text-[11px] font-extrabold uppercase bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-full transition-all hover:scale-105 active:scale-95"
                  onClick={() => setIsOpen(false)}
                >
                  Apply
                </Button>
              )}
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                <span>{showTime ? "Pick date & time" : "Pick a date"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
