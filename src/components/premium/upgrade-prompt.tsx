'use client';

import Link from 'next/link';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  totalResults?: number;
  shownResults?: number;
}

export function UpgradePrompt({ feature, description, totalResults, shownResults }: UpgradePromptProps) {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Crown className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {totalResults && shownResults
            ? `Showing ${shownResults} of ${totalResults} results`
            : `Unlock ${feature}`}
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          {description || `Upgrade to Premium to access ${feature.toLowerCase()} and more.`}
        </p>
        <Link href="/pricing">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium — $9.99/mo
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function PremiumBadge() {
  return (
    <Link href="/pricing" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
      <Crown className="h-3 w-3" />
      Premium
    </Link>
  );
}

export function PremiumLock({ feature }: { feature: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Lock className="h-4 w-4" />
      <span>{feature} — </span>
      <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
        Upgrade to unlock
      </Link>
    </div>
  );
}
