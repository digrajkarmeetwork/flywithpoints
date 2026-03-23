import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ plan: 'free', isPremium: false });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single();

    if (subscription) {
      return NextResponse.json({
        plan: 'premium',
        isPremium: true,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      });
    }

    return NextResponse.json({ plan: 'free', isPremium: false });
  } catch {
    return NextResponse.json({ plan: 'free', isPremium: false });
  }
}
