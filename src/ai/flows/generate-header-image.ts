'use server';

/**
 * @fileOverview Generates an image inspired by the conversation to use as a header.
 *
 * - generateHeaderImage - A function that generates an image based on the provided text.
 * - GenerateHeaderImageInput - The input type for the generateHeaderImage function.
 * - GenerateHeaderImageOutput - The return type for the generateHeaderImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeaderImageInputSchema = z.object({
  text: z.string().describe('The text content to generate the image from.'),
});
export type GenerateHeaderImageInput = z.infer<typeof GenerateHeaderImageInputSchema>;

const GenerateHeaderImageOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image URL as a data URI.'),
});
export type GenerateHeaderImageOutput = z.infer<typeof GenerateHeaderImageOutputSchema>;

export async function generateHeaderImage(input: GenerateHeaderImageInput): Promise<GenerateHeaderImageOutput> {
  return generateHeaderImageFlow(input);
}

const generateHeaderImageFlow = ai.defineFlow(
  {
    name: 'generateHeaderImageFlow',
    inputSchema: GenerateHeaderImageInputSchema,
    outputSchema: GenerateHeaderImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate an artistic and abstract wide header image that visually represents the mood and themes of the following text, without directly including any text from the passage in the image: ${input.text}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {imageUrl: media.url!};
  }
);
