"use client";

import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  getAnalysisDataAsMarkdown: () => string;
  pageTitle?: string | null;
  hasData: boolean;
  isLoading: boolean; // To disable while any initial fetch or all analyses are running
}

export function ActionButtons({ getAnalysisDataAsMarkdown, pageTitle, hasData, isLoading }: ActionButtonsProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = async () => {
    if (!hasData) {
        toast({ title: "No Data", description: "Please analyze a URL first to generate data.", variant: "destructive" });
        return;
    }
    const markdownData = getAnalysisDataAsMarkdown();
    try {
      await navigator.clipboard.writeText(markdownData);
      toast({ title: "Copied to Clipboard!", description: "Analysis results (Markdown) copied successfully." });
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy to clipboard. Your browser might not support this feature or permissions are denied.", variant: "destructive" });
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!hasData) {
        toast({ title: "No Data", description: "Please analyze a URL first to generate data.", variant: "destructive" });
        return;
    }
    const markdownData = getAnalysisDataAsMarkdown();
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const safePageTitle = pageTitle ? pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50) : 'analysis';
    const filename = `verbal_insights_${safePageTitle}_${timestamp}.md`;
    
    const blob = new Blob([markdownData], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Download Started", description: `${filename} is downloading.` });
    } else {
      toast({ title: "Download Failed", description: "Your browser does not support automatic downloads.", variant: "destructive" });
    }
  };

  const isDisabled = isLoading || !hasData;

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Export Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1" disabled={isDisabled} aria-label="Copy analysis to clipboard">
            <Copy className="mr-2 h-4 w-4" /> Copy as Markdown
          </Button>
          <Button onClick={handleDownloadMarkdown} variant="outline" className="flex-1" disabled={isDisabled} aria-label="Download analysis as Markdown file">
            <Download className="mr-2 h-4 w-4" /> Download .md File
          </Button>
        </div>
        {isDisabled && !isLoading && (
             <p className="mt-2 text-sm text-muted-foreground text-center">
                Analyze a URL to enable export options.
            </p>
        )}
      </CardContent>
    </Card>
  );
}

// Renamed Card related components to avoid conflicts if page uses them
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
