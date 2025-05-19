
"use client";

import type { GenerateWordCloudOutput } from "@/ai/flows/generate-word-cloud";
import { cn } from "@/lib/utils";

interface WordCloudDisplayProps {
  data: GenerateWordCloudOutput | null;
  className?: string;
}

// Helper function to scale value to font size
const scaleValueToFontSize = (value: number, minSize = 12, maxSize = 36, maxValue = 100) => {
  if (value <= 0) return minSize;
  const scaled = minSize + ((value / maxValue) * (maxSize - minSize));
  return Math.min(Math.max(scaled, minSize), maxSize); // Clamp between min and max
};

// Helper function to get a color based on value (optional, for more visual flair)
// This is a very simple example; more sophisticated color mapping could be used.
const getColorFromValue = (value: number, maxValue = 100) => {
    const intensity = Math.min(1, value / maxValue);
    if (intensity > 0.75) return 'text-primary'; // Most important
    if (intensity > 0.5) return 'text-accent-foreground'; 
    if (intensity > 0.25) return 'text-foreground';
    return 'text-muted-foreground'; // Least important
  };

export function WordCloudDisplay({ data, className }: WordCloudDisplayProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">No word cloud data to display.</p>;
  }

  // Find min/max values in the current dataset for better scaling if needed, or use a fixed max (e.g., 100 from prompt)
  // const values = data.map(item => item.value);
  // const minValue = Math.min(...values);
  const maxValue = 100; // Assuming value is between 1-100 as per prompt

  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-2 items-center justify-center p-4 rounded-md bg-card", className)}>
      {data.map((item, index) => (
        <span
          key={index}
          className={cn(
            "transition-all duration-300 ease-in-out",
            getColorFromValue(item.value, maxValue)
          )}
          style={{
            fontSize: `${scaleValueToFontSize(item.value, 12, 48, maxValue)}px`,
            // fontWeight: item.value > maxValue * 0.6 ? 'bold' : 'normal', // Optional: make important words bold
            lineHeight: '1.2', // Adjust line height for densely packed words
          }}
          title={`Value: ${item.value}`} // Show value on hover
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}
