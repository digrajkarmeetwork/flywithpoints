'use client';

import { motion } from 'framer-motion';
import { Plane, Clock, ArrowRight, Sparkles, ExternalLink, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AwardFlight } from '@/types';
import { getAirportByCode } from '@/data/airports';
import { useState } from 'react';

interface FlightCardProps {
  flight: AwardFlight;
  index?: number;
}

export function FlightCard({ flight, index = 0 }: FlightCardProps) {
  const [showSegments, setShowSegments] = useState(false);
  const [showBookingLinks, setShowBookingLinks] = useState(false);

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

  // Format date nicely
  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Check if we have specific flight times
  const hasSpecificTimes = flight.departureTime && flight.arrivalTime && flight.departureTime.length > 0;
  const isLiveData = flight.isLiveData || flight.source === 'seats.aero';
  const hasSegments = flight.segments && flight.segments.length > 1;
  const hasMultipleBookingLinks = flight.bookingLinks && flight.bookingLinks.length > 1;

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
              {/* Airline and Flight Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Plane className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{flight.airline}</p>
                  <p className="text-sm text-slate-500">
                    {flight.flightNumber ? `${flight.flightNumber}` : ''}
                    {flight.flightNumber && flight.aircraft ? ' • ' : ''}
                    {flight.aircraft || ''}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {flight.isLiveData ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                      ✓ Live Data
                    </Badge>
                  ) : isLiveData ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      Live
                    </Badge>
                  ) : null}
                  <Badge variant="outline">
                    {formatCabinClass(flight.cabinClass)}
                  </Badge>
                </div>
              </div>

              {/* Route Display */}
              <div className="flex items-center gap-4 mb-4">
                {/* Origin */}
                <div className="text-center min-w-[80px]">
                  {hasSpecificTimes ? (
                    <p className="text-2xl font-bold text-slate-900">
                      {flight.departureTime}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">
                      {flight.origin}
                    </p>
                  )}
                  <p className="text-sm font-medium text-slate-700">
                    {hasSpecificTimes ? flight.origin : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    {originAirport?.city || ''}
                  </p>
                </div>

                {/* Route Line */}
                <div className="flex-1 flex flex-col items-center px-4">
                  {/* Duration or Date */}
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    {flight.duration ? (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        {flight.duration}
                      </>
                    ) : flight.departureDate ? (
                      <>
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(flight.departureDate)}
                      </>
                    ) : null}
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-300" />
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <div className="h-px flex-1 bg-slate-300" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {flight.stops === 0
                      ? 'Nonstop'
                      : flight.stops === 1
                      ? '1 stop'
                      : `${flight.stops}+ stops`}
                  </p>
                </div>

                {/* Destination */}
                <div className="text-center min-w-[80px]">
                  {hasSpecificTimes ? (
                    <p className="text-2xl font-bold text-slate-900">
                      {flight.arrivalTime}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">
                      {flight.destination}
                    </p>
                  )}
                  <p className="text-sm font-medium text-slate-700">
                    {hasSpecificTimes ? flight.destination : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    {destAirport?.city || ''}
                  </p>
                </div>
              </div>

              {/* Availability and Flight Number */}
              <div className="flex items-center gap-2 flex-wrap">
                {flight.seatsAvailable > 0 && (
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
                )}
                {hasSegments && (
                  <button
                    onClick={() => setShowSegments(!showSegments)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    {flight.segments!.length} segments
                    {showSegments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                )}
              </div>

              {/* Expandable Segments */}
              {hasSegments && showSegments && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                  {flight.segments!.map((segment, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400 w-4">{idx + 1}.</span>
                      <span className="font-medium text-slate-700">{segment.flightNumber}</span>
                      <span className="text-slate-500">
                        {segment.origin} → {segment.destination}
                      </span>
                      {segment.departureTime && segment.arrivalTime && (
                        <span className="text-slate-400 text-xs">
                          {segment.departureTime} - {segment.arrivalTime}
                        </span>
                      )}
                      {segment.aircraft && (
                        <span className="text-slate-400 text-xs">({segment.aircraft})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

              {/* Book Button(s) */}
              {flight.bookingUrl ? (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open(flight.bookingUrl, '_blank')}
                  >
                    <span>Book Now</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  {hasMultipleBookingLinks && (
                    <button
                      onClick={() => setShowBookingLinks(!showBookingLinks)}
                      className="w-full text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
                    >
                      {showBookingLinks ? 'Hide' : 'Show'} alternative booking options
                      {showBookingLinks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  )}
                  {showBookingLinks && hasMultipleBookingLinks && (
                    <div className="space-y-1 pt-1">
                      {flight.bookingLinks!
                        .filter(link => !link.isPrimary)
                        .map((link, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            {link.label}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="group relative">
                    <Button
                      className="w-full bg-slate-300 hover:bg-slate-400 text-slate-600"
                      disabled={false}
                      onClick={() => {
                        if (flight.program.awardBookingUrl) {
                          window.open(flight.program.awardBookingUrl, '_blank');
                        }
                      }}
                    >
                      <span>Search on {flight.program.name.split(' ')[0]}</span>
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-0 right-0 mb-2 hidden group-hover:block z-10">
                      <div className="bg-slate-800 text-white text-xs rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-1">Direct booking coming soon!</p>
                        <p className="text-slate-300">For now, search for this award flight directly on the airline's website.</p>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-slate-800 rotate-45" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
