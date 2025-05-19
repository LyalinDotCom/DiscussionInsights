'use server';

/**
 * @fileOverview Extracts links from the discussion and provides context about each link where possible.
 *
 * - contextualizeLinks - A function that handles the link contextualization process.
 * - ContextualizeLinksInput - The input type for the contextualizeLinks function.
 * - ContextualizeLinksOutput - The return type for the contextualizeLinks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualizeLinksInputSchema = z.object({
  pageContent: z.string().describe('The content of the web page to analyze.'),
});
export type ContextualizeLinksInput = z.infer<typeof ContextualizeLinksInputSchema>;

const ContextualizeLinksOutputSchema = z.array(z.object({
  url: z.string().url().describe('The URL extracted from the page.'),
  context: z.string().describe('The context of the URL within the page content.'),
})).describe('A list of URLs with their context.');
export type ContextualizeLinksOutput = z.infer<typeof ContextualizeLinksOutputSchema>;

export async function contextualizeLinks(input: ContextualizeLinksInput): Promise<ContextualizeLinksOutput> {
  return contextualizeLinksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualizeLinksPrompt',
  input: {schema: ContextualizeLinksInputSchema},
  output: {schema: ContextualizeLinksOutputSchema},
  prompt: `You are an expert web content analyzer.

  Given the content of a web page, extract all URLs and provide a short context for each URL explaining its purpose or relevance within the content.

  The output should be a JSON array of objects, where each object has a "url" and a "context" field.

  Page Content:
  {{pageContent}}`,
});

const contextualizeLinksFlow = ai.defineFlow(
  {
    name: 'contextualizeLinksFlow',
    inputSchema: ContextualizeLinksInputSchema,
    outputSchema: ContextualizeLinksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
