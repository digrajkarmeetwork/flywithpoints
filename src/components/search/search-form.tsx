'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRightLeft, Users, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { AirportInput } from './airport-input';
import { useSearchStore } from '@/stores/search-store';

interface SearchFormProps {
  variant?: 'hero' | 'compact';
  onSearch?: () => void;
}

export function SearchForm({ variant = 'hero', onSearch }: SearchFormProps) {
  const router = useRouter();
  const { searchParams, setSearchParams } = useSearchStore();
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    searchParams.departureDate ? new Date(searchParams.departureDate) : undefined
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    searchParams.returnDate ? new Date(searchParams.returnDate) : undefined
  );

  const swapAirports = () => {
    const temp = searchParams.origin;
    setSearchParams({
      origin: searchParams.destination,
      destination: temp,
    });
  };

  const handleSearch = () => {
    if (!searchParams.origin || !searchParams.destination || !departureDate) {
      return;
    }

    setSearchParams({
      departureDate: format(departureDate, 'yyyy-MM-dd'),
      returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
    });

    const params = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: format(departureDate, 'yyyy-MM-dd'),
      cabin: searchParams.cabinClass,
      passengers: searchParams.passengers.toString(),
    });

    if (returnDate) {
      params.set('return', format(returnDate, 'yyyy-MM-dd'));
    }

    onSearch?.();
    router.push(`/search?${params.toString()}`);
  };

  const isHero = variant === 'hero';

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-xl',
        isHero ? 'p-6 md:p-8' : 'p-4'
      )}
    >
      <div
        className={cn(
          'grid gap-4',
          isHero
            ? 'md:grid-cols-[1fr,auto,1fr] lg:grid-cols-[1fr,auto,1fr,1fr,1fr,auto,auto]'
            : 'md:grid-cols-[1fr,auto,1fr,1fr,auto]'
        )}
      >
        {/* Origin */}
        <AirportInput
          label="From"
          placeholder="City or airport"
          value={searchParams.origin}
          onChange={(code) => setSearchParams({ origin: code })}
          icon="departure"
        />

        {/* Swap Button */}
        <div className="flex items-end justify-center pb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={swapAirports}
            className="rounded-full hover:bg-blue-50 hover:text-blue-600"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Destination */}
        <AirportInput
          label="To"
          placeholder="City or airport"
          value={searchParams.destination}
          onChange={(code) => setSearchParams({ destination: code })}
          icon="arrival"
        />

        {/* Departure Date */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Departure
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full h-12 justify-start text-left font-normal border-slate-200',
                  !departureDate && 'text-slate-500'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                {departureDate ? (
                  format(departureDate, 'MMM d, yyyy')
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={departureDate}
                onSelect={setDepartureDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Return Date (Hero only) */}
        {isHero && (
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Return (optional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-12 justify-start text-left font-normal border-slate-200',
                    !returnDate && 'text-slate-500'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                  {returnDate ? (
                    format(returnDate, 'MMM d, yyyy')
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  disabled={(date) =>
                    date < new Date() ||
                    (departureDate ? date < departureDate : false)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Cabin Class */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Cabin Class
          </Label>
          <Select
            value={searchParams.cabinClass}
            onValueChange={(value) =>
              setSearchParams({
                cabinClass: value as typeof searchParams.cabinClass,
              })
            }
          >
            <SelectTrigger className="h-12 border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premium_economy">Premium Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First Class</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Passengers (Hero only) */}
        {isHero && (
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Passengers
            </Label>
            <Select
              value={searchParams.passengers.toString()}
              onValueChange={(value) =>
                setSearchParams({ passengers: parseInt(value) })
              }
            >
              <SelectTrigger className="h-12 border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search Button */}
        <div className="flex items-end">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              onClick={handleSearch}
              disabled={!searchParams.origin || !searchParams.destination || !departureDate}
              className={cn(
                'w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium',
                isHero && 'md:w-auto md:px-8'
              )}
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
