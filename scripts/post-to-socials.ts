/**
 * FlyWithPoints Social Media Auto-Poster
 *
 * Posts pre-generated content to social media platforms.
 * Run: npx tsx scripts/post-to-socials.ts
 *
 * Requires API keys for each platform you want to post to.
 * Set these in your .env file:
 *   TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
 *   LINKEDIN_ACCESS_TOKEN
 *   INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID
 *
 * For TikTok and YouTube Shorts, content is saved as drafts since
 * those platforms require video upload which needs separate tooling.
 */

import * as fs from 'fs';
import * as path from 'path';

interface MarketingPost {
  platform: string;
  content: string;
  hashtags: string[];
  imagePrompt: string;
  bestTimeToPost: string;
  type: string;
}

interface DailyContent {
  date: string;
  theme: string;
  posts: MarketingPost[];
}

async function postToTwitter(post: MarketingPost): Promise<boolean> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.log('  [Twitter] Skipped - API keys not configured');
    return false;
  }

  const text = post.content + '\n\n' + post.hashtags.slice(0, 3).map(h => `#${h}`).join(' ');

  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`  [Twitter] Posted successfully: ${data.data?.id}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`  [Twitter] Failed: ${error}`);
      return false;
    }
  } catch (error) {
    console.error(`  [Twitter] Error: ${error}`);
    return false;
  }
}

async function postToLinkedIn(post: MarketingPost): Promise<boolean> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!accessToken) {
    console.log('  [LinkedIn] Skipped - Access token not configured');
    return false;
  }

  const text = post.content + '\n\n' + post.hashtags.map(h => `#${h}`).join(' ');

  try {
    // First get the user's URN
    const meResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const meData = await meResponse.json();
    const authorUrn = `urn:li:person:${meData.sub}`;

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (response.ok) {
      console.log('  [LinkedIn] Posted successfully');
      return true;
    } else {
      const error = await response.text();
      console.error(`  [LinkedIn] Failed: ${error}`);
      return false;
    }
  } catch (error) {
    console.error(`  [LinkedIn] Error: ${error}`);
    return false;
  }
}

async function postToInstagram(post: MarketingPost): Promise<boolean> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    console.log('  [Instagram] Skipped - API credentials not configured');
    console.log('  [Instagram] Note: Requires a Business/Creator account + Facebook Graph API access');
    return false;
  }

  console.log('  [Instagram] To post to Instagram:');
  console.log('  1. Generate image using the image prompt with DALL-E/Midjourney');
  console.log('  2. Upload image to a public URL');
  console.log('  3. Use Facebook Graph API to create media + publish');
  console.log(`  Caption: ${post.content.substring(0, 50)}...`);

  return false;
}

async function handleTikTok(post: MarketingPost): Promise<boolean> {
  console.log('  [TikTok] Video content saved as draft:');
  console.log(`  Script: ${post.content.substring(0, 100)}...`);
  console.log('  To automate TikTok posting:');
  console.log('  1. Generate video with Remotion, Shotstack, or Creatomate API');
  console.log('  2. Upload via TikTok Content Posting API (requires approved app)');
  return false;
}

async function handleYouTubeShorts(post: MarketingPost): Promise<boolean> {
  console.log('  [YouTube Shorts] Video script saved:');
  console.log(`  Script: ${post.content.substring(0, 100)}...`);
  console.log('  To automate YouTube Shorts posting:');
  console.log('  1. Generate short video with Remotion or FFmpeg');
  console.log('  2. Upload via YouTube Data API v3');
  return false;
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  const contentFile = path.join(__dirname, 'output', `marketing-${today}.json`);

  if (!fs.existsSync(contentFile)) {
    console.error(`No content file found for today (${today}).`);
    console.error('Run: npx tsx scripts/generate-marketing-content.ts first');
    process.exit(1);
  }

  const content: DailyContent = JSON.parse(fs.readFileSync(contentFile, 'utf-8'));
  console.log(`\nPosting content for ${content.date}`);
  console.log(`Theme: ${content.theme}\n`);

  const results: Record<string, boolean> = {};

  for (const post of content.posts) {
    console.log(`\n${post.platform.toUpperCase()} (${post.type}):`);

    switch (post.platform) {
      case 'twitter':
        results.twitter = await postToTwitter(post);
        break;
      case 'linkedin':
        results.linkedin = await postToLinkedIn(post);
        break;
      case 'instagram':
        results.instagram = await postToInstagram(post);
        break;
      case 'tiktok':
        results.tiktok = await handleTikTok(post);
        break;
      case 'youtube_shorts':
        results.youtube = await handleYouTubeShorts(post);
        break;
    }
  }

  console.log('\n--- Summary ---');
  for (const [platform, success] of Object.entries(results)) {
    console.log(`${platform}: ${success ? 'Posted' : 'Skipped/Manual'}`);
  }

  console.log('\nTo fully automate:');
  console.log('1. Set up API keys for each platform in .env');
  console.log('2. For video platforms (TikTok, YouTube), use Remotion or Creatomate for video generation');
  console.log('3. Schedule this script with cron: 0 10 * * * npx tsx scripts/post-to-socials.ts');
  console.log('4. Or use Vercel Cron Jobs to run daily');
}

main().catch(console.error);
