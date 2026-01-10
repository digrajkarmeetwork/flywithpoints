import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert travel rewards advisor helping users understand what they can do with their points and miles.

You have deep knowledge of:
- All major airline loyalty programs and their sweet spots
- Credit card transfer partners (Chase UR, Amex MR, Citi TYP, Capital One, Bilt)
- Best value redemptions for different regions
- Points valuations and when to save vs spend

Your goal is to give personalized, actionable advice based on the user's specific point balances and travel goals.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pointBalances, destination, opportunities } = body;

    const prompt = buildExplorePrompt(pointBalances, destination, opportunities);

    // Try Google Gemini first (free tier), then OpenAI
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let aiResponse: string | null = null;

    if (geminiKey) {
      aiResponse = await callGemini(geminiKey, prompt);
    } else if (openaiKey) {
      aiResponse = await callOpenAI(openaiKey, prompt);
    }

    if (aiResponse) {
      return NextResponse.json({
        summary: aiResponse,
        recommendations: parseExploreResponse(aiResponse),
      });
    }

    // Return mock response if no API key
    return NextResponse.json({
      summary: getMockSummary(pointBalances, destination, opportunities),
      recommendations: getMockRecommendations(destination),
    });
  } catch (error) {
    console.error('AI explore error:', error);
    return NextResponse.json({
      summary: 'Unable to generate AI recommendations at this time.',
      recommendations: [],
    });
  }
}

async function callGemini(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

function buildExplorePrompt(
  pointBalances: { programId: string; programName: string; balance: number }[],
  destination: string | null,
  opportunities: { title: string; pointsRequired: number; canAfford: boolean; valueCpp: number }[]
): string {
  let prompt = 'Analyze this user\'s points portfolio and help them understand their options:\n\n';

  prompt += 'USER\'S POINTS BALANCES:\n';
  pointBalances.forEach((b) => {
    prompt += `- ${b.programName}: ${b.balance.toLocaleString()} points\n`;
  });
  prompt += '\n';

  if (destination) {
    prompt += `DESIRED DESTINATION: ${destination}\n\n`;
  }

  if (opportunities && opportunities.length > 0) {
    prompt += 'AVAILABLE REDEMPTION OPTIONS:\n';
    opportunities.slice(0, 5).forEach((o) => {
      prompt += `- ${o.title}: ${o.pointsRequired.toLocaleString()} points (${o.valueCpp} cpp) - ${o.canAfford ? 'CAN AFFORD' : 'needs more points'}\n`;
    });
    prompt += '\n';
  }

  prompt += `Please provide:
1. A brief summary (2-3 sentences) of what the user can do with their points${destination ? ` to get to ${destination}` : ''}
2. Their best option if they can afford something now
3. If they can't afford their goal, how many more points they need and how to get them

Keep the response concise and actionable. Focus on their specific situation.`;

  return prompt;
}

function parseExploreResponse(response: string): { title: string; description: string }[] {
  const recommendations: { title: string; description: string }[] = [];
  const lines = response.split('\n').filter(Boolean);

  let currentTitle = '';
  let currentDescription = '';

  lines.forEach((line) => {
    // Check if this is a numbered item or bullet
    if (/^\d+\.|^[-•]/.test(line.trim())) {
      if (currentTitle) {
        recommendations.push({ title: currentTitle, description: currentDescription.trim() });
      }
      const cleanedLine = line.replace(/^\d+\.|^[-•]\s*/, '').trim();
      const parts = cleanedLine.split(':');
      if (parts.length > 1) {
        currentTitle = parts[0].replace(/\*\*/g, '').trim();
        currentDescription = parts.slice(1).join(':').trim();
      } else {
        currentTitle = cleanedLine.substring(0, 50);
        currentDescription = cleanedLine;
      }
    } else if (currentTitle) {
      currentDescription += ' ' + line.trim();
    }
  });

  if (currentTitle) {
    recommendations.push({ title: currentTitle, description: currentDescription.trim() });
  }

  return recommendations.slice(0, 3);
}

function getMockSummary(
  pointBalances: { programName: string; balance: number }[],
  destination: string | null,
  opportunities: { canAfford: boolean }[]
): string {
  const totalPoints = pointBalances.reduce((sum, b) => sum + b.balance, 0);
  const affordableCount = opportunities?.filter((o) => o.canAfford).length || 0;

  if (affordableCount > 0) {
    return `Great news! With your ${totalPoints.toLocaleString()} total points, you have ${affordableCount} award flights you can book${destination ? ` to ${destination}` : ''} right now. Check the opportunities below to see your best options sorted by value.`;
  }

  return `You have ${totalPoints.toLocaleString()} points across your programs. ${destination ? `While you may not have enough for premium ${destination} flights yet, ` : ''}consider building your balances through credit card bonuses or look for economy sweet spots that require fewer points.`;
}

function getMockRecommendations(destination: string | null): { title: string; description: string }[] {
  if (destination?.toLowerCase().includes('japan') || destination?.toLowerCase().includes('asia')) {
    return [
      {
        title: 'Best Option for Japan',
        description: 'Transfer Chase UR or Amex MR to Virgin Atlantic and book ANA business/first class. This is one of the best value redemptions to Japan.',
      },
      {
        title: 'Alternative Route',
        description: 'Consider Alaska Mileage Plan for Cathay Pacific or Japan Airlines business class at excellent rates.',
      },
    ];
  }

  if (destination?.toLowerCase().includes('europe')) {
    return [
      {
        title: 'Best Option for Europe',
        description: 'Flying Blue Promo Rewards offers 25-50% off monthly to select destinations. Aeroplan is also great for Star Alliance partners.',
      },
      {
        title: 'Premium Cabin Tip',
        description: 'For business class, look at Lufthansa First via Aeroplan or Turkish via United for excellent value.',
      },
    ];
  }

  return [
    {
      title: 'Maximize Your Points',
      description: 'Transfer credit card points to airline partners for 30-50% more value than portal bookings. Business class awards offer the best cents-per-point value.',
    },
    {
      title: 'Build Your Balance',
      description: 'Focus on signup bonuses and category spending to grow your points. Chase and Amex cards offer the most flexible transfer options.',
    },
  ];
}
