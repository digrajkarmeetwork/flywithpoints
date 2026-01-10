'use client';

import { motion } from 'framer-motion';
import { Plane, Clock, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AwardFlight } from '@/types';
import { getAirportByCode } from '@/data/airports';

interface FlightCardProps {
  flight: AwardFlight;
  index?: number;
}

export function FlightCard({ flight, index = 0 }: FlightCardProps) {
  const originAirport = getAirportByCode(flight.origin);
  const destAirport = getAirportByCode(flight.destination);

  const getValueColor = (cpp: number) => {
    if (cpp >= 2.0) return 'text-emerald-600 bg-emerald-50';
    if (cpp >= 1.5) return 'text-blue-600 bg-blue-50';
    if (cpp >= 1.0) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getValueLabel = (cpp: number) => {
    if (cpp >= 2.0) return 'Excellent Value';
    if (cpp >= 1.5) return 'Good Value';
    if (cpp >= 1.0) return 'Fair Value';
    return 'Low Value';
  };

  const formatCabinClass = (cabin: string) => {
    return cabin
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-slate-200">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Flight Info */}
            <div className="flex-1 p-6">
              {/* Airline and Flight Number */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Plane className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{flight.airline}</p>
                  <p className="text-sm text-slate-500">
                    {flight.flightNumber} • {flight.aircraft || 'Aircraft TBD'}
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {formatCabinClass(flight.cabinClass)}
                </Badge>
              </div>

              {/* Route and Times */}
              <div className="flex items-center gap-4 mb-4">
                {/* Departure */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {flight.departureTime}
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {flight.origin}
                  </p>
                  <p className="text-xs text-slate-500">
                    {originAirport?.city || flight.origin}
                  </p>
                </div>

                {/* Duration and Stops */}
                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    {flight.duration}
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-300" />
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <div className="h-px flex-1 bg-slate-300" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {flight.stops === 0
                      ? 'Nonstop'
                      : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </p>
                </div>

                {/* Arrival */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {flight.arrivalTime}
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {flight.destination}
                  </p>
                  <p className="text-xs text-slate-500">
                    {destAirport?.city || flight.destination}
                  </p>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    flight.seatsAvailable <= 2
                      ? 'bg-red-50 text-red-600'
                      : flight.seatsAvailable <= 4
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-emerald-50 text-emerald-600'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      flight.seatsAvailable <= 2
                        ? 'bg-red-500'
                        : flight.seatsAvailable <= 4
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    )}
                  />
                  {flight.seatsAvailable} seat{flight.seatsAvailable !== 1 ? 's' : ''} available
                </span>
              </div>
            </div>

            {/* Points and Booking */}
            <div className="lg:w-64 bg-slate-50 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200">
              {/* Program */}
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">Book with</p>
                <p className="font-medium text-slate-900">{flight.program.name}</p>
              </div>

              {/* Points */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-slate-900">
                  {flight.pointsRequired.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">
                  points + ${flight.taxesFees.toFixed(0)} taxes
                </p>
              </div>

              {/* Value */}
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-4 w-fit',
                  getValueColor(flight.valueCpp)
                )}
              >
                <Sparkles className="h-4 w-4" />
                {flight.valueCpp.toFixed(1)}cpp • {getValueLabel(flight.valueCpp)}
              </div>

              {/* Book Button */}
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <span>View Details</span>
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
