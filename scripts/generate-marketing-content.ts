/**
 * FlyWithPoints Marketing Content Generator
 *
 * Generates daily social media content using AI (Google Gemini - free).
 * Run: npx tsx scripts/generate-marketing-content.ts
 *
 * Output: JSON file in scripts/output/ with posts for all platforms.
 *
 * Requires: GOOGLE_GEMINI_API_KEY in .env or environment
 */

import * as fs from 'fs';
import * as path from 'path';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, 'output');

interface MarketingPost {
  platform: string;
  content: string;
  hashtags: string[];
  imagePrompt: string;
  bestTimeToPost: string;
  type: 'tip' | 'deal' | 'comparison' | 'motivation' | 'education';
}

interface DailyContent {
  date: string;
  theme: string;
  posts: MarketingPost[];
}

const CONTENT_THEMES = [
  'Best business class award flights you can book right now',
  'How to turn credit card points into luxury travel',
  'Award flight sweet spot of the day',
  'Transfer bonus alert and strategy',
  'Points vs cash comparison for popular routes',
  'Beginner guide to award travel',
  'Mistake fares and hidden deals',
  'How to fly first class for less than economy',
  'Credit card signup bonus strategy',
  'Top 5 destinations you can reach with points this month',
  'Partner award booking tricks most people miss',
  'How to maximize Chase Ultimate Rewards',
  'Amex Membership Rewards transfer strategy',
  'Capital One miles best redemptions',
  'Weekend getaway award flights under 25K points',
];

const SWEET_SPOTS = [
  { route: 'NYC to Tokyo', program: 'Virgin Atlantic', cabin: 'Business', points: '60,000', value: '$5,000+' },
  { route: 'LAX to London', program: 'Aeroplan', cabin: 'Business', points: '70,000', value: '$4,500+' },
  { route: 'SFO to Singapore', program: 'KrisFlyer', cabin: 'First', points: '95,000', value: '$12,000+' },
  { route: 'Chicago to Paris', program: 'Flying Blue', cabin: 'Business', points: '55,000', value: '$4,000+' },
  { route: 'Miami to Maldives', program: 'Emirates', cabin: 'First', points: '136,000', value: '$15,000+' },
  { route: 'Dallas to Bali', program: 'ANA', cabin: 'Business', points: '75,000', value: '$6,000+' },
  { route: 'Seattle to Tokyo', program: 'Alaska', cabin: 'First', points: '70,000', value: '$8,000+' },
];

async function generateWithGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY not set');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function generateDailyContent(): Promise<DailyContent> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const theme = CONTENT_THEMES[today.getDate() % CONTENT_THEMES.length];
  const sweetSpot = SWEET_SPOTS[today.getDate() % SWEET_SPOTS.length];

  const prompt = `You are a social media manager for FlyWithPoints, a premium AI-powered award flight search engine. Generate marketing content for today.

Theme: ${theme}
Featured Sweet Spot: ${sweetSpot.route} in ${sweetSpot.cabin} class using ${sweetSpot.program} for ${sweetSpot.points} miles (worth ${sweetSpot.value} in cash).

Generate exactly 5 social media posts in valid JSON array format. Each post object must have:
- "platform": one of "instagram", "tiktok", "twitter", "youtube_shorts", "linkedin"
- "content": the post text (platform-appropriate length)
- "hashtags": array of relevant hashtags (no # symbol)
- "imagePrompt": a detailed prompt for generating an eye-catching image/thumbnail
- "bestTimeToPost": suggested time in EST
- "type": one of "tip", "deal", "comparison", "motivation", "education"

Guidelines:
- Instagram: 150-300 words, storytelling, use line breaks, CTA to "link in bio"
- TikTok: 50-100 words script-style, hook in first 3 seconds, trending audio suggestion
- Twitter/X: Under 280 chars, punchy, controversial take or shocking stat
- YouTube Shorts: 60-second script with timestamps, hook-retain-CTA structure
- LinkedIn: Professional tone, 100-200 words, industry insight angle

Include a call-to-action directing to FlyWithPoints.com for all posts.
IMPORTANT: Return ONLY the JSON array, no markdown formatting.`;

  const aiResponse = await generateWithGemini(prompt);

  let posts: MarketingPost[];
  try {
    const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    posts = JSON.parse(cleaned);
  } catch {
    console.error('Failed to parse AI response, using fallback content');
    posts = generateFallbackContent(sweetSpot);
  }

  return {
    date: today.toISOString().split('T')[0],
    theme,
    posts,
  };
}

