
'use server';
/**
 * @fileOverview Extracts potential action items from a given conversation.
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
    .describe('A list of concise action items identified from the conversation. Each item should be a clear, actionable statement.'),
});
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;

export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
  return extractActionItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionItemsPrompt',
  input: {schema: ExtractActionItemsInputSchema},
  output: {schema: ExtractActionItemsOutputSchema},
  prompt: `You are an expert in analyzing conversations to identify actionable tasks.
Your goal is to carefully read the following conversation and extract any statements that represent a task, a to-do, a suggestion for future action, or a commitment to perform an action.

Conversation to analyze:
{{{conversation}}}

Guidelines for identifying action items:
- Look for phrases like "We need to...", "Someone should...", "Let's make sure to...", "I will...", "Can we get X done?", "The next step is to...".
- Focus on specific, concrete actions rather than general statements or opinions.
- If an action is assigned or a volunteer is identified, try to include that if it's concise.
- Each action item should be a clear, standalone statement.
- If no clear action items are present, return an empty array for 'actionItems'.

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
