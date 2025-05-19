
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface UrlInputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string; // To sync with parent's URL state for refresh scenarios
}

export function UrlInputForm({ onSubmit, isLoading, initialUrl = '' }: UrlInputFormProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

  useEffect(() => {
    // Keep local state in sync if parent's URL changes (e.g., after refresh uses displayUrl)
    setCurrentUrl(initialUrl);
  }, [initialUrl]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (currentUrl.trim()) {
      let processedUrl = currentUrl.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }
      onSubmit(processedUrl);
    }
  };

  return (
    <Card className="mb-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Verbal Insights</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Paste a URL to analyze its discussion content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-grow w-full">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="url"
              placeholder="e.g., https://example.com/forum-post"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              className="pl-10 text-base h-12 rounded-md focus:ring-2 focus:ring-primary"
              required
              disabled={isLoading}
              aria-label="Website URL for analysis"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !currentUrl.trim()} 
            className={cn(
              "w-full sm:w-auto px-6 h-12 text-base rounded-md transition-all duration-150 ease-in-out",
              "hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isLoading ? "bg-muted text-muted-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <Zap className="mr-2 h-5 w-5" />
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
