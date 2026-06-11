'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Wallet,
  TrendingUp,
  Bell,
  Search,
  Sparkles,
  CreditCard,
  Plane,
  ArrowRight,
  Edit2,
  Trash2,
  Settings,
  Loader2,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ExploreOpportunitiesSection } from '@/components/explore/explore-opportunities';
import { useUserStore } from '@/stores/user-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { loyaltyPrograms, getProgramById } from '@/data/loyalty-programs';
import { getTopSweetSpots } from '@/data/sweet-spots';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AIRecommendation {
  title: string;
  description: string;
  reasoning?: string;
}

export default function DashboardPage() {
  const { user, pointBalances, setPointBalances, addPointBalance, updatePointBalance, removePointBalance } =
    useUserStore();
  const { isPremium, plan, openPortal, fetchSubscription } = useSubscriptionStore();
  const searchParams = useSearchParams();
  const [isAddingProgram, setIsAddingProgram] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [editingProgram, setEditingProgram] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const supabase = createClient();

  const topSweetSpots = getTopSweetSpots(3);

  // Handle subscription success redirect
  useEffect(() => {
    if (searchParams.get('subscription') === 'success') {
      fetchSubscription();
      toast.success('Welcome to Premium! All features are now unlocked.');
    }
  }, [searchParams, fetchSubscription]);

  // Load point balances from Supabase on mount
  useEffect(() => {
    async function loadPointBalances() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('point_balances')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          const balances = data.map((item) => ({
            id: item.id,
            programId: item.program_id,
            balance: item.balance,
            lastUpdated: item.last_updated,
          }));
          setPointBalances(balances);
        }
      } catch (error) {
        console.error('Error loading point balances:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPointBalances();
  }, [user?.id, supabase, setPointBalances]);

  // Calculate total value
  const totalValue = pointBalances.reduce((total, balance) => {
    const program = getProgramById(balance.programId);
    if (!program) return total;
    return total + (balance.balance * program.baseValueCpp) / 100;
  }, 0);

  // Fetch AI recommendations based on user's point balances
  const fetchAIRecommendations = async () => {
    if (pointBalances.length === 0) {
      setAiRecommendations([]);
      return;
    }

    setIsLoadingAI(true);
    try {
      const userBalances = pointBalances.map((pb) => {
        const program = getProgramById(pb.programId);
        return {
          programId: pb.programId,
          programName: program?.name || pb.programId,
          balance: pb.balance,
        };
      });

      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointBalances: userBalances,
          searchParams: null,
          flightResults: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Fetch AI recommendations when point balances change (premium only)
  useEffect(() => {
    if (isPremium && !isLoading && pointBalances.length > 0) {
      fetchAIRecommendations();
    }
  }, [isPremium, pointBalances.length, isLoading]);

  const handleAddProgram = async () => {
    if (!selectedProgram || !balanceAmount || !user?.id) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('point_balances')
        .insert({
          user_id: user.id,
          program_id: selectedProgram,
          balance: parseInt(balanceAmount),
        })
        .select()
        .single();

      if (error) throw error;

      addPointBalance({
        id: data.id,
        programId: data.program_id,
        balance: data.balance,
        lastUpdated: data.last_updated,
      });

      toast.success('Program added successfully');
      setSelectedProgram('');
      setBalanceAmount('');
      setIsAddingProgram(false);
    } catch (error) {
      console.error('Error adding program:', error);
      toast.error('Failed to add program');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBalance = async (programId: string, newBalance: string) => {
    if (!user?.id) return;

    const balance = pointBalances.find((b) => b.programId === programId);
    if (!balance) return;

    try {
      const { error } = await supabase
        .from('point_balances')
        .update({
          balance: parseInt(newBalance) || 0,
          last_updated: new Date().toISOString(),
        })
        .eq('id', balance.id);

      if (error) throw error;

      updatePointBalance(programId, parseInt(newBalance) || 0);
      toast.success('Balance updated');
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
    }
    setEditingProgram(null);
  };

  const handleRemoveProgram = async (programId: string) => {
    if (!user?.id) return;

    const balance = pointBalances.find((b) => b.programId === programId);
    if (!balance) return;

    try {
      const { error } = await supabase
        .from('point_balances')
        .delete()
        .eq('id', balance.id);

      if (error) throw error;

      removePointBalance(programId);
      toast.success('Program removed');
    } catch (error) {
      console.error('Error removing program:', error);
      toast.error('Failed to remove program');
    }
  };

  const availablePrograms = loyaltyPrograms.filter(
    (p) => !pointBalances.some((b) => b.programId === p.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back{user?.displayName ? `, ${user.displayName}` : ''}
              </p>
            </div>
            <Link href="/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/15">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-2xl font-bold text-foreground">
                      {pointBalances
                        .reduce((sum, b) => sum + b.balance, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-chart-2/15">
                    <TrendingUp className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Value</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-chart-4/15">
                    <CreditCard className="h-6 w-6 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Programs</p>
                    <p className="text-2xl font-bold text-foreground">
                      {pointBalances.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-chart-5/15">
                    <Bell className="h-6 w-6 text-chart-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Explore Opportunities Section */}
          <div className="mb-8">
            <ExploreOpportunitiesSection pointBalances={pointBalances} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Points Wallet */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Points Wallet</CardTitle>
                    <CardDescription>Manage your loyalty program balances</CardDescription>
                  </div>
                  <Dialog open={isAddingProgram} onOpenChange={setIsAddingProgram}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Program
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Program</DialogTitle>
                        <DialogDescription>
                          Select a loyalty program and enter your current balance.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Program</Label>
                          <Select
                            value={selectedProgram}
                            onValueChange={setSelectedProgram}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a program" />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePrograms.map((program) => (
                                <SelectItem key={program.id} value={program.id}>
                                  <div className="flex items-center gap-2">
                                    {program.type === 'credit_card' ? (
                                      <CreditCard className="h-4 w-4" />
                                    ) : (
                                      <Plane className="h-4 w-4" />
                                    )}
                                    {program.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Balance</Label>
                          <Input
                            type="number"
                            placeholder="Enter points balance"
                            value={balanceAmount}
                            onChange={(e) => setBalanceAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingProgram(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddProgram}
                          disabled={!selectedProgram || !balanceAmount || isSaving}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            'Add Program'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : pointBalances.length > 0 ? (
                    <div className="space-y-3">
                      {pointBalances.map((balance) => {
                        const program = getProgramById(balance.programId);
                        if (!program) return null;
                        const value = (balance.balance * program.baseValueCpp) / 100;

                        return (
                          <motion.div
                            key={balance.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 bg-background rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  'p-2 rounded-lg',
                                  program.type === 'credit_card'
                                    ? 'bg-chart-4/15'
                                    : 'bg-primary/15'
                                )}
                              >
                                {program.type === 'credit_card' ? (
                                  <CreditCard className="h-5 w-5 text-chart-4" />
                                ) : (
                                  <Plane className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {program.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {program.baseValueCpp} cpp avg value
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {editingProgram === balance.programId ? (
                                <Input
                                  type="number"
                                  defaultValue={balance.balance}
                                  className="w-32"
                                  autoFocus
                                  onBlur={(e) =>
                                    handleUpdateBalance(balance.programId, e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateBalance(
                                        balance.programId,
                                        (e.target as HTMLInputElement).value
                                      );
                                    }
                                  }}
                                />
                              ) : (
                                <div className="text-right">
                                  <p className="font-bold text-foreground">
                                    {balance.balance.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-chart-2">
                                    ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} value
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingProgram(balance.programId)}
                                >
                                  <Edit2 className="h-4 w-4 text-muted-foreground/70" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveProgram(balance.programId)}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground/70" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Wallet className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No programs added yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Add your loyalty programs to track your points balance.
                      </p>
                      <Button
                        onClick={() => setIsAddingProgram(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Program
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/search">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/15">
                        <Search className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Search Flights</h3>
                        <p className="text-sm text-muted-foreground">
                          Find award availability
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/70 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/sweet-spots">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-chart-2/15">
                        <Sparkles className="h-6 w-6 text-chart-2" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Sweet Spots</h3>
                        <p className="text-sm text-muted-foreground">
                          Best redemption opportunities
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/70 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Subscription Status */}
              <Card className={isPremium ? 'bg-gradient-to-br from-primary/10 to-chart-4/10 border-primary/20' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className={cn('h-5 w-5', isPremium ? 'text-primary' : 'text-muted-foreground/70')} />
                    <div>
                      <p className="font-medium text-foreground">
                        {isPremium ? 'Premium Plan' : 'Free Plan'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isPremium ? 'All features unlocked' : 'Limited search results'}
                      </p>
                    </div>
                  </div>
                  {isPremium ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openPortal()}
                    >
                      Manage Subscription
                    </Button>
                  ) : (
                    <Link href="/pricing">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card className="bg-gradient-to-br from-primary/10 to-chart-2/10 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">AI Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isPremium ? (
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">Get personalized AI-powered portfolio optimization.</p>
                      <Link href="/pricing" className="text-primary hover:underline font-medium text-xs">
                        Upgrade to Premium to unlock
                      </Link>
                    </div>
                  ) : isLoadingAI ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing your portfolio...
                    </div>
                  ) : pointBalances.length > 0 && aiRecommendations.length > 0 ? (
                    <div className="space-y-3">
                      {aiRecommendations.map((rec, index) => (
                        <div key={index} className="border-b border-primary/20 last:border-0 pb-3 last:pb-0">
                          <p className="text-sm font-medium text-foreground">{rec.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : pointBalances.length > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Unable to load recommendations. Try refreshing the page.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add your loyalty programs to get personalized AI recommendations.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Top Sweet Spots */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Sweet Spots</CardTitle>
                  <CardDescription>High-value redemptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topSweetSpots.map((spot) => (
                    <div
                      key={spot.id}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {spot.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs bg-chart-2/10 text-chart-2 border-chart-2/30"
                          >
                            {spot.valueCpp.toFixed(1)} cpp
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {spot.cabinClass}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-foreground/80">
                        {(spot.pointsRequired / 1000).toFixed(0)}k
                      </span>
                    </div>
                  ))}
                  <Link href="/sweet-spots">
                    <Button variant="ghost" className="w-full mt-2">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
