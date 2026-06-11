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
    <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-chart-2/10 glow-blue">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-3">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {totalResults && shownResults
            ? `Showing ${shownResults} of ${totalResults} results`
            : `Unlock ${feature}`}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description || `Upgrade to Premium to access ${feature.toLowerCase()} and more.`}
        </p>
        <Link href="/pricing">
          <Button className="bg-primary hover:bg-primary/90 glow-blue">
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
    <Link href="/pricing" className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/15 transition-colors">
      <Crown className="h-3 w-3" />
      Premium
    </Link>
  );
}

export function PremiumLock({ feature }: { feature: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Lock className="h-4 w-4" />
      <span>{feature} — </span>
      <Link href="/pricing" className="text-primary hover:underline font-medium">
        Upgrade to unlock
      </Link>
    </div>
  );
}
