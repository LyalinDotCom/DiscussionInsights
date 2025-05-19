// Summarize the discussion of the content of the given URL.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDiscussionInputSchema = z.object({
  url: z.string().describe('URL to summarize discussion from.'),
  content: z.string().describe('Content of the URL'),
});
export type SummarizeDiscussionInput = z.infer<typeof SummarizeDiscussionInputSchema>;

const SummarizeDiscussionOutputSchema = z.object({
  summary: z.string().describe('A summary of the discussion, including the title if available.'),
});
export type SummarizeDiscussionOutput = z.infer<typeof SummarizeDiscussionOutputSchema>;

export async function summarizeDiscussion(input: SummarizeDiscussionInput): Promise<SummarizeDiscussionOutput> {
  return summarizeDiscussionFlow(input);
}

const summarizeDiscussionPrompt = ai.definePrompt({
  name: 'summarizeDiscussionPrompt',
  input: {
    schema: SummarizeDiscussionInputSchema,
  },
  output: {
    schema: SummarizeDiscussionOutputSchema,
  },
  prompt: `Summarize the discussion from the following content, including the title if available:\n\nContent: {{{content}}}`,
});

const summarizeDiscussionFlow = ai.defineFlow(
  {
    name: 'summarizeDiscussionFlow',
    inputSchema: SummarizeDiscussionInputSchema,
    outputSchema: SummarizeDiscussionOutputSchema,
  },
  async input => {
    const {output} = await summarizeDiscussionPrompt(input);
    return output!;
  }
);
