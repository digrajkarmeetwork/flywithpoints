'use client';

import { useState, useRef, useEffect } from 'react';
import { Plane, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { searchAirports, getAirportByCode, popularAirports } from '@/data/airports';
import { Airport } from '@/types';

interface AirportInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (code: string) => void;
  icon?: 'departure' | 'arrival';
  className?: string;
}

export function AirportInput({
  label,
  placeholder,
  value,
  onChange,
  icon = 'departure',
  className,
}: AirportInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAirport = value ? getAirportByCode(value) : null;

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchAirports(query));
    } else {
      setResults(popularAirports.slice(0, 6));
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport: Airport) => {
    onChange(airport.code);
    setQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setQuery('');
    if (!query) {
      setResults(popularAirports.slice(0, 6));
    }
  };

  const displayValue = () => {
    if (isOpen) {
      return query;
    }
    if (selectedAirport) {
      return `${selectedAirport.city} (${selectedAirport.code})`;
    }
    return '';
  };

  return (
    <div className={cn('relative', className)}>
      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
          {icon === 'departure' ? (
            <Plane className="h-5 w-5 transform rotate-45" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={displayValue()}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="pl-10 h-12 text-base bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-64 overflow-auto"
        >
          {results.length > 0 ? (
            <>
              {!query && (
                <div className="px-3 py-2 text-xs font-medium text-slate-500 bg-slate-50 border-b border-slate-100">
                  Popular Airports
                </div>
              )}
              {results.map((airport) => (
                <button
                  key={airport.code}
                  onClick={() => handleSelect(airport)}
                  className="w-full px-3 py-2.5 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-12 h-8 bg-slate-100 rounded flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700">
                      {airport.code}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {airport.city}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {airport.name}
                    </p>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-8 text-center text-slate-500">
              No airports found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
