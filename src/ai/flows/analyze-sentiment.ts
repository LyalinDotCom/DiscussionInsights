'use server';

/**
 * @fileOverview Sentiment analysis flow for analyzing the overall sentiment of a conversation.
 *
 * - analyzeSentiment - A function that performs sentiment analysis on a given text.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInputSchema = z.object({
  text: z.string().describe('The text to analyze for sentiment.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

const AnalyzeSentimentOutputSchema = z.object({
  sentiment: z.string().describe('The overall sentiment of the text (e.g., positive, negative, neutral).'),
  score: z.number().describe('A numerical score representing the sentiment strength, ranging from -1 (negative) to 1 (positive).'),
  explanation: z.string().describe('A brief explanation of why the text has the given sentiment.'),
});
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

export async function analyzeSentiment(input: AnalyzeSentimentInput): Promise<AnalyzeSentimentOutput> {
  return analyzeSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSentimentPrompt',
  input: {schema: AnalyzeSentimentInputSchema},
  output: {schema: AnalyzeSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following text:

  {{text}}

  Provide the overall sentiment (positive, negative, or neutral), a sentiment score between -1 and 1, and a brief explanation for your analysis.
  Format the output in JSON format according to the schema description.
  `,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
