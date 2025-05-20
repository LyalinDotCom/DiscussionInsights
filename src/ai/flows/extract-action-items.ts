
'use server';
/**
 * @fileOverview Extracts potential action items and insightful follow-ups from a given conversation, from a product owner's perspective.
 *
 * - extractActionItems - A function that extracts action items from the conversation.
 * - ExtractActionItemsInput - The input type for the extractActionItems function.
 * - ExtractActionItemsOutput - The return type for the extractActionItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractActionItemsInputSchema = z.object({
  conversation: z
    .string()
    .describe('The entire conversation text from which action items need to be extracted.'),
});
export type ExtractActionItemsInput = z.infer<typeof ExtractActionItemsInputSchema>;

const ExtractActionItemsOutputSchema = z.object({
  actionItems: z
    .array(z.string())
    .describe('A list of concise action items and insightful follow-ups identified from the conversation. Each item should be a clear, actionable statement relevant to a product owner or someone who can influence the product/topic discussed.'),
});
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;

export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
  return extractActionItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionItemsPrompt',
  input: {schema: ExtractActionItemsInputSchema},
  output: {schema: ExtractActionItemsOutputSchema},
  prompt: `You are an expert in analyzing discussions and identifying actionable insights, particularly from the perspective of a product owner or someone responsible for the product/service being discussed.
Your goal is to carefully read the following conversation and extract:
1.  Explicitly stated tasks, to-dos, or commitments.
2.  Potential follow-up actions, areas for investigation, or product improvements that a product owner would find valuable after reviewing this discussion. These might be implied by user feedback, suggestions, pain points, or feature requests.

Conversation to analyze:
{{{conversation}}}

Guidelines for identifying action items and follow-ups:
- Look for explicit phrases like "We need to...", "Someone should...", "Let's make sure to...", "I will...", "Can we get X done?", "The next step is to...".
- Beyond explicit tasks, consider questions like:
    - What are users struggling with that we could address?
    - What features are being requested or implied?
    - What are the key pain points highlighted?
    - What opportunities for improvement or further investigation emerge from this discussion?
    - If you were the product owner, what would you want to do or look into after reading this?
- Focus on specific, concrete actions or clear areas for investigation.
- Each item should be a clear, standalone statement.
- If no clear action items or insightful follow-ups are present, return an empty array for 'actionItems'.

Please ensure your output is a JSON object. The JSON object must adhere to the specified output schema.
It should contain an 'actionItems' array of strings.
`,
});

const extractActionItemsFlow = ai.defineFlow(
  {
    name: 'extractActionItemsFlow',
    inputSchema: ExtractActionItemsInputSchema,
    outputSchema: ExtractActionItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
        actionItems: output?.actionItems || [],
    };
  }
);

