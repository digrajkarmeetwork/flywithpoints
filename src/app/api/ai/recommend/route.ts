import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert travel rewards advisor. Your job is to help users maximize the value of their points and miles.

You have deep knowledge of:
- All major airline loyalty programs (United, American, Delta, Alaska, Southwest, etc.)
- Credit card transfer partners (Chase UR, Amex MR, Citi TYP, Capital One, Bilt)
- Sweet spot redemptions and best-value routes
- Transfer bonuses and promotions
- Points valuations (cents per point)

Always provide specific, actionable recommendations. Include:
- The exact program to book through
- Points required
- Why this is a good value
- Any tips for finding availability`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pointBalances, searchParams, flightResults } = body;

    // Build the prompt
    const prompt = buildPrompt(pointBalances, searchParams, flightResults);

    // Try Google Gemini first (free tier), then OpenAI, then fallback to mock
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let aiResponse: string | null = null;

    if (geminiKey) {
      aiResponse = await callGemini(geminiKey, prompt);
    } else if (openaiKey) {
      aiResponse = await callOpenAI(openaiKey, prompt);
    }

    if (aiResponse) {
      const recommendations = parseAIResponse(aiResponse);
      return NextResponse.json({ recommendations });
    }

    // Return mock recommendations if no API key configured
    return NextResponse.json({
      recommendations: getMockRecommendations(searchParams),
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    // Return mock on error instead of failing
    return NextResponse.json({
      recommendations: getMockRecommendations(null),
    });
  }
}

async function callGemini(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT + '\n\n' + prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini call failed:', error);
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
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI call failed:', error);
    return null;
  }
}

function getMockRecommendations(searchParams: { origin?: string; destination?: string } | null) {
  const dest = searchParams?.destination || 'your destination';
  return [
    {
      title: 'Best Value Transfer',
      description: `For flights to ${dest}, consider transferring Chase Ultimate Rewards or Amex MR to partner airlines for the best redemption value.`,
      savings: 15000,
      reasoning: 'Transfer partners often offer better award rates than booking directly, especially for premium cabins.',
    },
    {
      title: 'Check Partner Airlines',
      description: 'Look for availability on partner airlines through programs like United, Aeroplan, or Virgin Atlantic.',
      reasoning: 'Partner bookings can unlock sweet spot redemptions that save 30-50% compared to standard awards.',
    },
    {
      title: 'Flexibility Pays Off',
      description: 'Being flexible with dates by even 1-2 days can reveal significantly better award availability.',
      reasoning: 'Award seats are limited and vary greatly by date. Mid-week flights often have better availability.',
    },
  ];
}

function buildPrompt(
  pointBalances: { programId: string; programName?: string; balance: number }[],
  searchParams: { origin: string; destination: string; cabinClass: string },
  flightResults: { programId: string; pointsRequired: number; valueCpp: number }[]
): string {
  let prompt = 'Help me find the best way to book this award flight:\n\n';

  if (searchParams) {
    prompt += `Route: ${searchParams.origin} to ${searchParams.destination}\n`;
    prompt += `Cabin Class: ${searchParams.cabinClass}\n\n`;
  }

  if (pointBalances && pointBalances.length > 0) {
    prompt += 'MY CURRENT POINTS BALANCES (use these to give personalized recommendations):\n';
    pointBalances.forEach((b) => {
      const name = b.programName || b.programId;
      prompt += `- ${name}: ${b.balance.toLocaleString()} points\n`;
    });
    prompt += '\n';
  } else {
    prompt += 'User has not added any points balances yet.\n\n';
  }

  if (flightResults && flightResults.length > 0) {
    prompt += 'Available award options found:\n';
    flightResults.slice(0, 5).forEach((f) => {
      prompt += `- ${f.programId}: ${f.pointsRequired.toLocaleString()} points (${f.valueCpp} cpp value)\n`;
    });
    prompt += '\n';
  }

  prompt += `Please provide 2-3 specific recommendations:
1. Based on the user's point balances, which program should they use to book this flight?
2. If they don't have enough points, suggest transfer strategies (e.g., transfer Chase UR to United)
3. Tips for finding award availability on this route

IMPORTANT: If the user has point balances, prioritize recommendations that use their existing points.
Tell them exactly how many points they need and if they have enough.

Format each recommendation with a clear title and actionable description.`;

  return prompt;
}

function parseAIResponse(
  response: string
): { title: string; description: string; reasoning: string }[] {
  // Simple parsing - in production, you might want more sophisticated parsing
  const recommendations: { title: string; description: string; reasoning: string }[] = [];

  // Try to extract recommendations from the response
  const sections = response.split(/\d\.\s+/).filter(Boolean);

  sections.forEach((section) => {
    const lines = section.split('\n').filter(Boolean);
    if (lines.length > 0) {
      const title = lines[0].replace(/^\*\*|\*\*$/g, '').trim();
      const description = lines.slice(1, 3).join(' ').trim();
      const reasoning = lines.slice(3).join(' ').trim() || description;

      recommendations.push({
        title: title.substring(0, 100),
        description: description.substring(0, 300),
        reasoning: reasoning.substring(0, 300),
      });
    }
  });

  // Ensure we have at least some recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'AI Analysis',
      description: response.substring(0, 300),
      reasoning: 'Based on your search parameters and available options.',
    });
  }

  return recommendations.slice(0, 3);
}
