import Anthropic from '@anthropic-ai/sdk';

export interface TextGenResult {
  text: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
}

// Pricing per 1M tokens (USD) — update as needed
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-4-7': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4 },
};

export async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<TextGenResult> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const tokensInput = response.usage.input_tokens;
  const tokensOutput = response.usage.output_tokens;
  const prices = PRICING[model] ?? { input: 3, output: 15 };
  const costUsd =
    (tokensInput * prices.input + tokensOutput * prices.output) / 1_000_000;

  return { text, tokensInput, tokensOutput, costUsd };
}
