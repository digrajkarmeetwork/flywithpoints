'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { searchDestinations, destinationRegions } from '@/data/regions';

interface DestinationOption {
  type: 'region' | 'country';
  value: string;
  region: string;
}

interface DestinationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (destination: string) => void;
  className?: string;
}

export function DestinationInput({
  label,
  placeholder,
  value,
  onChange,
  className,
}: DestinationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DestinationOption[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build initial options from regions
  const getDefaultOptions = (): DestinationOption[] => {
    const options: DestinationOption[] = [];
    destinationRegions.forEach(region => {
      options.push({
        type: 'region',
        value: region.name,
        region: region.name,
      });
    });
    return options;
  };

  useEffect(() => {
    if (query.length > 0) {
      const searchResults = searchDestinations(query);
      setResults(searchResults.map(r => ({
        type: r.type,
        value: r.value,
        region: r.region.name,
      })));
    } else {
      setResults(getDefaultOptions());
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

  const handleSelect = (option: DestinationOption) => {
    onChange(option.value);
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
    setResults(getDefaultOptions());
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
  };

  const displayValue = () => {
    if (isOpen) {
      return query;
    }
    return value || '';
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <Label className="text-sm font-medium text-foreground mb-1.5 block">
          {label}
        </Label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
          <Globe className="h-5 w-5" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={displayValue()}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="pl-10 h-12 text-base bg-card border-border focus:border-primary focus:ring-primary"
        />
        {value && !isOpen && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">Clear</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-card rounded-lg shadow-lg border border-border max-h-64 overflow-auto"
        >
          {results.length > 0 ? (
            <>
              {!query && (
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted border-b border-border">
                  Select a Destination
                </div>
              )}
              {results.map((option, index) => (
                <button
                  key={`${option.type}-${option.value}-${index}`}
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2.5 text-left hover:bg-accent focus:bg-accent focus:outline-none transition-colors flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    {option.type === 'region' ? (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {option.value}
                    </p>
                    {option.type === 'country' && (
                      <p className="text-xs text-muted-foreground truncate">
                        {option.region}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {option.type}
                  </span>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-8 text-center text-muted-foreground">
              No destinations found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