function generateFallbackContent(sweetSpot: typeof SWEET_SPOTS[0]): MarketingPost[] {
  return [
    {
      platform: 'instagram',
      content: `${sweetSpot.cabin} class from ${sweetSpot.route} for just ${sweetSpot.points} points.\n\nThat's a ${sweetSpot.value} flight.\n\nMost people don't know about this ${sweetSpot.program} sweet spot. Here's how to book it:\n\n1. Transfer points from your credit card to ${sweetSpot.program}\n2. Search on FlyWithPoints.com for availability\n3. Book directly through ${sweetSpot.program}\n\nOur AI finds these deals automatically.\n\nLink in bio to start searching.`,
      hashtags: ['awardtravel', 'pointsandmiles', 'travelrewards', 'flywithpoints', 'businessclass', 'luxurytravel', 'travelhacking', 'frequentflyer'],
      imagePrompt: `Luxurious ${sweetSpot.cabin} class airline seat with window view of clouds at sunset, premium dark moody lighting, cinematic photography style, text overlay showing "${sweetSpot.points} points = ${sweetSpot.value} flight"`,
      bestTimeToPost: '11:00 AM EST',
      type: 'deal',
    },
    {
      platform: 'tiktok',
      content: `HOOK: This ${sweetSpot.value} flight costs ${sweetSpot.points} points.\n\n"Everyone's paying cash for ${sweetSpot.cabin} class. Meanwhile I'm flying ${sweetSpot.route} for free."\n\nShow the sweet spot. Show the booking. Show the seat.\n\nFlyWithPoints dot com. You're welcome.\n\n(Use trending travel audio)`,
      hashtags: ['traveltok', 'pointsandmiles', 'travelhacking', 'luxurytravel', 'flywithpoints', 'awardtravel'],
      imagePrompt: `Split screen: left side shows economy seat, right side shows luxurious ${sweetSpot.cabin} class suite, dramatic lighting, text "Same price in points" overlay`,
      bestTimeToPost: '7:00 PM EST',
      type: 'deal',
    },
    {
      platform: 'twitter',
      content: `${sweetSpot.route} in ${sweetSpot.cabin} class: ${sweetSpot.value} cash or ${sweetSpot.points} ${sweetSpot.program} miles.\n\nIf you're paying cash, you're doing it wrong.\n\nFlyWithPoints.com`,
      hashtags: ['awardtravel', 'pointsandmiles', 'travelhacking'],
      imagePrompt: `Minimalist dark card showing route ${sweetSpot.route} with points cost vs cash cost comparison, blue neon accent, premium fintech style`,
      bestTimeToPost: '12:00 PM EST',
      type: 'comparison',
    },
    {
      platform: 'youtube_shorts',
      content: `[0-3s] "This flight costs ${sweetSpot.value}. I paid $0."\n[3-15s] Show the ${sweetSpot.program} sweet spot: ${sweetSpot.route} in ${sweetSpot.cabin}\n[15-30s] Walk through the transfer process from credit card points\n[30-45s] Show the booking on FlyWithPoints.com\n[45-60s] "Search your own deals at FlyWithPoints.com - AI finds the best redemptions automatically"`,
      hashtags: ['awardtravel', 'travelhacking', 'pointsandmiles', 'luxurytravel', 'shorts'],
      imagePrompt: `Thumbnail: person in ${sweetSpot.cabin} class seat looking amazed, text overlay "FREE ${sweetSpot.cabin.toUpperCase()} CLASS?!", dark premium color scheme with blue accents`,
      bestTimeToPost: '3:00 PM EST',
      type: 'education',
    },
    {
      platform: 'linkedin',
      content: `The arbitrage opportunity most professionals are missing:\n\nCredit card points → airline miles → premium cabin flights at a fraction of the cost.\n\nCase in point: ${sweetSpot.route} in ${sweetSpot.cabin} class. Cash price: ${sweetSpot.value}. Points cost: ${sweetSpot.points} ${sweetSpot.program} miles.\n\nAt FlyWithPoints, we built an AI that identifies these optimization opportunities across 23+ loyalty programs automatically.\n\nThe ROI on understanding your points portfolio can be 10-20x.\n\nWhat's the best award flight you've ever booked?`,
      hashtags: ['businesstravel', 'travelrewards', 'fintech', 'pointsoptimization'],
      imagePrompt: `Professional infographic showing ROI of points optimization, dark premium background, clean data visualization, FlyWithPoints branding`,
      bestTimeToPost: '8:00 AM EST',
      type: 'education',
    },
  ];
}

async function main() {
  console.log('Generating daily marketing content...\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const content = await generateDailyContent();

  const filename = `marketing-${content.date}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(content, null, 2));

  console.log(`Theme: ${content.theme}\n`);
  console.log(`Generated ${content.posts.length} posts:\n`);

  for (const post of content.posts) {
    console.log(`--- ${post.platform.toUpperCase()} (${post.type}) ---`);
    console.log(`Best time: ${post.bestTimeToPost}`);
    console.log(`Content: ${post.content.substring(0, 100)}...`);
    console.log(`Image prompt: ${post.imagePrompt.substring(0, 80)}...`);
    console.log(`Hashtags: ${post.hashtags.map(h => `#${h}`).join(' ')}\n`);
  }

  console.log(`\nFull content saved to: ${filepath}`);
  console.log('\nNext steps:');
  console.log('1. Use the image prompts with an AI image generator (DALL-E, Midjourney, etc.)');
  console.log('2. Post to each platform at the suggested times');
  console.log('3. Or use scripts/post-to-socials.ts to automate posting');
}

main().catch(console.error);
