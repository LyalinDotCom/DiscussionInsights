
"use client";

import { Button } from '@/components/ui/button';
import { Copy, Download, RefreshCw, Camera } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ActionButtonsProps {
  onRefresh: () => void;
  onCopyToClipboard: () => void;
  onDownloadMarkdown: () => void;
  onDownloadScreenshot: () => void; // New prop
  canRefresh: boolean;
  exportButtonsDisabled: boolean;
  isLoading: boolean;
  isTakingScreenshot: boolean; // New prop
  hasData: boolean;
}

export function ActionButtons({ 
  onRefresh,
  onCopyToClipboard,
  onDownloadMarkdown,
  onDownloadScreenshot,
  canRefresh,
  exportButtonsDisabled,
  isLoading,
  isTakingScreenshot,
  hasData
}: ActionButtonsProps) {

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            className="flex-1" 
            disabled={!canRefresh || isLoading || isTakingScreenshot} 
            aria-label="Refresh analysis for the current URL"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Re-Analyze
          </Button>
          <Button 
            onClick={onCopyToClipboard} 
            variant="outline" 
            className="flex-1" 
            disabled={exportButtonsDisabled || isTakingScreenshot} 
            aria-label="Copy analysis to clipboard"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Markdown
          </Button>
          <Button 
            onClick={onDownloadMarkdown} 
            variant="outline" 
            className="flex-1" 
            disabled={exportButtonsDisabled || isTakingScreenshot} 
            aria-label="Download analysis as Markdown file"
          >
            <Download className="mr-2 h-4 w-4" /> Download .md
          </Button>
          <Button
            onClick={onDownloadScreenshot}
            variant="outline"
            className="flex-1"
            disabled={isLoading || isTakingScreenshot || !hasData}
            aria-label="Download screenshot of the current view"
          >
            <Camera className="mr-2 h-4 w-4" /> {isTakingScreenshot ? 'Capturing...' : 'Screenshot'}
          </Button>
        </div>
        {(exportButtonsDisabled || !hasData) && !isLoading && !isTakingScreenshot && (
             <p className="mt-3 text-sm text-muted-foreground text-center sm:col-span-full">
                Analyze a URL to enable export options.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
