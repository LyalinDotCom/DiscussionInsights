
"use client";

import { Button } from '@/components/ui/button';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ActionButtonsProps {
  onRefresh: () => void;
  onCopyToClipboard: () => void;
  onDownloadMarkdown: () => void;
  canRefresh: boolean;
  exportButtonsDisabled: boolean;
  isLoading: boolean;
  hasData: boolean;
}

export function ActionButtons({ 
  onRefresh,
  onCopyToClipboard,
  onDownloadMarkdown,
  canRefresh,
  exportButtonsDisabled,
  isLoading,
  hasData
}: ActionButtonsProps) {

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            className="flex-1" 
            disabled={!canRefresh || isLoading} 
            aria-label="Refresh analysis for the current URL"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Re-Analyze
          </Button>
          <Button 
            onClick={onCopyToClipboard} 
            variant="outline" 
            className="flex-1" 
            disabled={exportButtonsDisabled} 
            aria-label="Copy analysis to clipboard"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Markdown
          </Button>
          <Button 
            onClick={onDownloadMarkdown} 
            variant="outline" 
            className="flex-1" 
            disabled={exportButtonsDisabled} 
            aria-label="Download analysis as Markdown file"
          >
            <Download className="mr-2 h-4 w-4" /> Download .md
          </Button>
        </div>
        {exportButtonsDisabled && !isLoading && !hasData && (
             <p className="mt-3 text-sm text-muted-foreground text-center sm:col-span-3">
                Analyze a URL to enable copy/download options.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
