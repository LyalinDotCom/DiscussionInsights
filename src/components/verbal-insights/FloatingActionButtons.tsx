
"use client";

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonsProps {
  onRefresh: () => void;
  onCopyToClipboard: () => void;
  onDownloadMarkdown: () => void;
  canRefresh: boolean;
  exportButtonsDisabled: boolean;
  isLoading: boolean;
  isVisible: boolean;
}

export function FloatingActionButtons({
  onRefresh,
  onCopyToClipboard,
  onDownloadMarkdown,
  canRefresh,
  exportButtonsDisabled,
  isLoading,
  isVisible,
}: FloatingActionButtonsProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="fixed left-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3 p-2 bg-card/80 backdrop-blur-sm rounded-md shadow-lg border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={!canRefresh || isLoading}
              aria-label="Re-Analyze"
              className="hover:bg-accent/50"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Re-Analyze</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCopyToClipboard}
              disabled={exportButtonsDisabled}
              aria-label="Copy analysis to clipboard"
              className="hover:bg-accent/50"
            >
              <Copy className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Copy Markdown</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownloadMarkdown}
              disabled={exportButtonsDisabled}
              aria-label="Download analysis as Markdown file"
              className="hover:bg-accent/50"
            >
              <Download className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Download .md</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
