import { config } from 'dotenv';
config();

import '@/ai/flows/contextualize-links.ts';
import '@/ai/flows/analyze-sentiment.ts';
import '@/ai/flows/summarize-discussion.ts';
import '@/ai/flows/generate-header-image.ts';
import '@/ai/flows/extract-key-points.ts';