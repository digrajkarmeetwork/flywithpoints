import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pointBalances, searchParams, flightResults } = body;

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return mock recommendations if no API key
      return NextResponse.json({
        recommendations: [
          {
            title: 'Best Value Transfer',
            description:
              'Based on your search, consider transferring Chase Ultimate Rewards to Virgin Atlantic for booking ANA flights to Japan at excellent value.',
            savings: 15000,
            reasoning:
              'Virgin Atlantic charges only 120,000 points for ANA First Class round-trip, compared to 250,000+ through United.',
          },
          {
            title: 'Current Transfer Bonus',
            description:
              'Flying Blue is offering 25% bonus on transfers from Amex MR through the end of the month.',
            reasoning:
              'This limited-time promotion increases the value of your Amex points when transferred to Air France/KLM.',
          },
          {
            title: 'Alternative Route',
            description:
              'Consider flying to a nearby airport for significant points savings.',
            reasoning:
              'Award availability is often better at secondary airports, and you may save thousands of points.',
          },
        ],
      });
    }

    // Build the prompt for OpenAI
    const prompt = buildPrompt(pointBalances, searchParams, flightResults);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert travel rewards advisor. Your job is to help users maximize the value of their points and miles.

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
            - Any tips for finding availability`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the AI response into structured recommendations
    const recommendations = parseAIResponse(aiResponse);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('AI recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

function buildPrompt(
  pointBalances: { programId: string; balance: number }[],
  searchParams: { origin: string; destination: string; cabinClass: string },
  flightResults: { programId: string; pointsRequired: number; valueCpp: number }[]
): string {
  let prompt = 'Help me find the best way to book this award flight:\n\n';

  if (searchParams) {
    prompt += `Route: ${searchParams.origin} to ${searchParams.destination}\n`;
    prompt += `Cabin Class: ${searchParams.cabinClass}\n\n`;
  }

  if (pointBalances && pointBalances.length > 0) {
    prompt += 'My current points balances:\n';
    pointBalances.forEach((b) => {
      prompt += `- ${b.programId}: ${b.balance.toLocaleString()} points\n`;
    });
    prompt += '\n';
  }

  if (flightResults && flightResults.length > 0) {
    prompt += 'Available options found:\n';
    flightResults.slice(0, 5).forEach((f) => {
      prompt += `- ${f.programId}: ${f.pointsRequired.toLocaleString()} points (${f.valueCpp} cpp value)\n`;
    });
    prompt += '\n';
  }

  prompt += `Please provide 2-3 specific recommendations on:
1. The best program to book through and why
2. Any transfer strategies to optimize value
3. Tips for finding award availability

Format each recommendation with a title, description, and reasoning.`;

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
