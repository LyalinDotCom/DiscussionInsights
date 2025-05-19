
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
  prompt: `You are an expert sentiment analysis AI. Analyze the sentiment of the following text.

Text to Analyze:
{{text}}

Sentiment Analysis Guidelines:
1.  **Overall Sentiment:** Determine if the text is predominantly 'positive', 'negative', or 'neutral'.
    *   **Positive:** Expresses happiness, approval, satisfaction, constructive feedback, or positive emotions.
    *   **Negative:** Expresses dissatisfaction, criticism, anger, sadness, problems, or negative emotions.
    *   **Neutral:** Presents factual information, objective statements, questions, or lacks strong emotional tone.
2.  **Sentiment Score:** Provide a numerical score from -1.0 (most negative) to 1.0 (most positive). 0.0 represents neutral. A score around +/- 0.5 indicates moderate sentiment, while scores closer to +/- 1.0 indicate strong sentiment.
3.  **Explanation:** Briefly explain your reasoning (1-2 sentences). Highlight specific words, phrases, or the overall context that led to your sentiment classification and score. Focus on objective interpretation of the language used.

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

