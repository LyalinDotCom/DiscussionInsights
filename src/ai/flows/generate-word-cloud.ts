
'use server';
/**
 * @fileOverview Generates data for a word cloud, focusing on brands and unique/significant terms from text content.
 *
 * - generateWordCloud - A function that processes text to extract word cloud data.
 * - GenerateWordCloudInput - The input type for the generateWordCloud function.
 * - GenerateWordCloudOutput - The return type for the generateWordCloud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWordCloudInputSchema = z.object({
  textContent: z.string().describe('The text content to analyze for word cloud generation.'),
});
export type GenerateWordCloudInput = z.infer<typeof GenerateWordCloudInputSchema>;

const WordCloudEntrySchema = z.object({
  text: z.string().describe('The word or phrase for the cloud.'),
  value: z.number().describe('A numerical score representing the importance or frequency of the word/phrase. Higher values are more significant.'),
});

const GenerateWordCloudOutputSchema = z.array(WordCloudEntrySchema).describe('An array of words/phrases and their corresponding values for the word cloud.');
export type GenerateWordCloudOutput = z.infer<typeof GenerateWordCloudOutputSchema>;

export async function generateWordCloud(input: GenerateWordCloudInput): Promise<GenerateWordCloudOutput> {
  return generateWordCloudFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordCloudPrompt',
  input: {schema: GenerateWordCloudInputSchema},
  output: {schema: GenerateWordCloudOutputSchema},
  prompt: `You are an expert text analyst specializing in identifying key terms for word clouds.
Given the following text content, extract up to 50 significant words or short phrases (2-3 words max).

Prioritize:
1.  Brand names and product names.
2.  Unique or technical terms relevant to the main topics.
3.  Words that appear frequently and are contextually important.

Exclude:
1.  Common English stop words (e.g., "the", "a", "is", "of", "and", "in", "to", "it", "this", "that").
2.  Generic verbs or adjectives unless they are part of a highly specific and relevant phrase.
3.  Words that are part of URLs or code snippets unless they represent a key concept.

For each extracted word/phrase, assign a 'value' (integer) from 1 to 100, where 100 represents the highest significance/frequency in the context of the provided text. The value should reflect its prominence and importance.

Text Content:
{{{textContent}}}

Format the output as a JSON array of objects, where each object has "text" and "value" properties.
Ensure the "value" is a numerical score.
Example: [{"text": "BrandX", "value": 90}, {"text": "data analysis", "value": 75}]
`,
});

const generateWordCloudFlow = ai.defineFlow(
  {
    name: 'generateWordCloudFlow',
    inputSchema: GenerateWordCloudInputSchema,
    outputSchema: GenerateWordCloudOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the output is an array, even if the LLM fails to produce valid JSON or an empty list
    return Array.isArray(output) ? output : [];
  }
);
