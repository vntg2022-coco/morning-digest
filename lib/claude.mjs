// Thin wrapper for structured (JSON-schema) Claude calls used by the content pipeline.

import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'

const client = new Anthropic()

export const MODEL = 'claude-opus-5-5'

export async function generateStructured({ schema, system, prompt, effort = 'medium', maxTokens = 32000 }) {
  // Streaming avoids HTTP timeouts on the larger multi-article outputs.
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    // On a safety decline, the API retries on Anthropic's recommended fallback model.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort, format: betaZodOutputFormat(schema) },
    system,
    messages: [{ role: 'user', content: prompt }],
  })
  const response = await stream.finalMessage()

  if (response.stop_reason === 'refusal') {
    throw new Error(`Claude declined the request: ${response.stop_details?.category ?? 'unknown'}`)
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('Claude response was cut off (max_tokens)')
  }
  const text = response.content.find(b => b.type === 'text')?.text
  const parsed = schema.safeParse(text ? JSON.parse(text) : null)
  if (!parsed.success) {
    throw new Error(`Claude response did not match the schema: ${parsed.error.message}`)
  }
  return { data: parsed.data, usage: response.usage }
}
