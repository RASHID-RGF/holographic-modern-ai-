import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { UploadedFile } from '@/types';

function buildPrompt(content: string, files: Array<{ name: string; type: string }>) {
  const fileContext = files.length
    ? `\nAttached files:\n${files.map(file => `- ${file.name} (${file.type})`).join('\n')}`
    : '';

  return `User request: ${content}${fileContext}`;
}

const NO_API_KEY_MESSAGE = `Nova API key not configured

To use Nova with your API key:
1. Create a .env.local file in the project root
2. Add your key: NOVA_API_KEY=your-key-here
3. (Optional) Set a model: NOVA_MODEL=your-model
4. Restart the dev server

Once configured, responses will be powered by your configured AI provider.`;

const SYSTEM_PROMPT = `You are Nova, a polished and highly capable AI assistant for a futuristic workspace dashboard.

RESPONSE FORMAT - YOU MUST FOLLOW THIS EXACTLY:
- Structure your answers in clear, organized sections with category labels.
- Use short category labels ending with a colon as section headers (like "Design:" or "Features:").
- Under each section, use bullet points starting with "- " for each key point.
- When listing steps or rankings, use numbered items like "1." or "2.".
- Keep individual points concise and scannable.
- Use natural, flowing prose only for introductions or summaries.

GUIDELINES:
- Give complete, detailed answers that fully address the user's question.
- NEVER use asterisks (*) or star characters for formatting like bold, italic, or headers.
- NEVER use markdown formatting of any kind (no **bold**, no *italic*, no # headers).
- When analyzing screenshots, describe the visible UI elements, layout, colors, content, and details.
- Be thorough but organized with clear categories and points.`;

export async function POST(request: Request) {
  let content = '';
  let files: UploadedFile[] = [];
  let screenshotBase64 = '';

  try {
    const body = await request.json();
    content = body.content || '';
    files = (body.files || []) as UploadedFile[];
    screenshotBase64 = body.screenshotBase64 || '';
  } catch {
    // Body parsing failed, use defaults
  }

  const apiKey = process.env.NOVA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ content: NO_API_KEY_MESSAGE });
  }

  const model = process.env.NOVA_MODEL || 'nova-2-lite-v1';

  try {
    const openai = new OpenAI({
      baseURL: 'https://api.nova.amazon.com/v1',
      apiKey,
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];

    if (screenshotBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: content || 'Analyze this screenshot in detail. Describe what you see including UI elements, layout, colors, text content, and overall design. Be specific and thorough.',
          },
          {
            type: 'image_url',
            image_url: {
              url: screenshotBase64.startsWith('data:') ? screenshotBase64 : `data:image/png;base64,${screenshotBase64}`,
              detail: 'high',
            },
          },
        ],
      });
    } else {
      messages.push({
        role: 'user',
        content: buildPrompt(content, files),
      });
    }

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.7,
      max_tokens: 2048,
      messages,
    });

    const message = completion.choices?.[0]?.message?.content;

    if (typeof message === 'string' && message.trim()) {
      return NextResponse.json({ content: message.trim() });
    }

    throw new Error('No usable response from provider');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      content: `Nova API Error — Failed to get a response from the AI provider.

Error: ${errorMessage}

Please check your NOVA_API_KEY and NOVA_MODEL in .env.local and ensure they are correct.`,
    });
  }
}
