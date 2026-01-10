'use client';

import { motion } from 'framer-motion';
import { Plane, MapPin, DollarSign, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PositioningOption } from '@/types';
import { cn } from '@/lib/utils';

interface PositioningCardProps {
  option: PositioningOption;
  homeAirport?: string;
  index?: number;
}

export function PositioningCard({ option, homeAirport, index = 0 }: PositioningCardProps) {
  const { alternateOrigin, alternateOriginCity, awardOpportunity, estimatedPositioningCost, totalValue, reasoning } = option;

  // Build Google Flights search URL for positioning flight
  const getGoogleFlightsUrl = () => {
    const today = new Date();
    const searchDate = new Date(today.setMonth(today.getMonth() + 2));
    const dateStr = searchDate.toISOString().split('T')[0];

    return `https://www.google.com/travel/flights?q=flights%20from%20${homeAirport}%20to%20${alternateOrigin}%20on%20${dateStr}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border-l-4 border-l-blue-400 bg-blue-50/30 overflow-hidden">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-blue-100">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Fly from {alternateOriginCity} instead
                </p>
                <p className="text-xs text-slate-500">
                  Better availability from {alternateOrigin}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
              ~${estimatedPositioningCost} positioning
            </Badge>
          </div>

          {/* Journey breakdown */}
          <div className="bg-white rounded-lg p-3 mb-3 border border-slate-100">
            <div className="flex items-center gap-3 text-sm">
              {/* Step 1: Positioning flight */}
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                  1
                </div>
                <span className="text-slate-600">{homeAirport || 'Home'}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="font-medium text-slate-900">{alternateOrigin}</span>
              </div>

              <div className="flex items-center gap-1 text-emerald-600">
                <DollarSign className="h-3 w-3" />
                <span className="text-xs">${estimatedPositioningCost}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm mt-2">
              {/* Step 2: Award flight */}
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                  2
                </div>
                <span className="text-slate-600">{alternateOrigin}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="font-medium text-slate-900">{awardOpportunity.sweetSpot.destinationRegion}</span>
              </div>

              <div className="flex items-center gap-1 text-blue-600">
                <Plane className="h-3 w-3" />
                <span className="text-xs">{awardOpportunity.pointsRequired.toLocaleString()} pts</span>
              </div>
            </div>
          </div>

          {/* Value summary */}
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-slate-600">Net value after positioning:</span>
            <span className="font-semibold text-emerald-600">
              ${totalValue.toLocaleString()}
            </span>
          </div>

          {/* Reasoning */}
          <p className="text-xs text-slate-500 mb-3 line-clamp-2">
            {reasoning}
          </p>

          {/* CTA */}
          {homeAirport && (
            <a
              href={getGoogleFlightsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline" size="sm" className="gap-2">
                Search positioning flights
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
