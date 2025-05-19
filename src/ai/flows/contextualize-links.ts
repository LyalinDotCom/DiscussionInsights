
'use server';

/**
 * @fileOverview Extracts external links from the main discussion content of a web page and provides context.
 *
 * - contextualizeLinks - A function that handles the link contextualization process.
 * - ContextualizeLinksInput - The input type for the contextualizeLinks function.
 * - ContextualizeLinksOutput - The return type for the contextualizeLinks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualizeLinksInputSchema = z.object({
  pageContent: z.string().describe('The content of the web page to analyze.'),
  sourceUrl: z.string().describe('The source URL of the web page being analyzed. Used to differentiate external from internal links.'),
});
export type ContextualizeLinksInput = z.infer<typeof ContextualizeLinksInputSchema>;

const ContextualizeLinksOutputSchema = z.array(z.object({
  url: z.string().describe('The external URL extracted from the discussion content.'),
  context: z.string().describe('The context of the URL within the discussion content.'),
})).describe('A list of external URLs with their context from the discussion.');
export type ContextualizeLinksOutput = z.infer<typeof ContextualizeLinksOutputSchema>;

export async function contextualizeLinks(input: ContextualizeLinksInput): Promise<ContextualizeLinksOutput> {
  return contextualizeLinksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualizeLinksPrompt',
  input: {schema: ContextualizeLinksInputSchema},
  output: {schema: ContextualizeLinksOutputSchema},
  prompt: `You are an expert web content analyzer specializing in discussion forums, comment sections, and chat logs.

Your task is to:
1. Identify the main discussion, chat, or comments section within the provided 'pageContent'.
2. From *within this identified discussion area only*, extract all URLs that point to external websites.
   - An external URL is one that does NOT belong to the same domain as the 'sourceUrl' ({{{sourceUrl}}}).
   - Do NOT include internal navigation links (e.g., links to other pages on the same site, like '/profile', '/settings', or full URLs that match the source domain).
   - Do NOT include links from headers, footers, sidebars, or advertisements unless they are explicitly part of a user's message in the discussion.
3. For each extracted external URL, provide a short context explaining its purpose or relevance *as it appears in the discussion*.

The output should be a JSON array of objects, where each object has a "url" and a "context" field. If no relevant external links are found in the discussion area, return an empty array.

Source URL (for determining external links): {{{sourceUrl}}}

Page Content to analyze:
{{{pageContent}}}
`,
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

