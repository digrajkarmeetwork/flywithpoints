'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plane, Search, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { sweetSpots } from '@/data/sweet-spots';
import { getProgramById } from '@/data/loyalty-programs';
import { cn } from '@/lib/utils';

export default function SweetSpotsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cabinFilter, setCabinFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('value');

  const filteredSpots = useMemo(() => {
    let filtered = [...sweetSpots];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (spot) =>
          spot.title.toLowerCase().includes(query) ||
          spot.description.toLowerCase().includes(query) ||
          spot.originRegion.toLowerCase().includes(query) ||
          spot.destinationRegion.toLowerCase().includes(query)
      );
    }

    // Cabin filter
    if (cabinFilter !== 'all') {
      filtered = filtered.filter((spot) => spot.cabinClass === cabinFilter);
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(
        (spot) =>
          spot.destinationRegion.toLowerCase().includes(regionFilter.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'value':
        filtered.sort((a, b) => b.valueCpp - a.valueCpp);
        break;
      case 'points-low':
        filtered.sort((a, b) => a.pointsRequired - b.pointsRequired);
        break;
      case 'points-high':
        filtered.sort((a, b) => b.pointsRequired - a.pointsRequired);
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, cabinFilter, regionFilter, sortBy]);

  const getValueColor = (cpp: number) => {
    if (cpp >= 15) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (cpp >= 10) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (cpp >= 5) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getValueLabel = (cpp: number) => {
    if (cpp >= 15) return 'Exceptional';
    if (cpp >= 10) return 'Excellent';
    if (cpp >= 5) return 'Good';
    return 'Fair';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Curated by experts</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Sweet Spots</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Discover the highest-value award redemptions across all major
                loyalty programs
              </p>
            </motion.div>
          </div>
        </div>

        {/* Filters */}
        <div className="container mx-auto max-w-6xl px-4 -mt-8">
          <Card className="shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search sweet spots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={cabinFilter} onValueChange={setCabinFilter}>
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder="Cabin Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium_economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="middle east">Middle East</SelectItem>
                    <SelectItem value="oceania">Oceania</SelectItem>
                    <SelectItem value="various">Various</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Best Value</SelectItem>
                    <SelectItem value="points-low">Points: Low to High</SelectItem>
                    <SelectItem value="points-high">Points: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600">
              <span className="font-medium">{filteredSpots.length}</span> sweet spots
              found
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map((spot, index) => {
              const program = getProgramById(spot.programId);

              return (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
                    {/* Image/Header */}
                    <div className="relative h-44 bg-gradient-to-br from-blue-500 to-cyan-400 overflow-hidden">
                      <div className="absolute inset-0 bg-black/10" />
                      <Plane className="absolute inset-0 m-auto h-20 w-20 text-white/20" />

                      {/* Value Badge */}
                      <div
                        className={cn(
                          'absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1',
                          getValueColor(spot.valueCpp)
                        )}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {spot.valueCpp.toFixed(1)} cpp
                      </div>

                      {/* Route */}
                      <div className="absolute bottom-4 left-4">
                        <p className="text-white/80 text-sm">{spot.originRegion}</p>
                        <p className="text-white font-bold text-lg">
                          {spot.destinationRegion}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="capitalize">
                          {spot.cabinClass.replace('_', ' ')}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            getValueColor(spot.valueCpp)
                          )}
                        >
                          {getValueLabel(spot.valueCpp)}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {spot.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {spot.description}
                      </p>

                      {/* Program */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center">
                          <Plane className="h-3.5 w-3.5 text-slate-600" />
                        </div>
                        <span className="text-sm text-slate-700">
                          {program?.name || spot.programId}
                        </span>
                      </div>

                      {/* Points & Value */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-2xl font-bold text-slate-900">
                            {spot.pointsRequired.toLocaleString()}
                          </span>
                          <span className="text-slate-500 ml-1">points</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Typical cash</p>
                          <p className="font-medium text-slate-900">
                            ${spot.typicalCashPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Booking Tips */}
                      {spot.bookingTips && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-medium text-blue-800 mb-1">
                            Booking Tip
                          </p>
                          <p className="text-xs text-blue-700 line-clamp-2">
                            {spot.bookingTips}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredSpots.length === 0 && (
            <Card className="p-12 text-center">
              <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No sweet spots found
              </h3>
              <p className="text-slate-500 mb-4">
                Try adjusting your filters or search query.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setCabinFilter('all');
                  setRegionFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
