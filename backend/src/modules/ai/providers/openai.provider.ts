import OpenAI from 'openai';
import type { TextGenResult } from './anthropic.provider';

const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10, output: 30 },
};

export async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<TextGenResult> {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 4096,
  });

  const text = response.choices[0]?.message?.content ?? '';
  const tokensInput = response.usage?.prompt_tokens ?? 0;
  const tokensOutput = response.usage?.completion_tokens ?? 0;
  const prices = PRICING[model] ?? { input: 2.5, output: 10 };
  const costUsd =
    (tokensInput * prices.input + tokensOutput * prices.output) / 1_000_000;

  return { text, tokensInput, tokensOutput, costUsd };
}

export async function generateImageOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<{ url: string }> {
  const client = new OpenAI({ apiKey });
  const response = await client.images.generate({
    model: model === 'dall-e-3' ? 'dall-e-3' : 'dall-e-2',
    prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'url',
  });
  const url = (response.data as Array<{ url?: string }>)?.[0]?.url;
  if (!url) throw new Error('No image URL returned from OpenAI');
  return { url };
}
