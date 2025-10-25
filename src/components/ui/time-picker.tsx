import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value = "",
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse time string to hours and minutes
  function parseTime(
    timeString: string
  ): { hours: number; minutes: number } | null {
    if (!timeString) return null;

    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = timeString.match(timeRegex);

    if (!match) return null;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return { hours, minutes };
  }

  // Format time for input
  function formatTimeForInput(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const parsed = parseTime(value);
    if (parsed) {
      onChange?.(value);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    const parsed = parseTime(inputValue);
    if (parsed) {
      const formatted = formatTimeForInput(parsed.hours, parsed.minutes);
      setInputValue(formatted);
      onChange?.(formatted);
    }
  };

  // Clear time
  const clearTime = () => {
    setInputValue("");
    onChange?.("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Generate quick time options
  const generateQuickTimeOptions = () => {
    const commonTimes = [
      {
        label: "Now",
        hours: new Date().getHours(),
        minutes: new Date().getMinutes(),
      },
      { label: "9:00", hours: 9, minutes: 0 },
      { label: "12:00", hours: 12, minutes: 0 },
      { label: "15:00", hours: 15, minutes: 0 },
      { label: "18:00", hours: 18, minutes: 0 },
      { label: "21:00", hours: 21, minutes: 0 },
    ];

    return commonTimes.map((time, index) => (
      <Button
        key={index}
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const formatted = formatTimeForInput(time.hours, time.minutes);
          setInputValue(formatted);
          onChange?.(formatted);
          setIsOpen(false);
        }}
        className="text-xs"
      >
        {time.label}
      </Button>
    ));
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="time"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-20"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearTime}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              ×
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <Clock className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg p-3 w-48"
          role="dialog"
          aria-label="Time picker"
          aria-modal="true"
        >
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground">
              Quick Select
            </div>
            <div className="grid grid-cols-2 gap-2">
              {generateQuickTimeOptions()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { TimePicker };
