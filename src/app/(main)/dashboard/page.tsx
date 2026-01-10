'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { useUserStore } from '@/stores/user-store';
import { loyaltyPrograms, getProgramById } from '@/data/loyalty-programs';
import { getTopSweetSpots } from '@/data/sweet-spots';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, pointBalances, addPointBalance, updatePointBalance, removePointBalance } =
    useUserStore();
  const [isAddingProgram, setIsAddingProgram] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [editingProgram, setEditingProgram] = useState<string | null>(null);

  const topSweetSpots = getTopSweetSpots(3);

  // Calculate total value
  const totalValue = pointBalances.reduce((total, balance) => {
    const program = getProgramById(balance.programId);
    if (!program) return total;
    return total + (balance.balance * program.baseValueCpp) / 100;
  }, 0);

  const handleAddProgram = () => {
    if (!selectedProgram || !balanceAmount) return;

    addPointBalance({
      id: `${selectedProgram}-${Date.now()}`,
      programId: selectedProgram,
      balance: parseInt(balanceAmount),
      lastUpdated: new Date().toISOString(),
    });

    setSelectedProgram('');
    setBalanceAmount('');
    setIsAddingProgram(false);
  };

  const handleUpdateBalance = (programId: string, newBalance: string) => {
    updatePointBalance(programId, parseInt(newBalance) || 0);
    setEditingProgram(null);
  };

  const availablePrograms = loyaltyPrograms.filter(
    (p) => !pointBalances.some((b) => b.programId === p.id)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500">
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
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Points</p>
                    <p className="text-2xl font-bold text-slate-900">
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
                  <div className="p-3 rounded-lg bg-emerald-100">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Estimated Value</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Programs</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {pointBalances.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <Bell className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Active Alerts</p>
                    <p className="text-2xl font-bold text-slate-900">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      <Button className="bg-blue-600 hover:bg-blue-700">
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
                          disabled={!selectedProgram || !balanceAmount}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Add Program
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {pointBalances.length > 0 ? (
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
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  'p-2 rounded-lg',
                                  program.type === 'credit_card'
                                    ? 'bg-purple-100'
                                    : 'bg-blue-100'
                                )}
                              >
                                {program.type === 'credit_card' ? (
                                  <CreditCard className="h-5 w-5 text-purple-600" />
                                ) : (
                                  <Plane className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {program.name}
                                </p>
                                <p className="text-sm text-slate-500">
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
                                  <p className="font-bold text-slate-900">
                                    {balance.balance.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-emerald-600">
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
                                  <Edit2 className="h-4 w-4 text-slate-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePointBalance(balance.programId)}
                                >
                                  <Trash2 className="h-4 w-4 text-slate-400" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        No programs added yet
                      </h3>
                      <p className="text-slate-500 mb-4">
                        Add your loyalty programs to track your points balance.
                      </p>
                      <Button
                        onClick={() => setIsAddingProgram(true)}
                        className="bg-blue-600 hover:bg-blue-700"
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
                      <div className="p-3 rounded-lg bg-blue-100">
                        <Search className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Search Flights</h3>
                        <p className="text-sm text-slate-500">
                          Find award availability
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/sweet-spots">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-emerald-100">
                        <Sparkles className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Sweet Spots</h3>
                        <p className="text-sm text-slate-500">
                          Best redemption opportunities
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 ml-auto" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Recommendations */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base">AI Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pointBalances.length > 0 ? (
                    <>
                      <p className="text-sm text-slate-600">
                        Based on your points portfolio, here are some recommended actions:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                          <span className="text-slate-700">
                            Transfer Chase UR to Hyatt for 2x value on hotel stays
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                          <span className="text-slate-700">
                            Current 30% bonus on transfers to Flying Blue
                          </span>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">
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
                      className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {spot.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {spot.valueCpp.toFixed(1)} cpp
                          </Badge>
                          <span className="text-xs text-slate-500 capitalize">
                            {spot.cabinClass}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-700">
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
