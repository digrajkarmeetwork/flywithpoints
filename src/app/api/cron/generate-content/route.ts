import { NextRequest, NextResponse } from 'next/server';

const SWEET_SPOTS = [
  { route: 'NYC to Tokyo', program: 'Virgin Atlantic', cabin: 'Business', points: '60,000', value: '$5,000+' },
  { route: 'LAX to London', program: 'Aeroplan', cabin: 'Business', points: '70,000', value: '$4,500+' },
  { route: 'SFO to Singapore', program: 'KrisFlyer', cabin: 'First', points: '95,000', value: '$12,000+' },
  { route: 'Chicago to Paris', program: 'Flying Blue', cabin: 'Business', points: '55,000', value: '$4,000+' },
  { route: 'Miami to Maldives', program: 'Emirates', cabin: 'First', points: '136,000', value: '$15,000+' },
  { route: 'Dallas to Bali', program: 'ANA', cabin: 'Business', points: '75,000', value: '$6,000+' },
  { route: 'Seattle to Tokyo', program: 'Alaska', cabin: 'First', points: '70,000', value: '$8,000+' },
];

export async function GET(request: NextRequest) {
  // Verify cron secret for Vercel Cron Jobs
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const sweetSpot = SWEET_SPOTS[today.getDate() % SWEET_SPOTS.length];

  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'GOOGLE_GEMINI_API_KEY not set' }, { status: 500 });
  }

  const prompt = `Generate 5 social media posts for FlyWithPoints (AI-powered award flight search).
Featured deal: ${sweetSpot.route} in ${sweetSpot.cabin} class via ${sweetSpot.program} for ${sweetSpot.points} miles (worth ${sweetSpot.value}).

Return JSON array with objects having: platform (instagram/tiktok/twitter/youtube_shorts/linkedin), content, hashtags (array, no #), imagePrompt, type (tip/deal/comparison/motivation/education).
Keep platform-appropriate lengths. Include CTA to FlyWithPoints.com. Return ONLY valid JSON.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 2000 },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const posts = JSON.parse(cleaned);

    return NextResponse.json({
      date: today.toISOString().split('T')[0],
      sweetSpot,
      posts,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate content',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
