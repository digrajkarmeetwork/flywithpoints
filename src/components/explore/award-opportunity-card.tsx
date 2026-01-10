'use client';

import { motion } from 'framer-motion';
import { Plane, ArrowRight, Check, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AwardOpportunity } from '@/types';
import { cn } from '@/lib/utils';

interface AwardOpportunityCardProps {
  opportunity: AwardOpportunity;
  index?: number;
}

export function AwardOpportunityCard({ opportunity, index = 0 }: AwardOpportunityCardProps) {
  const { sweetSpot, program, userBalance, pointsRequired, canAfford, pointsShortfall, percentageOwned, transferSource, estimatedValue } = opportunity;

  // Determine card accent color based on affordability
  const getAccentColor = () => {
    if (canAfford) return 'border-l-emerald-500 bg-emerald-50/30';
    if (percentageOwned >= 75) return 'border-l-amber-500 bg-amber-50/30';
    return 'border-l-slate-300 bg-slate-50/30';
  };

  // Get value badge color
  const getValueBadgeColor = () => {
    if (sweetSpot.valueCpp >= 15) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (sweetSpot.valueCpp >= 10) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (sweetSpot.valueCpp >= 5) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatCabinClass = (cabin: string) => {
    return cabin.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={cn('border-l-4 overflow-hidden transition-shadow hover:shadow-md', getAccentColor())}>
        <CardContent className="p-4">
          {/* Header with route and value */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-blue-100">
                <Plane className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                  <span>{sweetSpot.originRegion}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span>{sweetSpot.destinationRegion}</span>
                </div>
                <p className="text-xs text-slate-500">{formatCabinClass(sweetSpot.cabinClass)}</p>
              </div>
            </div>
            <Badge variant="outline" className={cn('text-xs', getValueBadgeColor())}>
              {sweetSpot.valueCpp.toFixed(1)} cpp
            </Badge>
          </div>

          {/* Title and description */}
          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{sweetSpot.title}</h3>
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{sweetSpot.description}</p>

          {/* Program and transfer info */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-500">via</span>
            <span className="text-xs font-medium text-slate-700">{program.name}</span>
            {transferSource && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <RefreshCw className="h-3 w-3" />
                <span>from {transferSource.programName}</span>
              </div>
            )}
          </div>

          {/* Points progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Your points</span>
              <span className="font-medium">
                {userBalance.toLocaleString()} / {pointsRequired.toLocaleString()}
              </span>
            </div>
            <Progress value={percentageOwned} className="h-2" />

            {/* Status indicator */}
            <div className="flex items-center justify-between">
              {canAfford ? (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">You can book this!</span>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Need <span className="font-medium text-slate-700">{pointsShortfall.toLocaleString()}</span> more points
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp className="h-3 w-3" />
                <span>${estimatedValue.toLocaleString()} value</span>
              </div>
            </div>
          </div>

          {/* Booking tips teaser */}
          {sweetSpot.bookingTips && canAfford && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 line-clamp-2">
                <span className="font-medium">Tip:</span> {sweetSpot.bookingTips}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
