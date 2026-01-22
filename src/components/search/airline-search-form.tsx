'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plane, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getAirlinesGroupedByAlliance,
  getPopularAirlines,
  type Airline,
} from '@/data/airlines';

interface AirlineSearchFormProps {
  onSearch?: () => void;
}

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first' | 'all';

const allianceColors = {
  star: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  oneworld: 'bg-red-100 text-red-800 border-red-300',
  skyteam: 'bg-blue-100 text-blue-800 border-blue-300',
  other: 'bg-slate-100 text-slate-800 border-slate-300',
};

const allianceLabels = {
  star: 'Star Alliance',
  oneworld: 'Oneworld',
  skyteam: 'SkyTeam',
  other: 'Other Airlines',
};

export function AirlineSearchForm({ onSearch }: AirlineSearchFormProps) {
  const router = useRouter();
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const [cabinClass, setCabinClass] = useState<CabinClass>('business');
  const [airlineOpen, setAirlineOpen] = useState(false);

  const groupedAirlines = getAirlinesGroupedByAlliance();
  const popularAirlines = getPopularAirlines();

  const handleSearch = () => {
    if (!selectedAirline) return;

    const params = new URLSearchParams({
      airline: selectedAirline.code,
    });

    if (cabinClass !== 'all') {
      params.set('cabin', cabinClass);
    }

    onSearch?.();
    router.push(`/explore-airlines?${params.toString()}`);
  };

  const renderAirlineOption = (airline: Airline) => (
    <CommandItem
      key={airline.code}
      value={`${airline.name} ${airline.code}`}
      onSelect={() => {
        setSelectedAirline(airline);
        setAirlineOpen(false);
      }}
      className="flex items-center justify-between py-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <Plane className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <p className="font-medium text-slate-900">{airline.name}</p>
          <p className="text-sm text-slate-500">{airline.code} - {airline.country}</p>
        </div>
      </div>
      {airline.alliance && (
        <Badge variant="outline" className={cn('text-xs', allianceColors[airline.alliance])}>
          {allianceLabels[airline.alliance]}
        </Badge>
      )}
    </CommandItem>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-[2fr,1fr,auto]">
        {/* Airline Selector */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Select Airline
          </Label>
          <Popover open={airlineOpen} onOpenChange={setAirlineOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={airlineOpen}
                className="w-full h-12 justify-between border-slate-200 font-normal"
              >
                {selectedAirline ? (
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-slate-400" />
                    <span>{selectedAirline.name}</span>
                    <span className="text-slate-400">({selectedAirline.code})</span>
                  </div>
                ) : (
                  <span className="text-slate-500">Choose an airline...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search airlines..." />
                <CommandList className="max-h-[400px]">
                  <CommandEmpty>No airline found.</CommandEmpty>

                  {/* Popular Airlines */}
                  <CommandGroup heading="Popular Airlines">
                    {popularAirlines.map(renderAirlineOption)}
                  </CommandGroup>

                  {/* Star Alliance */}
                  <CommandGroup heading="Star Alliance">
                    {groupedAirlines.star
                      .filter((a) => !popularAirlines.find((p) => p.code === a.code))
                      .map(renderAirlineOption)}
                  </CommandGroup>

                  {/* Oneworld */}
                  <CommandGroup heading="Oneworld">
                    {groupedAirlines.oneworld
                      .filter((a) => !popularAirlines.find((p) => p.code === a.code))
                      .map(renderAirlineOption)}
                  </CommandGroup>

                  {/* SkyTeam */}
                  <CommandGroup heading="SkyTeam">
                    {groupedAirlines.skyteam
                      .filter((a) => !popularAirlines.find((p) => p.code === a.code))
                      .map(renderAirlineOption)}
                  </CommandGroup>

                  {/* Other Airlines */}
                  <CommandGroup heading="Other Airlines">
                    {groupedAirlines.other
                      .filter((a) => !popularAirlines.find((p) => p.code === a.code))
                      .map(renderAirlineOption)}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Premium Product Info */}
          {selectedAirline?.premiumProducts && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedAirline.premiumProducts.business && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Business: {selectedAirline.premiumProducts.business}
                </Badge>
              )}
              {selectedAirline.premiumProducts.first && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  First: {selectedAirline.premiumProducts.first}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Cabin Class */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Cabin Class
          </Label>
          <Select value={cabinClass} onValueChange={(v) => setCabinClass(v as CabinClass)}>
            <SelectTrigger className="h-12 border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cabins</SelectItem>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premium_economy">Premium Economy</SelectItem>
              <SelectItem value="business">Business Class</SelectItem>
              <SelectItem value="first">First Class</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              onClick={handleSearch}
              disabled={!selectedAirline}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium md:w-auto md:px-8"
            >
              <Search className="h-5 w-5 mr-2" />
              Find Flights
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Quick Select Popular Airlines */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-sm text-slate-500 mb-3">Quick select:</p>
        <div className="flex flex-wrap gap-2">
          {popularAirlines.slice(0, 8).map((airline) => (
            <Button
              key={airline.code}
              variant="outline"
              size="sm"
              onClick={() => setSelectedAirline(airline)}
              className={cn(
                'transition-colors',
                selectedAirline?.code === airline.code
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'hover:bg-slate-50'
              )}
            >
              {airline.code} - {airline.name.split(' ')[0]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
