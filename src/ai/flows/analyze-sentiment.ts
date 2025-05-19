
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
  prompt: `You are an expert sentiment analysis AI. Your goal is to perform meticulous, fair, and consistent sentiment analysis on the provided text, which is likely from a forum discussion (e.g., Hacker News) about a specific product, service, or topic.

Text to Analyze:
{{text}}

Sentiment Analysis Guidelines:

1.  **Focus of Analysis:**
    * Analyze the sentiment expressed specifically towards the primary subject of the text (e.g., a product, announcement, or specific topic being discussed).
    * Consider sentiment regarding its features, potential impact, company strategy related to it, and comparisons to direct competitors *in the context of the primary subject*.

2.  **Overall Sentiment Classification:** Determine if the text's sentiment towards the subject is predominantly 'Positive', 'Negative', 'Neutral', or 'Mixed'.
    * **Positive:** The text expresses clear approval, enthusiasm, satisfaction, identifies significant benefits/advantages, or offers constructive praise for the subject.
        * *Examples:* "Impressive update," "solves a major problem," "this is exciting," "a huge advantage."
    * **Negative:** The text expresses clear disapproval, criticism, skepticism, frustration, anger, sadness, or identifies significant drawbacks/disadvantages for the subject.
        * *Examples:* "This is disappointing," "major concern," "won't work," "awful experience," "yet another waitlist."
    * **Neutral:** The text is primarily factual, asks a question without loaded language, makes objective statements or comparisons, or lacks a strong emotional tone regarding the subject. It might describe features or situations without passing significant judgment.
        * *Examples:* "The product uses X technology," "It was announced on Tuesday," "How does this compare to Y?"
    * **Mixed:** The text contains both significant positive and negative elements regarding the subject, and these are relatively balanced or explicitly stated. The sentiment is not clearly one-sided.
        * *Examples:* "The new feature is powerful, but the privacy implications are worrying." "While I like the concept, the execution seems flawed."

3.  **Sentiment Score:** Provide a numerical score from -1.0 (most negative) to 1.0 (most positive).
    * **0.0 represents neutral.**
    * Scores around +/- 0.1 to +/- 0.4 indicate mild sentiment.
    * Scores around +/- 0.5 to +/- 0.7 indicate moderate sentiment.
    * Scores closer to +/- 0.8 to +/- 1.0 indicate strong sentiment.
    * For **'Mixed'** sentiment, the score should generally be closer to 0.0 (e.g., -0.2 to 0.2), reflecting the balance. The explanation is crucial to convey the mixed nature. If one aspect of the mixed sentiment is clearly dominant, the score can lean slightly in that direction.

4.  **Explanation (1-3 sentences):**
    * Briefly explain your reasoning for the sentiment classification and score.
    * Highlight specific words, phrases, or the overall context (e.g., sarcasm, technical critique) that led to your conclusions.
    * If 'Mixed', briefly state the conflicting sentiments.
    * Focus on an objective interpretation of the language used.

5.  **Specific Interpretation Considerations for Discussion Content:**
    * **Sarcasm/Rhetoric:** Identify and interpret sarcasm or rhetorical questions to determine the underlying sentiment (e.g., "Another game changer, right?" might be sarcastic and negative).
    * **Comparisons:** If the subject is compared favorably to a competitor, this leans positive. If compared unfavorably, it leans negative. Neutral if just stating differences.
    * **Frustration vs. Product Sentiment:** Frustration about access issues (e.g., waitlists, bugs in a beta) is generally negative. Try to distinguish if the negativity is about the access/current state or the core product/idea if the text allows.
    * **Technical Nuance:** Acknowledge that criticism can be technical and specific; this is still typically a negative sentiment regarding that aspect.
    * **Broader Criticisms:** If a comment critiques the company or industry broadly, determine if it directly implicates the specific subject of analysis. If so, factor it in.
    * **Privacy/Ethical Concerns:** Expressed concerns about privacy, data usage, or ethics related to the subject are generally negative.
    * **"Shiny Object" Fatigue/Overwhelm:** Comments expressing fatigue about many similar releases or an inability to keep up can imply a mild negative sentiment towards the subject's ability to stand out.

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

