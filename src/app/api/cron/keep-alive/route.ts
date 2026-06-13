import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Keep-alive cron: runs daily to issue a trivial query against the database so
 * the free-tier Supabase project never hits the ~7-day inactivity auto-pause.
 * Reads a public table (loyalty_programs) with the anon key.
 */
export async function GET(request: NextRequest) {
  // Vercel Cron sends this header; reject anything else.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json(
      { ok: false, error: 'Supabase env vars not set' },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(url, anonKey);
    const { error } = await supabase
      .from('loyalty_programs')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
